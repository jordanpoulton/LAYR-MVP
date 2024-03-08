// Return a Map of highlights found on the page,
// with the highlight id as the key and the highlight text as the value
function getAllFound() {
  const highlights = document.getElementsByClassName(
    "highlighter--highlighted"
  );
  return Array.from(highlights)
    .map((highlight) => [
      highlight.getAttribute("data-highlight-id"),
      highlight.textContent.replace(/\s+/gmu, " ").trim(),
      highlight.getAttribute("data-highlight-user"), // Assuming each highlight has a data attribute for the username
    ])
    .reduce((acc, [highlightId, highlightText, highlightUsername]) => {
      if (acc.has(highlightId)) {
        const existing = acc.get(highlightId);
        existing.text += ` ${highlightText}`; // Concatenate texts for the same highlight ID
        acc.set(highlightId, existing); // Update the map
      } else {
        acc.set(highlightId, { text: highlightText, user: highlightUsername });
      }
      return acc;
    }, new Map());
}

export default getAllFound;
