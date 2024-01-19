import {
  getFromBackgroundPage,
  validateEmail,
  validateUsername,
} from "./utils";

const form = document.getElementById("signup-form");
const cancelButton = document.getElementById("signup-cancel");
const modal = document.getElementById("signup-modal");
const emailInputEl = document.getElementById("signup-email");
const usernameInputEl = document.getElementById("signup-username");
const emailStatusEl = document.getElementById("signup-email-status");
const usernameStatusEl = document.getElementById("signup-username-status");
const signupSubmitBtn = document.getElementById("signup-submit");
let emailValidationFailed = false;
let usernameValidationFailed = false;

const onEmailInput = async (e) => {
  const emailValue = e.target.value;
  if (!validateEmail(emailValue) && emailValue.length > 0) {
    emailStatusEl.innerText = "Invalid email";
    emailStatusEl.style.color = "red";
    emailValidationFailed = true;
    return;
  }

  try {
    emailStatusEl.innerText = "loading...";
    const response = await getFromBackgroundPage({
      action: "find-user-by-email",
      email: emailValue,
    });
    if (response) {
      emailStatusEl.innerText = "Email already taken";
      emailStatusEl.style.color = "red";
      emailValidationFailed = false;
    } else {
      emailStatusEl.innerText = "email available";
      emailStatusEl.style.color = "green";
      emailValidationFailed = false;
    }
  } catch (e) {
    emailStatusEl.innerText = "Error finding email, please contact support";
    emailStatusEl.style.color = "red";
    emailValidationFailed = true;
  }
};

const onUsernameInput = async (e) => {
  const usernameValue = e.target.value;
  if (!validateUsername(usernameValue) && usernameValue.length > 0) {
    usernameStatusEl.innerText = "Invalid username";
    usernameStatusEl.style.color = "red";
    usernameValidationFailed = true;
    return;
  }

  try {
    signupSubmitBtn.style.cursor = "wait";
    signupSubmitBtn.disabled = true;
    usernameStatusEl.innerText = "loading...";
    const response = await getFromBackgroundPage({
      action: "find-user-by-username",
      username: usernameValue,
    });
    if (response) {
      usernameStatusEl.innerText = "Username already taken";
      usernameStatusEl.style.color = "red";
      usernameValidationFailed = true;
    } else {
      usernameStatusEl.innerText = "username available";
      usernameStatusEl.style.color = "green";
      usernameValidationFailed = false;
    }
  } catch (e) {
    console.log(e);
    usernameStatusEl.innerText =
      "Error finding username, please contact support";
    usernameStatusEl.style.color = "red";
    usernameValidationFailed = true;
  } finally {
    signupSubmitBtn.style.cursor = "pointer";
    signupSubmitBtn.disabled = false;
  }
};

async function open() {
  modal.style.display = "flex";
  emailInputEl.oninput = onEmailInput;

  usernameInputEl.oninput = onUsernameInput;
}

function close() {
  modal.style.display = "none";
}

async function confirm(e) {
  e.preventDefault();

  try {
    const data = new FormData(e.target);

    if (emailValidationFailed || usernameValidationFailed) {
      return;
    }
    const payload = {
      email: data.get("email"),
      username: data.get("username"),
    };
    const user = await getFromBackgroundPage({
      action: "signup-user",
      payload,
    });
    chrome.storage.sync.set({ user });
    location.reload(); // Force a refresh of the colors list in the popup
  } catch (e) {
    console.log(e);
  }
}

// Remove All and its confirmation modal:
form.addEventListener("submit", confirm);
cancelButton.addEventListener("click", close);

close(); // Trigger initially to hide the 'remove confirmation' section

export { close, open };
