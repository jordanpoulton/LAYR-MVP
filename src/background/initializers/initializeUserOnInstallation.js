function initializeUserOnInstallation() {
  chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
      const user = {
        id: crypto.randomUUID(),
        createdAt: new Date(),
      };
      chrome.storage.local.set({ user });
      // refresh all the tabs
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          chrome.tabs.reload(tab.id);
        });
      });
    }
    if (details.reason === "update") {
      // refresh all the tabs
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          chrome.tabs.reload(tab.id);
        });
      });
    }
  });
}

export default initializeUserOnInstallation;
