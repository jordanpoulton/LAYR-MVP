export function initializeEventListeners() {
  document.getElementById("addCommentSection").style.display = "none"; // Hide the comment section by default

  document
    .getElementById("toggleCommentInputBtn")
    .addEventListener("click", () => {
      toggleAddCommentSection();
    });

  document.getElementById("commentBtn").addEventListener("click", () => {
    toggleAddCommentSection();
  });

  const toggleAddCommentSection = () => {
    const addCommentSection = document.getElementById("addCommentSection");
    if (addCommentSection.style.display === "none") {
      addCommentSection.style.display = "block";
    } else {
      addCommentSection.style.display = "none";
    }
  };
}
