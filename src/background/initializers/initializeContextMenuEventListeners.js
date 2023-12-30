import {
  changeColor,
  highlightText,
  toggleHighlighterCursor,
} from "../actions/index.js";
import { trackEvent } from "../analytics.js";

function initializeContextMenuEventListeners() {
  chrome.contextMenus.onClicked.addListener(
    ({ menuItemId, parentMenuItemId }) => {
      if (parentMenuItemId === "highlight-color") {
        trackEvent("color-change-source", "context-menu");
        changeColor(menuItemId);
        return;
      }

      switch (menuItemId) {
        case "highlight":
          trackEvent("highlight-source", "context-menu");
          highlightText();
          break;
        case "toggle-cursor":
          trackEvent("toggle-cursor-source", "context-menu");
          toggleHighlighterCursor();
          break;
      }
    }
  );
}

export default initializeContextMenuEventListeners;
