import { getFromBackgroundPage } from "./getFromBackgroundPage";

async function getCurrentUser() {
  return getFromBackgroundPage({ action: "get-current-user" });
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

async function addCommentToHighlight(highlightId, { user, commentText }) {
  // Placeholder for your implementation
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        action: "add-comment-to-highlight",
        payload: {
          uuid: highlightId,
          user,
          commentText,
        },
      },
      (response) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error || "Unknown error"));
        }
      }
    );
  });
}

export { addCommentToHighlight, getCurrentUser, getHighlightById };
