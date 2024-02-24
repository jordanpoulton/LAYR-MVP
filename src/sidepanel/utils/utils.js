import { getFromBackgroundPage } from "./getFromBackgroundPage";

async function getCurrentUser() {
  const { user } = await chrome.storage.sync.get({ user: {} });
  return user;
}

async function getHighlightById(uuid) {
  const highlight = await getFromBackgroundPage({
    action: "get-highlight-by-id",
    uuid,
  });
  if (highlight) {
    return highlight;
  }

  return null; // Return null if no match is found
}

export { getCurrentUser, getHighlightById };
