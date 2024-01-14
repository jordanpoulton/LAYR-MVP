import { get, ref, set } from "firebase/database";
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

async function findUserByUsername(username) {
  const userRef = ref(db, "users/" + username);
  try {
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error finding user: ", error);
    throw error; // Rethrow or handle as appropriate
  }
}

async function findUserByEmail(email) {
  const usersRef = ref(db, "users");
  try {
    const snapshot = await get(usersRef);
    if (snapshot.exists()) {
      const users = snapshot.val();
      const usernames = Object.keys(users);
      const found = usernames.find(
        (username) => users[username].email === email
      );
      if (found) {
        return users[found];
      } else {
        return null;
      }
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error finding user: ", error);
    throw error; // Rethrow or handle as appropriate
  }
}

export { loginUser, findUserByUsername, findUserByEmail };
