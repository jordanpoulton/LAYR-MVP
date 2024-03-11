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

export async function handleLikeDislikeClick(highlightIndex, like) {
  const user = await getCurrentUser();
  if (!user) {
    alert("You must be logged in to like/dislike highlights.");
    return;
  }

  await updateLikeCount(highlightIndex, like, user);
}

export async function updateLikeCount(highlightIndex, like, user) {
  const [highlightObject] = await Promise.all([
    getHighlightById(highlightIndex),
  ]);

  if (!highlightObject) {
    alert("Highlight not found");
    return;
  }

  if (highlightObject) {
    const newHighlightObject = await getFromBackgroundPage({
      action: "update-highlight-like-dislike-count",
      payload: {
        highlightId: highlightIndex,
        like,
        user,
      },
    });
    document.getElementById("like-count").textContent =
      newHighlightObject.likes || "0";
    document.getElementById("dislike-count").textContent =
      newHighlightObject.dislikes || "0";
  }
}

export { addCommentToHighlight, getCurrentUser, getHighlightById };
