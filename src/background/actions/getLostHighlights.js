import { executeInCurrentTab } from "../utils.js";

function getLostHighlights() {
  function contentScriptGetLostHighlights() {
    const lostHighlights = window.highlighterAPI.highlights.getAllLost() || [];
    return lostHighlights;
  }

  return executeInCurrentTab({ func: contentScriptGetLostHighlights });
}

export default getLostHighlights;
