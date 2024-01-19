const form = document.getElementById("login-form");
const signupButton = document.getElementById("signup-btn");
import { open as openSignupModal } from "./signup-modal";
import { close as closeSignupModal } from "./signup-modal";
import {
  getFromBackgroundPage,
  validateEmail,
  validateUsername,
} from "./utils";
const cancelButton = document.getElementById("login-cancel");
// const emailField = document.querySelector('#login-form input[name="email"]');
// const usernameField = document.querySelector('#login-form input[name="username"]');
const modal = document.getElementById("login-modal");
const emailInputEl = document.getElementById("login-email");
const usernameInputEl = document.getElementById("login-username");
const emailStatusEl = document.getElementById("login-email-status");
const usernameStatusEl = document.getElementById("login-username-status");
const loginSubmitBtn = document.getElementById("login-submit");
let emailValidationFailed = false;
let usernameValidationFailed = false;
const loginErrorEl = document.getElementById("login-error");

const onEmailInput = async (e) => {
  const emailValue = e.target.value;

  if (emailValue.length > 0 && !validateEmail(emailValue)) {
    emailStatusEl.innerText = "Invalid email";
    emailValidationFailed = true;
    return;
  }

  emailStatusEl.innerText = "";
  emailValidationFailed = false;
  return;
};

const onUsernameInput = async (e) => {
  const usernameValue = e.target.value;

  if (usernameValue.length > 0 && !validateUsername(usernameValue)) {
    usernameStatusEl.innerText = "Invalid username";
    usernameValidationFailed = true;
    return;
  }
  usernameStatusEl.innerText = "";
  usernameValidationFailed = false;
  return;
};

function open() {
  modal.style.display = "flex";
  emailInputEl.oninput = onEmailInput;
  signupButton.onclick = openSignupModal;
  usernameInputEl.oninput = onUsernameInput;
}

function close() {
  modal.style.display = "none";
}

async function confirm(e) {
  e.preventDefault();

  if (usernameValidationFailed || emailValidationFailed) {
    loginErrorEl.innerText = "Invalid username or email";
    return;
  }

  const data = new FormData(e.target);
  const payload = {
    email: data.get("email"),
    username: data.get("username"),
  };
  try {
    loginSubmitBtn.style.cursor = "wait";
    loginSubmitBtn.disabled = true;
    const user = await getFromBackgroundPage(
      { action: "login-user", payload },
      false
    );
    chrome.storage.sync.set({ user });
    location.reload(); // Force a refresh of the colors list in the popup
  } catch (err) {
    loginErrorEl.innerText = err;
  } finally {
    loginSubmitBtn.style.cursor = "pointer";
    loginSubmitBtn.disabled = false;
  }
}

// Remove All and its confirmation modal:
form.addEventListener("submit", confirm);
cancelButton.addEventListener("click", close);

close(); // Trigger initially to hide the 'remove confirmation' section
closeSignupModal();

export { close, open };
