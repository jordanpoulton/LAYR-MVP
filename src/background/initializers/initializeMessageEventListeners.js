import changeAction from "../actions/changeAction.js";
import getActionOptions from "../actions/getActionOptions.js";
import getDefaultAction from "../actions/getDefaultAction.js";
import {
  changeColor,
  editColor,
  getHighlights,
  getLostHighlights,
  highlightText,
  removeHighlight,
  removeHighlights,
  showHighlight,
  toggleHighlighterCursor,
} from "../actions/index.js";
import openTabAndShowHighlight from "../actions/openTabAndShowHighlight.js";
import { trackEvent } from "../analytics.js";
import {
  addCommentToHighlight,
  getHighlightById,
  getHighlightsNotEqualToHref,
  storeHighlightInFirebase,
  updateLikeCount,
} from "../firebase-db/highlights-actions.db.js";
import {
  findUserByEmail,
  findUserByUsername,
  getCurrentUser,
  loginUser,
  registerUser,
} from "../firebase-db/user-actions.db.js";
import { wrapResponse } from "../utils.js";

function initializeMessageEventListeners() {
  // Listen to messages from content scripts
  /* eslint-disable consistent-return */

  async function openSidepanel(sender) {
    await chrome.sidePanel.open({ tabId: sender.tab.id });
    await chrome.sidePanel.setOptions({
      tabId: sender.tab.id,
      path: "../sidepanel/index.html",
      enabled: true,
    });
  }

  chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (!request.action) return;

    switch (request.action) {
      case "highlight":
        trackEvent("highlight-source", "highlighter-cursor");
        highlightText();
        return sendResponse();
      case "track-event":
        trackEvent(request.trackCategory, request.trackAction);
        return sendResponse();
      case "remove-highlights":
        removeHighlights();
        return sendResponse();
      case "remove-highlight":
        removeHighlight(request.highlightId);
        return sendResponse();
      case "change-color":
        trackEvent("color-change-source", request.source);
        changeColor(request.color);
        return sendResponse();
      case "change-action":
        changeAction(request.actionTitle);
        return sendResponse();
      case "edit-color":
        editColor(request.colorTitle, request.color, request.textColor);
        return sendResponse();
      case "toggle-highlighter-cursor":
        trackEvent("toggle-cursor-source", request.source);
        toggleHighlighterCursor();
        return sendResponse();
      case "get-highlights":
        wrapResponse(getHighlights(), sendResponse);
        return true; // return asynchronously
      case "get-lost-highlights":
        wrapResponse(getLostHighlights(), sendResponse);
        return true; // return asynchronously
      case "GET_LOST_HIGHLIGHTS_FROM_FIREBASE":
        wrapResponse(getHighlightsNotEqualToHref(request.data), sendResponse);
        return true; // return asynchronously
      case "show-highlight":
        return showHighlight(request.highlightId);
      case "open-tab-and-show-highlight":
        return openTabAndShowHighlight(request.data);
      case "get-default-action":
        wrapResponse(getDefaultAction(), sendResponse);
        return true; // return asynchronously
      case "get-action-options":
        wrapResponse(getActionOptions(), sendResponse);
        return true; // return asynchronously
      case "login-user":
        wrapResponse(loginUser(request.payload), sendResponse);
        return true; // return asynchronously
      case "store-highlight-in-firebase":
        wrapResponse(storeHighlightInFirebase(request.payload), sendResponse);
        return true; // return asynchronously
      case "get-highlight-by-id":
        wrapResponse(getHighlightById(request.uuid), sendResponse);
        return true; // return asynchronously
      case "find-user-by-username":
        wrapResponse(findUserByUsername(request.username), sendResponse);
        return true; // return asynchronously
      case "find-user-by-email":
        wrapResponse(findUserByEmail(request.email), sendResponse);
        return true; // return asynchronously
      case "signup-user":
        wrapResponse(registerUser(request.payload), sendResponse);
        return true; // return asynchronously
      case "add-comment-to-highlight":
        wrapResponse(addCommentToHighlight(request.payload), sendResponse);
        return true; // return asynchronously
      case "get-current-user":
        wrapResponse(getCurrentUser(request.payload), sendResponse);
        return true; // return asynchronously
      case "update-highlight-like-dislike-count":
        wrapResponse(updateLikeCount(request.payload), sendResponse);
        return true; // return asynchronously
      case "open_side_panel":
        openSidepanel(_sender);
      // This will open a tab-specific side panel only on the current tab.
    }
  });
  /* eslint-enable consistent-return */
}

export default initializeMessageEventListeners;
