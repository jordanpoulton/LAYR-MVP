import { open as openLoginModal } from "./login-modal.js";
import { getFromBackgroundPage } from "./utils.js";

const highlightButton = document.getElementById("toggle-button");
const closeButton = document.getElementById("close-button");
// const changeColorButton = document.getElementById("change-action-button");
const loginLogoutBtn = document.getElementById("login-logout-btn");
const username = document.getElementById("username");

const actionsListElement = document.getElementById("actions-list");
const defaultActionElement = document.getElementById("default-action");
const shortcutLinkElement = document.getElementById("shortcut-link");
const shortcutLinkTextElement = document.getElementById("shortcut-link-text");
const highlightsListElement = document.getElementById("highlights-list");

const highlightsErrorStateElement = document.getElementById(
  "highlights-list-error-state"
);
const highlightsListLostTitleElement = document.getElementById(
  "highlights-list-lost-title"
);
const highlightsOnThisPageTitleElement = document.getElementById(
  "highlights-on-this-page-title"
);
const noHighlightsOnThisPageTitleElement = document.getElementById(
  "no-highlights-on-this-page-title"
);
const noHighlightsOnOtherPagesTitleElement = document.getElementById(
  "no-highlights-on-other-pages-title"
);

async function actionChanged(action) {
  const actionOptions = await getFromBackgroundPage({
    action: "get-action-options",
  });

  const actionTitle = action.name;
  let actionImage = actionOptions.find(
    (actionOption) => actionOption.title === actionTitle
  ).actionImage;

  defaultActionElement.data = chrome.runtime.getURL(actionImage);
  defaultActionElement.name = actionTitle;

  // Change the global highlighter action
  chrome.runtime.sendMessage({
    action: "change-action",
    actionTitle,
    source: "popup",
  });
}

function toggleHighlighterCursor() {
  chrome.runtime.sendMessage(
    { action: "toggle-highlighter-cursor", source: "popup" },
    () => window.close()
  );
}

function orderHighlights() {
  highlightsListElement.querySelectorAll(".highlight").forEach((highlight) => {
    if (highlight.classList.contains("lost")) {
      // Move lost highlights to the end of the list
      highlight.remove();
      highlightsListElement.appendChild(highlight);
    }
  });
}

function hideTitles() {
  [
    highlightsOnThisPageTitleElement,
    highlightsListLostTitleElement,
    noHighlightsOnThisPageTitleElement,
    noHighlightsOnOtherPagesTitleElement,
  ].forEach((elem) => elem && elem.remove());
}

function showHighlightsTitles() {
  // First, clear any existing titles
  hideTitles();

  const highlights = highlightsListElement.querySelectorAll(".current");
  const lostHighlightElements = highlightsListElement.querySelectorAll(".lost");

  // If there are highlights on the current page, insert the title at the top
  highlightsListElement.insertBefore(
    highlightsOnThisPageTitleElement,
    highlightsListElement.firstChild // insert at the beginning
  );

  if (highlights.length <= 0 && lostHighlightElements.length <= 0) {
    // If no highlights on the current page, add the 'no highlights' title
    highlightsListElement.appendChild(noHighlightsOnThisPageTitleElement);
  }
  if (highlights.length <= 0 && lostHighlightElements.length > 0) {
    // If there are lost highlights, insert the lost highlights title before them
    highlightsListElement.insertBefore(
      noHighlightsOnThisPageTitleElement,
      lostHighlightElements[0] // insert before the first lost highlight
    );
  }

  // If there are lost highlights, insert the lost highlights title before them
  if (lostHighlightElements.length > 0) {
    highlightsListElement.insertBefore(
      highlightsListLostTitleElement,
      lostHighlightElements[0] // insert before the first lost highlight
    );
  } else {
    highlightsListElement.appendChild(highlightsListLostTitleElement);
    highlightsListElement.appendChild(noHighlightsOnOtherPagesTitleElement);
  }
}

function updateHighlightsListState() {
  orderHighlights();
  showHighlightsTitles();
}

function hideErrorState() {
  highlightsErrorStateElement.style.display = "none";
}
hideErrorState(); // Hide by default

function showErrorState() {
  hideTitles();
  highlightsErrorStateElement.style.display = "flex";
}

function truncateText(text, wordLimit) {
  const words = text.split(/\s+/); // Split the text into words
  if (words.length > wordLimit) {
    return words.slice(0, wordLimit).join(" ") + "..."; // Join the first 25 words and add ellipsis
  }
  return text; // Return the original text if it's short enough
}

(async function initializeHighlightsList() {
  let highlights = [];

  const { user } = await chrome.storage.sync.get({ user: {} });
  try {
    highlights = await getFromBackgroundPage(
      { action: "get-highlights" },
      false
    );
  } catch {
    showErrorState();
    return;
  }

  if (!Array.isArray(highlights) || highlights.length == 0) {
    updateHighlightsListState();
    return;
  }
  console.log("highlights", highlights);
  // Populate with new elements
  highlights.forEach((highlight) => {
    const newEl = document.createElement("div");
    newEl.classList.add("highlight", "current");
    newEl.innerHTML = `<strong>${highlight.user}:</strong> <span>${truncateText(
      highlight.text,
      25
    )}</span>`;
    newEl.addEventListener("click", () => {
      chrome.runtime.sendMessage({
        action: "show-highlight",
        highlightId: highlight.id,
      });
    });
    if (user?.username === highlight.user) {
      const newDeleteIconEl = document.createElement("span");
      newDeleteIconEl.classList.add("material-icons", "delete-icon");
      newDeleteIconEl.innerText = "delete";
      newDeleteIconEl.onclick = () => {
        chrome.runtime.sendMessage(
          { action: "remove-highlight", highlightId: highlight.id },
          () => {
            // newEl.remove();
            // updateHighlightsListState();
            alert("Highlight removed");
          }
        );
      };
      newEl.appendChild(newDeleteIconEl);
    }
    highlightsListElement.appendChild(newEl);
  });

  updateHighlightsListState();
})();

(async function initializeActionsList() {
  const actionOptions = await getFromBackgroundPage({
    action: "get-action-options",
  });

  actionOptions.forEach((action) => {
    const actionTitle = action.title;
    const actionElement = document.createElement("object");
    actionElement.type = "image/png";
    actionElement.classList.add("action");
    actionElement.name = actionTitle;
    actionElement.data = chrome.runtime.getURL(action.actionImage);
    actionElement.addEventListener("click", (e) => actionChanged(e.target));
    actionsListElement.appendChild(actionElement);
  });
})();

// Retrieve the shortcut for the highlight command from the Chrome settings and display it
(async function initializeShortcutLinkText() {
  const commands = await chrome.commands.getAll();
  commands.forEach((command) => {
    if (command.name === "execute-highlight") {
      if (command.shortcut) {
        shortcutLinkTextElement.textContent = command.shortcut;
      } else {
        shortcutLinkTextElement.textContent = "-";
      }
    }
  });
})();

(async function initializeDefaultActionSection() {
  const defaultAction = await getFromBackgroundPage({
    action: "get-default-action",
  });

  if (!defaultAction.title || !defaultAction.actionImage) {
    return;
  }

  defaultActionElement.data = chrome.runtime.getURL(defaultAction.actionImage);
  defaultActionElement.name = defaultAction.title;
})();

(async function initializeLostHighlights() {
  updateHighlightsListState();
  const lostHighlights = await getFromBackgroundPage({
    action: "get-lost-highlights",
  });
  const { user } = await chrome.storage.sync.get({ user: {} });

  if (!Array.isArray(lostHighlights) || lostHighlights.length == 0) {
    return;
  }

  // Populate with new elements
  lostHighlights.forEach((lostHighlight) => {
    if (!lostHighlight?.string) return;

    const newEl = document.createElement("div");
    newEl.classList.add("highlight", "lost");
    newEl.innerHTML = `<strong>${
      lostHighlight.userId
    }:</strong> <span>${truncateText(lostHighlight.string, 25)}</span>`;

    newEl.addEventListener("click", () => {
      chrome.runtime.sendMessage({
        action: "open-tab-and-show-highlight",
        data: {
          highlightId: lostHighlight.id,
          href: lostHighlight.href,
        },
      });
    });
    if (user?.username === lostHighlight.userId) {
      const newDeleteIconEl = document.createElement("span");
      newDeleteIconEl.classList.add("material-icons", "delete-icon");
      newDeleteIconEl.innerText = "delete";
      newDeleteIconEl.onclick = () => {
        chrome.runtime.sendMessage(
          { action: "remove-highlight", highlightId: lostHighlight.index },
          () => {
            newEl.remove();
            updateHighlightsListState();
          }
        );
      };
      newEl.appendChild(newDeleteIconEl);
    }
    highlightsListElement.appendChild(newEl);
  });

  updateHighlightsListState();
})();

(async function LoginLogout() {
  const { user } = await chrome.storage.sync.get("user");
  if (user && !!user.email && !!user.username) {
    username.style.display = "block";
    username.innerText = user.username;
    loginLogoutBtn.innerText = "Logout";
    loginLogoutBtn.addEventListener("click", () => {
      chrome.storage.sync.set({ user: null });
      location.reload(); // Force a refresh of the actions list in the popup
    });
  } else {
    username.style.display = "none";
    username.innerText = "";
    loginLogoutBtn.innerText = "Join the Conversation";
    loginLogoutBtn.addEventListener("click", openLoginModal);
  }
})();

// Register Events
highlightButton.addEventListener("click", toggleHighlighterCursor);

shortcutLinkElement.addEventListener("click", () => {
  // Open the shortcuts Chrome settings page in a new tab
  chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
});

closeButton.addEventListener("click", () => window.close());

// Register (in analytics) that the popup was opened
chrome.runtime.sendMessage({
  action: "track-event",
  trackCategory: "popup",
  trackAction: "opened",
});
