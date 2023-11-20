import { trackEvent } from "../analytics.js";
import { executeInCurrentTab } from "../utils.js";

function highlightText() {
  trackEvent("highlight-action", "highlight");

  function contentScriptHighlightText(currentColor) {
    window.highlighterAPI.highlight.create(currentColor);
  }

  const currentColor = { color: "#44ff93" };
  executeInCurrentTab({
    func: contentScriptHighlightText,
    args: [currentColor],
  });
}

export default highlightText;
