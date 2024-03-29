/* eslint-disable import/no-unresolved */
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object

const firebaseConfig = {
  apiKey: "AIzaSyDYbHdqSMi46AvitDt8PUilpPcqNNcdfnk",
  authDomain: "layr-34cbb.firebaseapp.com",
  databaseURL: "https://layr-34cbb-default-rtdb.firebaseio.com",
  projectId: "layr-34cbb",
  storageBucket: "layr-34cbb.appspot.com",
  messagingSenderId: "721318168067",
  appId: "1:721318168067:web:19f4b85df6cd0d840b3036",
  measurementId: "G-SL9EZXVFFN"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const db = getDatabase(app);

export { db };
