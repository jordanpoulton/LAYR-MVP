function initializeContextMenus() {
  // Add option when right-clicking
  chrome.runtime.onInstalled.addListener(() => {
    // remove existing menu items
    chrome.contextMenus.removeAll();

    chrome.contextMenus.create({
      title: "Highlight",
      id: "highlight",
      contexts: ["selection"],
    });
    chrome.contextMenus.create({ title: "Toggle Cursor", id: "toggle-cursor" });
  });
}

export default initializeContextMenus;
