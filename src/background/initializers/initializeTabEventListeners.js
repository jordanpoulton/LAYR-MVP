import { loadPageHighlights } from "../actions";

function initializeTabEventListeners() {
  // If the URL changes, try again to highlight
  // This is done to support javascript Single-page applications
  // which often change the URL without reloading the page
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, _tab) => {
    if (changeInfo.url) {
      loadPageHighlights(tabId);
    }
  });
}

export default initializeTabEventListeners;
