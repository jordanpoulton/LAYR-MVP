import initializeContextMenuEventListeners from "./initializers/initializeContextMenuEventListeners.js";
import initializeContextMenus from "./initializers/initializeContextMenus.js";
import initializeExtensionEventListeners from "./initializers/initializeExtensionEventListeners.js";
import initializeKeyboardShortcutEventListeners from "./initializers/initializeKeyboardShortcutEventListeners.js";
import initializeMessageEventListeners from "./initializers/initializeMessageEventListeners.js";
import initializeDefaultStorage from "./initializers/initializeStorage.js";
import initializeTabEventListeners from "./initializers/initializeTabEventListeners.js";
import initializeUserOnInstallation from "./initializers/initializeUserOnInstallation.js";

async function initialize() {
  initializeDefaultStorage();
  initializeContextMenus();
  initializeContextMenuEventListeners();
  initializeExtensionEventListeners();
  initializeTabEventListeners();
  initializeKeyboardShortcutEventListeners();
  initializeMessageEventListeners();
  initializeUserOnInstallation();
}

initialize();
