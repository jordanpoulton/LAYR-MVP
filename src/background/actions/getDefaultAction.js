import { DEFAULT_ACTION_TITLE } from "../constants.js";
import getActionOptions from "./getActionOptions.js";

async function getDefaultAction() {
  const { action } = await chrome.storage.sync.get("action");
  const optionTitle = action || DEFAULT_ACTION_TITLE;
  const actionOptions = await getActionOptions();
  return (
    actionOptions.find((action) => action.title === optionTitle) ||
    actionOptions[0]
  );
}

export default getDefaultAction;
