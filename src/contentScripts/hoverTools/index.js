import { HIGHLIGHT_CLASS } from "../highlight/index.js";
import {
  addCommentToHighlight,
  getCurrentUser,
  getHighlightById,
  updateLikeCount,
} from "../utils/storageManager.js";

let hoverToolEl = null;
let hoverToolTimeout = null;
let currentHighlightEl = null;
let highlightClicked = false;
let likeBtn = null;
let dislikeBtn = null;
let commentBtnEl = null;

function initializeHoverTools() {
  $.get(chrome.runtime.getURL("../content_script/index.html"), (data) => {
    hoverToolEl = $(data);
    hoverToolEl.hide();
    hoverToolEl[0].addEventListener("mouseenter", onHoverToolMouseEnter);
    hoverToolEl[0].addEventListener("mouseleave", onHighlightMouseLeave);

    likeBtn = hoverToolEl.find(".highlighter--icon-like")[0];
    commentBtnEl = hoverToolEl.find(".highlighter--icon-comment")[0];
    dislikeBtn = hoverToolEl.find(".highlighter--icon-dislike")[0];
    likeBtn.addEventListener("click", onLikeBtnClicked);
    commentBtnEl.addEventListener("click", onCommentBtnClicked);
    dislikeBtn.addEventListener("click", onDislikeBtnClicked);
  });

  // Allow clicking outside of a highlight to unselect
  window.addEventListener("click", (e) => {
    if (e.target.classList?.contains(HIGHLIGHT_CLASS)) return;
    hide();
  });

  window.addEventListener("scroll", () => {
    if (highlightClicked) {
      moveToolbarToHighlight(currentHighlightEl);
    }
  });
}

function initializeHighlightEventListeners(highlightElement) {
  highlightElement.addEventListener("mouseenter", onHighlightMouseEnterOrClick);
  highlightElement.addEventListener("click", onHighlightMouseEnterOrClick);
  highlightElement.addEventListener("mouseleave", onHighlightMouseLeave);
}

function removeHighlightEventListeners(highlightElement) {
  highlightElement.removeEventListener(
    "mouseenter",
    onHighlightMouseEnterOrClick
  );
  highlightElement.removeEventListener("click", onHighlightMouseEnterOrClick);
  highlightElement.removeEventListener("mouseleave", onHighlightMouseLeave);
}

function getHoverToolEl() {
  if (!hoverToolEl.isConnected) {
    // The first time we want to show this element, append it to the DOM.
    // It's also possible the webpage deleted this node from the DOM. In that case, simply re-attach it
    hoverToolEl.appendTo("body");
  }

  return hoverToolEl;
}

function onHighlightMouseEnterOrClick(e) {
  const newHighlightEl = e.target;
  const newHighlightId = newHighlightEl.getAttribute("data-highlight-id");
  // If the previous action was a click but now it's a mouseenter, don't do anything
  if (highlightClicked && e.type !== "click") return;

  highlightClicked = e.type === "click";

  // Clear any previous timeout that would hide the toolbar, and
  if (hoverToolTimeout !== null) {
    clearTimeout(hoverToolTimeout);
    hoverToolTimeout = null;
    if (newHighlightId === currentHighlightEl.getAttribute("data-highlight-id"))
      return;
  }

  currentHighlightEl = newHighlightEl;

  // Position (and show) the hover toolbar above the highlight
  moveToolbarToHighlight(newHighlightEl, e.clientX);

  // Remove any previous borders and add a border to the highlight (by id) to clearly see what was selected
  updateLikeDislikeCounts(newHighlightId);
  $(".highlighter--hovered").removeClass("highlighter--hovered");
  $(`.${HIGHLIGHT_CLASS}[data-highlight-id='${newHighlightId}']`).addClass(
    "highlighter--hovered"
  );
}

async function updateLikeDislikeCounts(highlightId) {
  const highlight = await getHighlightById(highlightId);
  if (highlight) {
    document.getElementById("like-count").textContent = highlight.likes || 0;
    document.getElementById("dislike-count").textContent =
      highlight.dislikes || 0;
    document.getElementById("comment-count").textContent =
      highlight.commentsCount || 0;
  }
}

function onHighlightMouseLeave() {
  if (!highlightClicked) {
    hoverToolTimeout = setTimeout(hide, 170);
  }
}

function moveToolbarToHighlight(highlightEl, cursorX) {
  // cursorX is optional, in which case no change is made to the x position of the hover toolbar
  const boundingRect = highlightEl.getBoundingClientRect();
  const toolWidth = 108; // When changing this, also update the width in css #highlighter--hover-tools--container

  const hoverTop = boundingRect.top - 45;
  getHoverToolEl()?.css({ top: hoverTop });

  if (cursorX !== undefined) {
    let hoverLeft = null;
    if (boundingRect.width < toolWidth) {
      // center the toolbar if the highlight is smaller than the toolbar
      hoverLeft = boundingRect.left + boundingRect.width / 2 - toolWidth / 2;
    } else if (cursorX - boundingRect.left < toolWidth / 2) {
      // If the toolbar would overflow the highlight on the left, snap it to the left of the highlight
      hoverLeft = boundingRect.left;
    } else if (boundingRect.right - cursorX < toolWidth / 2) {
      // If the toolbar would overflow the highlight on the right, snap it to the right of the highlight
      hoverLeft = boundingRect.right - toolWidth;
    } else {
      // Else, center the toolbar above the cursor
      hoverLeft = cursorX - toolWidth / 2;
    }

    getHoverToolEl()?.css({ left: hoverLeft });
  }

  getHoverToolEl()?.show();
}

function hide() {
  $(".highlighter--hovered").removeClass("highlighter--hovered");
  getHoverToolEl()?.hide();
  hoverToolTimeout = null;
  highlightClicked = false;
}

function onHoverToolMouseEnter() {
  if (hoverToolTimeout !== null) {
    clearTimeout(hoverToolTimeout);
    hoverToolTimeout = null;
  }
}

async function onLikeBtnClicked() {
  const user = await getCurrentUser();
  if (!user) {
    alert("You must be logged in to like a highlight.");
    return;
  }
  const highlightId = currentHighlightEl.getAttribute("data-highlight-id");
  updateLikeCount(
    highlightId,
    window.location.hostname + window.location.pathname,
    window.location.pathname,
    true
  );
}

async function onDislikeBtnClicked() {
  const user = await getCurrentUser();
  if (!user) {
    alert("You must be logged in to dislike a highlight.");
    return;
  }
  const highlightId = currentHighlightEl.getAttribute("data-highlight-id");
  updateLikeCount(
    highlightId,
    window.location.hostname + window.location.pathname,
    window.location.pathname,
    false
  );
}

async function onCommentBtnClicked() {
  const user = await getCurrentUser();
  if (!user) {
    alert("You must be logged in to comment a highlight.");
    return;
  }

  const highlightId = currentHighlightEl.getAttribute("data-highlight-id");
  let comment = prompt("Comment here:");
  if (comment == null || comment == "") {
    console.log("User cancelled the comment prompt.");
  } else {
    console.log("Comment: " + comment, highlightId);
    await addCommentToHighlight(highlightId, user, comment);
  }
}

export {
  initializeHoverTools,
  initializeHighlightEventListeners,
  onHighlightMouseEnterOrClick,
  removeHighlightEventListeners,
};
