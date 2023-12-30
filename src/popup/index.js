import { open as openChangeColorModal } from "./change-color-modal.js";
import { open as openLoginModal } from "./login-modal.js";
import { getFromBackgroundPage } from "./utils.js";

const highlightButton = document.getElementById("toggle-button");
const closeButton = document.getElementById("close-button");
const changeColorButton = document.getElementById("change-color-button");
const loginLogoutBtn = document.getElementById("login-logout-btn");
const username = document.getElementById("username");

const colorsListElement = document.getElementById("colors-list");
const selectedColorElement = document.getElementById("selected-color");
const shortcutLinkElement = document.getElementById("shortcut-link");
const shortcutLinkTextElement = document.getElementById("shortcut-link-text");
const highlightsListElement = document.getElementById("highlights-list");
const highlightsEmptyStateElement = document.getElementById(
  "highlights-list-empty-state"
);
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

function colorChanged(colorOption) {
  const { backgroundColor, borderColor } = colorOption.style;
  const { colorTitle } = colorOption.dataset;

  // Swap (in the UI) the previous selected color and the newly selected one
  const {
    backgroundColor: previousBackgroundColor,
    borderColor: previousBorderColor,
  } = selectedColorElement.style;
  const { colorTitle: previousColorTitle } = selectedColorElement.dataset;
  colorOption.style.backgroundColor = previousBackgroundColor;
  colorOption.style.borderColor = previousBorderColor;
  colorOption.dataset.colorTitle = previousColorTitle;
  selectedColorElement.style.backgroundColor = backgroundColor;
  selectedColorElement.style.borderColor = borderColor;
  selectedColorElement.dataset.colorTitle = colorTitle;

  // Change the global highlighter color
  chrome.runtime.sendMessage({
    action: "change-color",
    color: colorTitle,
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

function showHighlightsTitles() {
  // First, clear any existing titles
  [
    highlightsOnThisPageTitleElement,
    highlightsListLostTitleElement,
    noHighlightsOnThisPageTitleElement,
    noHighlightsOnOtherPagesTitleElement,
  ].forEach((elem) => elem && elem.remove());

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
  if(highlights.length <= 0 && lostHighlightElements.length > 0) {
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

  // // If there are lost highlights, insert the lost highlights title before them
  // if (lostHighlightElements.length <= 0) {
  //   // If no lost highlights on other pages, add the 'no highlights' title
  //   highlightsListElement.appendChild(noHighlightsOnOtherPagesTitleElement);
  // }
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
  highlightsErrorStateElement.style.display = "flex";
  highlightsEmptyStateElement.style.display = "none"; // Also hide the empty state
}

(async function initializeHighlightsList() {
  let highlights = [];
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

  // Populate with new elements
  highlights.forEach(([highlightId, highlightText]) => {
    const newEl = document.createElement("div");
    newEl.classList.add("highlight", "current");
    newEl.innerText = highlightText;
    newEl.addEventListener("click", () => {
      chrome.runtime.sendMessage({ action: "show-highlight", highlightId });
    });
    highlightsListElement.appendChild(newEl);
  });

  updateHighlightsListState();
})();

(async function initializeColorsList() {
  const color = await getFromBackgroundPage({ action: "get-current-color" });
  const colorOptions = await getFromBackgroundPage({
    action: "get-color-options",
  });

  colorOptions.forEach((colorOption) => {
    const colorTitle = colorOption.title;
    const selected = colorTitle === color.title;
    const colorOptionElement = selected
      ? selectedColorElement
      : document.createElement("div");

    colorOptionElement.classList.add("color");
    colorOptionElement.dataset.colorTitle = colorTitle;
    colorOptionElement.style.backgroundColor = colorOption.color;
    if (colorOption.textColor)
      colorOptionElement.style.borderColor = colorOption.textColor;

    if (!selected) {
      colorOptionElement.addEventListener("click", (e) =>
        colorChanged(e.target)
      );
      colorsListElement.appendChild(colorOptionElement);
    }
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

(async function initializeLostHighlights() {
  updateHighlightsListState();
  const lostHighlights = await getFromBackgroundPage({
    action: "get-lost-highlights",
  });

  if (!Array.isArray(lostHighlights) || lostHighlights.length == 0) {
    return;
  }

  // Populate with new elements
  lostHighlights.forEach((lostHighlight) => {
    if (!lostHighlight?.string) return;

    const newEl = document.createElement("div");
    newEl.classList.add("highlight", "lost");
    newEl.innerText = lostHighlight.string;
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
      location.reload(); // Force a refresh of the colors list in the popup
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
changeColorButton.addEventListener("click", openChangeColorModal);
selectedColorElement.addEventListener("click", openChangeColorModal);

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
