import { trackEvent } from "../analytics";

function initializeExtensionEventListeners() {
  // Analytics (non-interactive events)
  chrome.runtime.onInstalled.addListener(() => {
    trackEvent(
      "extension",
      "installed",
      chrome.runtime.getManifest().version,
      null,
      { ni: 1 }
    );
  });
  chrome.runtime.onStartup.addListener(() => {
    trackEvent("extension", "startup", null, null, { ni: 1 });
  });
}

export default initializeExtensionEventListeners;
