export function openModal(highlightText) {
  const modal = document.getElementById("myModal");
  const highlightedTextContainer = document.getElementById("highlightedText");
  const commentInput = document.getElementById("commentInput");
  const feedbackElement = document.getElementById("modalFeedback");
  const submitButton = document.getElementById("submitComment");

  // Set the highlighted text for context
  highlightedTextContainer.textContent = `Comment on: "${highlightText}"`;

  // Clear the input field and feedback message
  commentInput.value = "";
  feedbackElement.textContent = "";

  // Ensure the submit button is enabled
  submitButton.disabled = false;

  // Show the modal
  modal.style.display = "block";
}

export function closeModal() {
  const modal = document.getElementById("myModal");
  const commentInput = document.getElementById("commentInput");
  const feedbackElement = document.getElementById("modalFeedback");
  const submitButton = document.getElementById("submitComment");

  // Clear the input field and feedback message
  commentInput.value = "";
  feedbackElement.textContent = "";

  // Re-enable the submit button in case it was disabled
  submitButton.disabled = false;

  // Hide the modal
  modal.style.display = "none";
}

// Show feedback message export function
export function showFeedback(message, isSuccess = true) {
  const feedbackElement = document.getElementById("modalFeedback");
  feedbackElement.textContent = message;
  feedbackElement.className = `modal-feedback ${
    isSuccess ? "success" : "error"
  }`;
}

export function createModal() {
  const modalHTML = `
      <div id="myModal" class="modal">
        <div class="modal-content">
          <span class="close">&times;</span>
          <h2>Join the Conversation</h2>
          <div class="modal-header">
            <h3>Comment via LAYR</h3>
          </div>
          <div id="highlightedText" class="highlighted-text"></div>
          <textarea id="commentInput" placeholder="Enter your comment here"></textarea>
          <button id="submitComment">Submit</button>
          <div id="modalFeedback" class="modal-feedback"></div> <!-- Container for feedback messages -->
        </div>
      </div>
      <div id="loadingIndicator" class="loading-indicator" style="display: none;">
        Please wait...
      </div>
    `;
  document.body.insertAdjacentHTML("beforeend", modalHTML);
}

export function createErrorModal() {
  const modalHTML = `
    <div id="errorModal" class="modal">
      <div class="modal-content">
        <span id="errorClose" class="errorClose">&times;</span>
        <div class="modal-header">
          <h3>LAYR</h3>
        </div>
        <p id="errorModalMessage">You must be logged in to comment on a highlight.</p>
      </div>
    </div>
    `;
  document.body.insertAdjacentHTML("beforeend", modalHTML);
}

export function showLoadingIndicator() {
  document.getElementById("loadingIndicator").style.display = "block";
}

export function hideLoadingIndicator() {
  document.getElementById("loadingIndicator").style.display = "none";
}
