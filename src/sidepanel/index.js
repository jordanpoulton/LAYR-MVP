import { getHighlightById } from "./utils/utils";

const highlightDetailsDivEl = document.getElementById("highlight_details");
const highlightTextEl = document.getElementById("highlight_text");
const highlightCreatedByEl = document.getElementById("created_by");
const highlightCreatedAtEl = document.getElementById("created_at");

if (!highlightDetailsDivEl) {
  highlightDetailsDivEl.display = "none";
}

async function updateHighlightDetails(highlightId) {
  const highlight = await getHighlightById(highlightId);
  console.log("highlight", highlight);
  if (highlight) {
    // Existing code to update highlight details
    highlightDetailsDivEl.style.display = "block";
    highlightTextEl.innerText = highlight.string;
    highlightCreatedByEl.innerText = highlight.userId;
    highlightCreatedAtEl.innerText = new Date(
      highlight.createdAt
    ).toDateString();
    document.getElementById("like-count").textContent = highlight.likes || 0;
    document.getElementById("dislike-count").textContent =
      highlight.dislikes || 0;
    document.getElementById("comment-count").textContent =
      highlight.commentsCount || 0;

    // New code to populate comments
    const commentsDiv = document.getElementById("comments");
    commentsDiv.innerHTML = ""; // Clear existing comments
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
    alert("No Highlight found");
  }
}

const initalize = async () => {
  async function getSelectedHighlightId() {
    return chrome.storage.local.get("selectedHighlightId");
  }

  const { selectedHighlightId } = await getSelectedHighlightId();
  updateHighlightDetails(selectedHighlightId);
};

await initalize();
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "update_highlight_details") {
    updateHighlightDetails(message.highlightId);
  }
});
