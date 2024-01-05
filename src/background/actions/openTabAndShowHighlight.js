import { trackEvent } from "../analytics.js";
import { executeInCurrentTab } from "../utils.js";

const openTab = async (url) => {
  const tab = await chrome.tabs.create({ url });
  return tab;
};

async function openTabAndShowHighlight({ highlightId, href }) {
  await openTab(href);
  // const tab = await openTab(href);

  // chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
  //   // Check if the updated tab is the one we created and if it has finished loading
  //   if (tabId === tab.id && changeInfo.status === "complete") {
  //     // Once the tab has loaded, remove this event listener
  //     chrome.tabs.onUpdated.removeListener(listener);

  //     // Track the event (Uncomment if you want to track the event)
  //     trackEvent("highlight-action", "show-highlight");

  //     // Define the function to show the highlight
  //     function contentScriptShowHighlight(highlightId) {
  //       window.highlighterAPI.highlight.show(highlightId);
  //     }
  //     // Execute the function in the current tab
  //     executeInCurrentTab({
  //       func: contentScriptShowHighlight,
  //       args: [highlightId],
  //     });
  //   }
  // });
}

export default openTabAndShowHighlight;
