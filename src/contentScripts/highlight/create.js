import highlight from "./highlight/index.js";

import { store, getCurrentUser } from "../utils/storageManager.js";
import { getFromBackgroundPage } from "../utils/getFromBackgroundPage.js";

async function create(selection = window.getSelection()) {
  const selectionString = selection.toString();
  if (!selectionString) return;

  let container = selection.getRangeAt(0).commonAncestorContainer;

  // Sometimes the element will only be text. Get the parent in that case
  // TODO: Is this really necessary?
  while (!container.innerHTML) {
    container = container.parentNode;
  }

  const [defaultAction, user] = await Promise.all([
    getFromBackgroundPage({
      action: "get-default-action",
    }),
    getCurrentUser(),
  ]);

  const RED_COLOR = "#FF7F7F";
  const GREEN_COLOR = "#44ff93";

  let color = {
    color: GREEN_COLOR,
    textColor: "black",
  };

  debugger;

  if (defaultAction.title === "like") {
    color = {
      color: GREEN_COLOR,
      textColor: "black",
    };
  } else if (defaultAction.title === "dislike") {
    color = {
      color: RED_COLOR,
      textColor: "black",
    };
  }

  if (!user) {
    alert("You must be logged in to highlight text");
    return;
  }

  const highlightIndex = await store(
    selection,
    container,
    location.hostname + location.pathname,
    location.href,
    color.color,
    color.textColor,
    user,
    defaultAction.title
  );
  highlight(
    selectionString,
    container,
    selection,
    color.color,
    color.textColor,
    highlightIndex
  );
}

export default create;
