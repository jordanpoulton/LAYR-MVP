import highlightV4 from "./highlightV4.js";

function highlight(
  user,
  selectionString,
  container,
  selection,
  color,
  textColor,
  highlightIndex,
  version = null
) {
  // Starting with version 4, the highlighting algorithm is more strict to prevent highlighting all the page and a big refactor was done
  return highlightV4(
    user,
    selectionString,
    container,
    selection,
    color,
    textColor,
    highlightIndex
  );
}

export * from "./constants.js";
export default highlight;
