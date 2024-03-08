import { getCurrentUser, getHighlightById, updateLikeCount } from "../utils/storageManager.js";

export async function onDislikeBtnClicked(currentHighlightEl) {
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

export async function onLikeBtnClicked(currentHighlightEl) {
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
