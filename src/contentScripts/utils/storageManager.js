/* eslint-disable function-paren-newline */
/* eslint-disable comma-dangle */
import { addHighlightError } from "./errorManager.js";

import { highlight } from "../highlight/index.js";
import { getFromBackgroundPage } from "./getFromBackgroundPage.js";
import { off, onValue, ref } from "firebase/database";
import { db } from "../../background/firebase-db/firebase.js";

const STORE_FORMAT_VERSION = chrome.runtime.getManifest().version;

const RED_COLOR = "#FF7F7F";
const GREEN_COLOR = "#44ff93";

let alternativeUrlIndexOffset = 0; // Number of elements stored in the alternativeUrl Key. Used to map highlight indices to correct key

async function store(
  selection,
  container,
  url,
  href,
  color,
  textColor,
  user,
  defaultActionTitle
) {
  const { highlights } = await chrome.storage.local.get({ highlights: {} });

  if (!highlights[url]) highlights[url] = [];

  const newHighlight = {
    version: STORE_FORMAT_VERSION,
    string: selection.toString(),
    container: getQuery(container),
    anchorNode: getQuery(selection.anchorNode),
    anchorOffset: selection.anchorOffset,
    focusNode: getQuery(selection.focusNode),
    focusOffset: selection.focusOffset,
    color,
    textColor,
    href,
    uuid: crypto.randomUUID(),
    createdAt: Date.now(),
    userId: user.username,
    likes: 0,
    likedBy: [""],
    dislikes: 0,
    dislikedBy: [""],
    comments: [],
    commentsCount: 0,
  };

  if (defaultActionTitle === "like") {
    newHighlight.likes = 1;
    newHighlight.likedBy.push(user.username);
  } else if (defaultActionTitle === "dislike") {
    newHighlight.dislikes = 1;
    newHighlight.dislikedBy.push(user.username);
  }

  chrome.runtime.sendMessage({
    action: "store-highlight-in-firebase",
    payload: newHighlight,
  }); // See src/background/firebase-db/highlights-actions.db.js for the implementation of

  // Return the index of the new highlight:
  return newHighlight.uuid;
}

async function addCommentToHighlight(uuid, user, commentText) {
  const highlight = await getHighlightById(uuid);

  if (!highlight) {
    console.error("Highlight not found to add comment");
    return;
  }

  const newComment = {
    text: commentText,
    user: user.username,
    createdAt: Date.now(),
  };

  if (highlight.comments) {
    highlight.comments.push(newComment);
    highlight.commentsCount += 1;
  } else {
    highlight.comments = [newComment];
    highlight.commentsCount = 1;
  }

  highlight.updatedAt = Date.now();
  // await chrome.storage.local.set({ highlights });
  chrome.runtime.sendMessage({
    action: "store-highlight-in-firebase",
    payload: highlight,
  }); // See src/background/firebase-db/highlights-actions.db.js for the implementation of
}

async function updateLikeCount(highlightIndex, url, alternativeUrl, like) {
  const [{ highlights }, user, highlightObject] = await Promise.all([
    chrome.storage.local.get({ highlights: {} }),
    getCurrentUser(),
    getHighlightById(highlightIndex),
  ]);

  if (!user) {
    alert("You need to be logged in to have interactions with highlights.");
    return;
  }

  if (highlightObject) {
    const alreadyLiked = highlightObject?.likedBy?.includes(user.username);
    const alreadyDisliked = highlightObject?.dislikedBy?.includes(
      user.username
    );

    if (like) {
      if (alreadyLiked) return; // User already liked this highlight

      // Remove dislike if previously disliked
      if (alreadyDisliked) {
        highlightObject.dislikedBy = highlightObject.dislikedBy.filter(
          (username) => username !== user.username
        );
        highlightObject.dislikes = Math.max(highlightObject.dislikes - 1, 0);
      }

      // Add like
      highlightObject.likes += 1;
      highlightObject.likedBy.push(user.username);
    } else {
      if (alreadyDisliked) return; // User already disliked this highlight

      // Remove like if previously liked
      if (alreadyLiked) {
        highlightObject.likedBy = highlightObject.likedBy.filter(
          (username) => username !== user.username
        );
        highlightObject.likes = Math.max(highlightObject.likes - 1, 0);
      }

      // Add dislike
      highlightObject.dislikes += 1;
      highlightObject.dislikedBy.push(user.username);
    }

    if (highlightObject.likes > highlightObject.dislikes) {
      highlightObject.color = GREEN_COLOR;
      highlightObject.textColor = "black";
    } else if (highlightObject.likes < highlightObject.dislikes) {
      highlightObject.color = RED_COLOR;
      highlightObject.textColor = "black";
    }

    highlightObject.updatedAt = Date.now();
    await chrome.storage.local.set({ highlights });
    chrome.runtime.sendMessage({
      action: "store-highlight-in-firebase",
      payload: highlightObject,
    }); // See src/background/firebase-db/highlights-actions.db.js for the implementation of
    const existingHighlight = $(
      `.highlighter--highlighted[data-highlight-id='${highlightIndex}']`
    );
    $(".highlighter--hovered").removeClass("highlighter--hovered");

    existingHighlight.css("backgroundColor", highlightObject.color); // Change the background color attribute
    existingHighlight.css("color", highlightObject.textColor); // Also change the text color
  }
}

async function getCurrentUser() {
  const { user } = await chrome.storage.sync.get({ user: {} });
  return user;
}

async function getHighlightById(uuid) {
  const highlight = await getFromBackgroundPage({
    action: "get-highlight-by-id",
    uuid,
  });
  if (highlight) {
    return highlight;
  }

  return null; // Return null if no match is found
}

async function update(
  highlightIndex,
  url,
  alternativeUrl,
  newColor,
  newTextColor
) {
  const { highlights } = await chrome.storage.local.get({ highlights: {} });

  let urlToUse = url;
  let indexToUse = highlightIndex - alternativeUrlIndexOffset;
  if (highlightIndex < alternativeUrlIndexOffset) {
    urlToUse = alternativeUrl;
    indexToUse = highlightIndex;
  }

  const highlightsInKey = highlights[urlToUse];
  if (highlightsInKey) {
    const highlightObject = highlightsInKey[indexToUse];
    if (highlightObject) {
      highlightObject.color = newColor;
      highlightObject.textColor = newTextColor;
      highlightObject.updatedAt = Date.now();
      chrome.storage.local.set({ highlights });
    }
  }
}

async function setupFirebaseListeners(url, callback) {
  const urlRef = ref(db, "highlights/");

  // Listener for changes in the highlights
  onValue(urlRef, (snapshot) => {
    const highlights = snapshot.val() ? Object.values(snapshot.val()) : [];
    callback(highlights);
  });

  // Return a function to detach the listener when no longer needed
  return () => off(urlRef);
}

async function loadAll(url, alternativeUrl) {
  // Setup listeners for the main URL
  const detachMainUrlListener = await setupFirebaseListeners(
    url,
    (highlights) => {
      if (!highlights) return [];
      // Load highlights for the main URL
      highlights.forEach((highlight) => {
        load(highlight, highlight.uuid, highlight?.userId);
      });
    }
  );

  let detachAlternativeUrlListener;
  if (alternativeUrl) {
    // Setup listeners for the alternative URL
    detachAlternativeUrlListener = await setupFirebaseListeners(
      alternativeUrl,
      (highlights) => {
        if (!highlights) return [];
        // Load highlights for the alternative URL
        highlights.forEach((highlight) => {
          load(highlight, highlight.uuid, highlight?.userId);
        });
      }
    );
  }

  // Return a function to detach listeners when no longer needed
  return () => {
    detachMainUrlListener();
    if (detachAlternativeUrlListener) {
      detachAlternativeUrlListener();
    }
  };
}

// noErrorTracking is optional
function load(highlightVal, highlightIndex, username, noErrorTracking) {
  const selection = {
    anchorNode: elementFromQuery(highlightVal.anchorNode),
    anchorOffset: highlightVal.anchorOffset,
    focusNode: elementFromQuery(highlightVal.focusNode),
    focusOffset: highlightVal.focusOffset,
  };

  const { color, string: selectionString, textColor, version } = highlightVal;
  const container = elementFromQuery(highlightVal.container);

  if (!selection.anchorNode || !selection.focusNode || !container) {
    if (!noErrorTracking) {
      addHighlightError(highlightVal, highlightIndex);
    }
    return false;
  }
  const success = highlight(
    username,
    selectionString,
    container,
    selection,
    color,
    textColor,
    highlightIndex,
    version
  );

  if (!noErrorTracking && !success) {
    addHighlightError(highlightVal, highlightIndex);
  }
  return success;
}

async function removeHighlight(highlightIndex, url, alternativeUrl) {
  const { highlights } = await chrome.storage.local.get({ highlights: {} });

  if (highlightIndex < alternativeUrlIndexOffset) {
    highlights[alternativeUrl].splice(highlightIndex, 1);
  } else {
    highlights[url].splice(highlightIndex - alternativeUrlIndexOffset, 1);
  }

  chrome.storage.local.set({ highlights });
}

// alternativeUrl is optional
async function clearPage(url, alternativeUrl) {
  const { highlights } = await chrome.storage.local.get({ highlights: {} });

  delete highlights[url];
  if (alternativeUrl) {
    // See 'loadAll()' for an explaination of why this is necessary
    delete highlights[alternativeUrl];
  }

  chrome.storage.local.set({ highlights });
}

function elementFromQuery(storedQuery) {
  const re = />textNode:nth-of-type\(([0-9]+)\)$/iu;
  const result = re.exec(storedQuery);

  if (result) {
    // For text nodes, nth-of-type needs to be handled differently (not a valid CSS selector)
    const textNodeIndex = parseInt(result[1], 10);
    storedQuery = storedQuery.replace(re, "");
    const parent = robustQuerySelector(storedQuery);

    if (!parent) return undefined;

    return parent.childNodes[textNodeIndex];
  }

  return robustQuerySelector(storedQuery);
}

function robustQuerySelector(query) {
  try {
    return document.querySelector(query);
  } catch (error) {
    // It is possible that this query fails because of an invalid CSS selector that actually exists in the DOM.
    // This was happening for example here: https://lawphil.net/judjuris/juri2013/sep2013/gr_179987_2013.html
    // where there is a tag <p"> that is invalid in HTML5 but was still rendered by the browser
    // In this case, manually find the element:
    let element = document;
    for (const queryPart of query.split(">")) {
      if (!element) return null;

      const re = /^(.*):nth-of-type\(([0-9]+)\)$/iu;
      const result = re.exec(queryPart);
      const [, tagName, index] = result || [undefined, queryPart, 1];
      element = Array.from(element.childNodes).filter(
        (child) => child.localName === tagName
      )[index - 1];
    }
    return element;
  }
}

// From an DOM element, get a query to that DOM element
function getQuery(element) {
  if (element.id) return `#${escapeCSSString(element.id)}`;
  if (element.localName === "html") return "html";

  const parent = element.parentNode;

  const parentSelector = getQuery(parent);
  // The element is a text node
  if (!element.localName) {
    // Find the index of the text node:
    const index = Array.prototype.indexOf.call(parent.childNodes, element);
    return `${parentSelector}>textNode:nth-of-type(${index})`;
  } else {
    const index =
      Array.from(parent.childNodes)
        .filter((child) => child.localName === element.localName)
        .indexOf(element) + 1;
    return `${parentSelector}>${element.localName}:nth-of-type(${index})`;
  }
}

// Colons and spaces are accepted in IDs in HTML but not in CSS syntax
// Similar (but much more simplified) to the CSS.escape() working draft
function escapeCSSString(cssString) {
  return cssString.replace(/(:)/gu, "\\$1");
}

export {
  clearPage,
  getCurrentUser,
  getHighlightById,
  load,
  loadAll,
  removeHighlight,
  store,
  update,
  updateLikeCount,
  addCommentToHighlight,
};
