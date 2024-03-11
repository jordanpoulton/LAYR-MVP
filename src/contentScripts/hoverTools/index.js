import { HIGHLIGHT_CLASS } from "../highlight/index.js";
import {
  onDislikeBtnClicked,
  onLikeBtnClicked,
  showErrorModal,
  updateLikeDislikeCounts,
} from "./hover-utils.js";
import { getCurrentUser } from "../utils/storageManager";

import {
  closeModal,
  createErrorModal,
  createModal,
  hideLoadingIndicator,
  openModal,
  showFeedback,
  showLoadingIndicator,
} from "./modal.js";

let hoverToolEl = null;
let hoverToolTimeout = null;
let currentHighlightEl = null;
let highlightClicked = false;
let likeBtn = null;
let dislikeBtn = null;
let commentBtnEl = null;

function resetCounts() {
  document.getElementById("like-count").textContent = "0";
  document.getElementById("dislike-count").textContent = "0";
  document.getElementById("comment-count").textContent = "0";
  document.getElementById("details-btn").textContent = "";
}

function initializeHoverTools() {
  $.get(chrome.runtime.getURL("../content_script/index.html"), (data) => {
    hoverToolEl = $(data);
    hoverToolEl.hide();
    hoverToolEl[0].addEventListener("mouseenter", onHoverToolMouseEnter);
    hoverToolEl[0].addEventListener("mouseleave", onHighlightMouseLeave);

    likeBtn = hoverToolEl.find(".highlighter--icon-like")[0];
    commentBtnEl = hoverToolEl.find(".highlighter--icon-comment")[0];
    dislikeBtn = hoverToolEl.find(".highlighter--icon-dislike")[0];
    likeBtn.addEventListener("click", () =>
      onLikeBtnClicked(currentHighlightEl)
    );
    commentBtnEl.addEventListener("click", () =>
      onCommentBtnClicked(currentHighlightEl)
    );
    dislikeBtn.addEventListener("click", () =>
      onDislikeBtnClicked(currentHighlightEl)
    );
    createModal();
    createErrorModal();
    initializeModalEvents(currentHighlightEl);
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
    resetCounts();
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

// Modify the submitComment export function
export async function submitComment(highlightId) {
  const submitButton = document.getElementById("submitComment");
  try {
    submitButton.disabled = true; // Disable the submit button
    showLoadingIndicator();

    const commentInput = document.getElementById("commentInput");
    const commentText = commentInput.value.trim();

    if (!commentText) {
      throw new Error("Comment text is empty.");
    }

    const user = await getCurrentUser();
    if (!user) {
      showFeedback("You must be logged in to comment.", false);
      return;
    }

    await chrome.runtime.sendMessage({
      action: "add-comment-to-highlight",
      payload: {
        uuid: highlightId,
        user,
        commentText,
      },
    });
    commentInput.value = ""; // Clear the input field
    showFeedback("Comment added successfully.");
    setTimeout(closeModal, 2000); // Close the modal after 2 seconds
  } catch (error) {
    showFeedback(error.message, false);
  } finally {
    hideLoadingIndicator();
    submitButton.disabled = false; // Re-enable the submit button
  }
}

// Initialize modal events
export function initializeModalEvents() {
  const closeButton = document.querySelector(".close");
  closeButton.onclick = closeModal;

  const submitButton = document.getElementById("submitComment");
  submitButton.onclick = () => {
    const highlightId = currentHighlightEl.getAttribute("data-highlight-id");
    submitComment(highlightId);
  };

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    const modal = document.getElementById("myModal");
    if (event.target == modal) {
      closeModal();
    }
  };
}

export async function onCommentBtnClicked() {
  const user = await getCurrentUser();
  if (!user) {
    showErrorModal("You must be logged in to comment on a highlight.");
    return;
  }

  // const highlightId = currentHighlightEl.getAttribute("data-highlight-id");
  // const highlight = await getHighlightById(highlightId);
  if (currentHighlightEl) {
    const highlightedText = currentHighlightEl.textContent.trim(); // Get the text content of the highlight
    openModal(highlightedText); // Open the modal with the highlighted text
  }
}

export {
  initializeHighlightEventListeners,
  initializeHoverTools,
  onHighlightMouseEnterOrClick,
  removeHighlightEventListeners,
};
