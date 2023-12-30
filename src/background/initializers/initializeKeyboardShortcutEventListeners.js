import {
  changeColor,
  highlightText,
  toggleHighlighterCursor,
} from "../actions/index.js";

import { trackEvent } from "../analytics.js";
function initializeKeyboardShortcutEventListeners() {
  // Add Keyboard shortcuts
  chrome.commands.onCommand.addListener((command) => {
    switch (command) {
      case "execute-highlight":
        trackEvent("highlight-source", "keyboard-shortcut");
        highlightText();
        break;
      case "toggle-highlighter-cursor":
        trackEvent("toggle-cursor-source", "keyboard-shortcut");
        toggleHighlighterCursor();
        break;
      case "change-color-to-yellow":
        trackEvent("color-change-source", "keyboard-shortcut");
        changeColor("yellow");
        break;
      case "change-color-to-cyan":
        trackEvent("color-change-source", "keyboard-shortcut");
        changeColor("cyan");
        break;
      case "change-color-to-lime":
        trackEvent("color-change-source", "keyboard-shortcut");
        changeColor("lime");
        break;
      case "change-color-to-magenta":
        trackEvent("color-change-source", "keyboard-shortcut");
        changeColor("magenta");
        break;
      case "change-color-to-dark":
        trackEvent("color-change-source", "keyboard-shortcut");
        changeColor("dark");
        break;
    }
  });
}

export default initializeKeyboardShortcutEventListeners;
