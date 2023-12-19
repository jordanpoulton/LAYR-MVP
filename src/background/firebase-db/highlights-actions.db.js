import { db } from "./firebase";
import { ref, set, get, query, orderByChild, equalTo } from "firebase/database";

async function storeHighlightInFirebase(newHighlight) {
  try {
    // Generate a unique ID for the new highlight
    const highlightId = newHighlight.uuid;
    const newHighlightRef = ref(db, "highlights/" + highlightId);

    // Store the new highlight in Firebase under the generated ID
    await set(newHighlightRef, { ...newHighlight, id: highlightId });

    // Return the ID of the stored highlight for future reference
    return highlightId;
  } catch (error) {
    console.error("Error storing highlight in Firebase:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
}

async function getHighlightById(id) {
  try {
    // Reference to the highlights node in Firebase
    const highlightsRef = ref(db, "highlights");

    // Create a query to find the highlight with the specified uuid
    const highlightQuery = query(
      highlightsRef,
      orderByChild("id"),
      equalTo(id)
    );

    // Execute the query
    const snapshot = await get(highlightQuery);

    if (snapshot.exists()) {
      // Since UUIDs are unique, we can return the first match
      return Object.values(snapshot.val())[0];
    } else {
      return null; // Return null if no match is found
    }
  } catch (error) {
    console.error("Error fetching highlight by ID:", error);
    throw error;
  }
}

export { storeHighlightInFirebase, getHighlightById };
