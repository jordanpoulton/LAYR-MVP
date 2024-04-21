import { equalTo, get, orderByChild, query, ref, set } from "firebase/database";
import { db } from "./firebase";
import { removeHighlight } from "../actions";

const RED_COLOR = "#FF7F7F";
const GREEN_COLOR = "#44ff93";

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

async function getHighlightsNotEqualToHref({ href }) {
  try {
    // Reference to the highlights node in Firebase
    const highlightsRef = ref(db, "highlights");

    // Fetch all highlights
    const snapshot = await get(highlightsRef);

    if (snapshot.exists()) {
      const allHighlights = Object.values(snapshot.val());

      // Filter out the highlights with the specified href
      const filteredHighlights = allHighlights.filter(
        (highlight) => highlight.href !== href
      );

      filteredHighlights.sort((a, b) => b.createdAt - a.createdAt);

      return filteredHighlights;
    } else {
      return []; // Return an empty array if no highlights are found
    }
  } catch (error) {
    console.error("Error fetching highlights:", error);
    throw error;
  }
}

async function addCommentToHighlight(payload) {
  const { uuid, user, commentText } = payload;
  const highlight = await getHighlightById(uuid);

  if (!highlight) {
    console.error("Highlight not found to add comment");
    return;
  }

  const newComment = {
    text: commentText,
    user: user.username,
    createdAt: Date.now(),
  };

  if (highlight.comments) {
    highlight.comments.push(newComment);
    highlight.commentsCount += 1;
  } else {
    highlight.comments = [newComment];
    highlight.commentsCount = 1;
  }

  highlight.updatedAt = Date.now();
  // await chrome.storage.local.set({ highlights });
  await storeHighlightInFirebase(highlight);
  // See src/background/firebase-db/highlights-actions.db.js for the implementation of
}

async function deleteHighlightById(payload) {
  try {
    const { highlightId, user } = payload;
    // Reference to the highlights node in Firebase
    const highlightsRef = ref(db, "highlights");

    // Create a query to find the highlight with the specified uuid
    const highlightQuery = query(
      highlightsRef,
      orderByChild("id"),
      equalTo(highlightId)
    );

    // Execute the query
    const snapshot = await get(highlightQuery);

    if (snapshot.exists()) {
      // Get the key of the highlight to be deleted
      const highlightKey = Object.keys(snapshot.val())[0];

      // Reference to the specific highlight to be deleted
      const highlightRef = ref(db, `highlights/${highlightKey}`);

      // Delete the highlight from Firebase
      await set(highlightRef, null);

      removeHighlight(highlightId);

      return true; // Return true if the highlight was successfully deleted
    } else {
      return false; // Return false if no match is found
    }
  } catch (error) {
    console.error("Error deleting highlight by ID:", error);
    throw error;
  }
}

async function updateLikeCount(payload) {
  const { highlightId, like, user } = payload;
  const [highlightObject] = await Promise.all([getHighlightById(highlightId)]);

  if (highlightObject) {
    const alreadyLiked = highlightObject?.likedBy?.includes(user.username);
    const alreadyDisliked = highlightObject?.dislikedBy?.includes(
      user.username
    );

    if (like) {
      if (alreadyLiked) return highlightObject; // User already liked this highlight

      // Remove dislike if previously disliked
      if (alreadyDisliked) {
        highlightObject.dislikedBy = highlightObject.dislikedBy.filter(
          (username) => username !== user.username
        );
        highlightObject.dislikes = Math.max(highlightObject.dislikes - 1, 0);
      }

      // Add like
      highlightObject.likes += 1;
      highlightObject.likedBy.push(user.username);
    } else {
      if (alreadyDisliked) return highlightObject; // User already disliked this highlight

      // Remove like if previously liked
      if (alreadyLiked) {
        highlightObject.likedBy = highlightObject.likedBy.filter(
          (username) => username !== user.username
        );
        highlightObject.likes = Math.max(highlightObject.likes - 1, 0);
      }

      // Add dislike
      highlightObject.dislikes += 1;
      highlightObject.dislikedBy.push(user.username);
    }

    if (highlightObject.likes > highlightObject.dislikes) {
      highlightObject.color = GREEN_COLOR;
      highlightObject.textColor = "black";
    } else if (highlightObject.likes < highlightObject.dislikes) {
      highlightObject.color = RED_COLOR;
      highlightObject.textColor = "black";
    }

    highlightObject.updatedAt = Date.now();
    await storeHighlightInFirebase(highlightObject);
    return highlightObject;
  }
}

export {
  addCommentToHighlight,
  getHighlightById,
  getHighlightsNotEqualToHref,
  storeHighlightInFirebase,
  updateLikeCount,
  deleteHighlightById,
};
