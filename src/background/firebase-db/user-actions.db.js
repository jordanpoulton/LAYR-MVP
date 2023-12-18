import { ref, set } from "firebase/database";
import { db } from "./firebase";

async function loginUser({ username, email }) {
  // Validate input data
  if (!username || !email) {
    return Promise.reject(new Error("Invalid username or email"));
  }

  const userRef = ref(db, "users/" + username);
  try {
    await set(userRef, { username, email });
    return { username, email };
  } catch (error) {
    console.error("Error creating user: ", error);
    throw error; // Rethrow or handle as appropriate
  }
}

export { loginUser };
