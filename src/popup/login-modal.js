import { getFromBackgroundPage, hexToRgb, rgbToHex } from "./utils.js";

const form = document.getElementById("login-form");
const cancelButton = document.getElementById("login-cancel");
// const emailField = document.querySelector('#login-form input[name="email"]');
// const usernameField = document.querySelector('#login-form input[name="username"]');
const modal = document.getElementById("login-modal");

async function open() {
  modal.style.display = "flex";
}

function close() {
  modal.style.display = "none";
}

function confirm(e) {
  e.preventDefault();

  const data = new FormData(e.target);
  const payload = {
    email: data.get("email"),
    username: data.get("username"),
  };
  chrome.runtime.sendMessage({ action: 'login-user', payload });
  chrome.storage.sync.set({ user: payload });
  location.reload(); // Force a refresh of the colors list in the popup
}

// Remove All and its confirmation modal:
form.addEventListener("submit", confirm);
cancelButton.addEventListener("click", close);

close(); // Trigger initially to hide the 'remove confirmation' section

export { open, close };
