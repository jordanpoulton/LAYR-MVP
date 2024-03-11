import { initializeEventListeners } from "./utils/eventListeners.js";
import {
  addCommentToHighlight,
  getCurrentUser,
  getHighlightById,
  handleLikeDislikeClick,
} from "./utils/utils.js"; // Ensure these imports are correct based on your project structure

const highlightDetailsDivEl = document.getElementById("highlight_details");
const highlightTextEl = document.getElementById("highlight_text");
const highlightCreatedByEl = document.getElementById("created_by");
const highlightCreatedAtEl = document.getElementById("created_at");

let currentHighlightId = null; // Store the current highlight ID globally

initializeEventListeners();

document
  .getElementById("submitCommentBtn")
  .addEventListener("click", async () => {
    const commentText = document.getElementById("newCommentText").value.trim();
    if (!commentText) {
      alert("Please enter a comment before posting.");
      return;
    }

    const user = await getCurrentUser();
    if (!user) {
      // Prompt the user to log in
      alert("You must be logged in to post comments.");
      return;
    }

    try {
      // Assume `addCommentToHighlight` is a function to submit the comment
      await addCommentToHighlight(currentHighlightId, { user, commentText });
      document.getElementById("newCommentText").value = ""; // Clear the textarea
      alert("Comment posted successfully.");
      await updateHighlightDetails(currentHighlightId);
      // Optionally, refresh comments to display the newly added one
    } catch (error) {
      console.error("Error posting comment:", error);
      alert("Failed to post comment. Please try again.");
    }
  });

async function updateHighlightDetails(highlightId) {
  currentHighlightId = highlightId; // Update the global highlight ID
  const highlight = await getHighlightById(highlightId);
  const likeBtn = document.getElementById("likeBtn");
  const dislikeBtn = document.getElementById("dislikeBtn");

  if (highlight) {
    highlightDetailsDivEl.style.display = "block";
    highlightTextEl.innerText = highlight.string;
    highlightCreatedByEl.innerText = highlight.userId;
    highlightCreatedAtEl.innerText = new Date(
      highlight.createdAt
    ).toDateString();
    document.getElementById("like-count").textContent = highlight.likes || "0";
    document.getElementById("dislike-count").textContent =
      highlight.dislikes || "0";

    likeBtn.addEventListener("click", async () => {
      handleLikeDislikeClick(highlightId, true);
      updateHighlightDetails(highlightId);
    });

    dislikeBtn.addEventListener("click", async () => {
      handleLikeDislikeClick(highlightId, false);
      updateHighlightDetails(highlightId);
    });

    document.getElementById("comment-count").textContent =
      highlight.commentsCount || "0";
    // Make sure elements exist before adding event listeners

    // likeBtn.addEventListener("click", () => handleLikeDislike(true, highlight));
    // dislikeBtn.addEventListener("click", () => handleLikeDislike(false, highlight));
    // commentBtn.addEventListener("click", () => handleComment());

    const commentsDiv = document.getElementById("comments");
    commentsDiv.innerHTML = ""; // Reset comments
    if (highlight.comments && highlight.comments.length) {
      highlight.comments.forEach((comment) => {
        const commentEl = document.createElement("div");
        commentEl.className = "highlight_comment";
        commentEl.innerHTML = `
          <div class="comment_user">${comment.user}</div>
          <div class="comment_text">${comment.text}</div>
          <div class="comment_date">${new Date(
            comment.createdAt
          ).toLocaleString()}</div>
        `;
        commentsDiv.appendChild(commentEl);
      });
    } else {
      commentsDiv.innerHTML = `<div class="no_comments">No comments yet</div>`;
    }
  } else {
    alert("No Highlight found");
  }
}

// Initialize the side panel by fetching the highlight ID from storage
async function initialize() {
  const result = await chrome.storage.local.get("selectedHighlightId");
  if (result.selectedHighlightId) {
    updateHighlightDetails(result.selectedHighlightId);
  }
}

// Listen for messages to update highlight details
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "update_highlight_details" && message.highlightId) {
    updateHighlightDetails(message.highlightId);
  }
});

initialize(); // Removed 'await' as top-level await is not allowed here
