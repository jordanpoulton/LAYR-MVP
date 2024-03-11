import {
  getCurrentUser,
  getHighlightById,
  storeHighlightIdIntoLocalStorage,
  updateLikeCount,
} from "../utils/storageManager.js";

export async function onDislikeBtnClicked(currentHighlightEl) {
  const user = await getCurrentUser();
  if (!user) {
    showErrorModal("You must be logged in to comment on a highlight.");
    return;
  }
  const highlightId = currentHighlightEl.getAttribute("data-highlight-id");
  updateLikeCount(highlightId, false, user);
}

export async function onLikeBtnClicked(currentHighlightEl) {
  const user = await getCurrentUser();
  if (!user) {
    showErrorModal("You must be logged in to comment on a highlight.");
    return;
  }
  const highlightId = currentHighlightEl.getAttribute("data-highlight-id");
  updateLikeCount(highlightId, true, user);
}

export async function updateLikeDislikeCounts(highlightId) {
  const highlight = await getHighlightById(highlightId);
  const detailsBtn = document.getElementById("details-btn");
  detailsBtn.textContent = "View";
  detailsBtn.onclick = async () => {
    await storeHighlightIdIntoLocalStorage(highlightId);
    chrome.runtime.sendMessage({ action: "open_side_panel" });
    chrome.runtime.sendMessage({
      action: "update_highlight_details",
      highlightId,
    }); // Send new highlight ID to sidepanel
  };

  if (highlight) {
    document.getElementById("like-count").textContent = highlight.likes || 0;
    document.getElementById("dislike-count").textContent =
      highlight.dislikes || 0;
    document.getElementById("comment-count").textContent =
      highlight.commentsCount || 0;
  }
}

export function showErrorModal(message) {
  const modal = document.getElementById("errorModal");
  const span = document.getElementById("errorClose");
  const messageElement = document.getElementById("errorModalMessage");

  // Setting the error message
  messageElement.innerText = message;

  // Showing the modal
  modal.style.display = "block";

  // When the user clicks on <span> (x), close the modal
  span.onclick = function () {
    modal.style.display = "none";
  };

  // Also close the modal if the user clicks anywhere outside of the modal content
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
}
