/* eslint-disable import/no-unresolved */
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
  apiKey: "AIzaSyAyYGEXZ_3ktQ6UJz1RgdryIiaXYuhNaTQ",
  authDomain: "highlighter-7b30b.firebaseapp.com",
  databaseURL: "https://highlighter-7b30b-default-rtdb.firebaseio.com",
  projectId: "highlighter-7b30b",
  storageBucket: "highlighter-7b30b.appspot.com",
  messagingSenderId: "252244488016",
  appId: "1:252244488016:web:101c1d7fb3c7c8f7f74655",
  measurementId: "G-5E8WYRQ1E7",
  databaseURL: "https://highlighter-7b30b-default-rtdb.firebaseio.com",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const db = getDatabase(app);

function loginUser({ username, email }) {
  set(ref(db, "users/" + username), {
    username,
    email,
  });
  return {
    username,
    email,
  };
}

export { db, loginUser };
