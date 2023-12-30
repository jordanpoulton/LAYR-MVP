async function initializeDefaultStorage() {
  const { user } = await chrome.storage.sync.get("user");

  chrome.storage.sync.set({
    currentHighlightsLoadingStatus: "loading",
    lostHighlightsLoadingStatus: "loading",
    user: user || null,
  });
}

export default initializeDefaultStorage;
