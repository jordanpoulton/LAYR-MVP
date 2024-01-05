import { trackEvent } from "../analytics.js";

function changeAction(actionTitle) {
  if (!actionTitle) return;

  trackEvent("action-changed-to", actionTitle);
  chrome.storage.sync.set({ action: actionTitle });
}

export default changeAction;
