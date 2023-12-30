import { getCurrentColor } from "../actions/index.js";

function initializeContextMenus() {
  console.log("initializeContextMenus");
  // Add option when right-clicking
  chrome.runtime.onInstalled.addListener(async () => {
    // remove existing menu items
    chrome.contextMenus.removeAll();

    chrome.contextMenus.create({
      title: "Highlight",
      id: "highlight",
      contexts: ["selection"],
    });
    chrome.contextMenus.create({ title: "Toggle Cursor", id: "toggle-cursor" });
    chrome.contextMenus.create({
      title: "Highlighter color",
      id: "highlight-colors",
    });
    chrome.contextMenus.create({
      title: "Yellow",
      id: "yellow",
      parentId: "highlight-colors",
      type: "radio",
    });
    chrome.contextMenus.create({
      title: "Blue",
      id: "blue",
      parentId: "highlight-colors",
      type: "radio",
    });
    chrome.contextMenus.create({
      title: "Green",
      id: "green",
      parentId: "highlight-colors",
      type: "radio",
    });
    chrome.contextMenus.create({
      title: "Pink",
      id: "pink",
      parentId: "highlight-colors",
      type: "radio",
    });
    chrome.contextMenus.create({
      title: "Dark",
      id: "dark",
      parentId: "highlight-colors",
      type: "radio",
    });

    // Get the initial selected color value
    const { title: colorTitle } = await getCurrentColor();
    chrome.contextMenus.update(colorTitle, { checked: true });
  });
}

export default initializeContextMenus;
