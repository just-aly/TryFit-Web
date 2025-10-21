// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyDoF6Uuunb7dl1bfmqPSbzZNZqWZYNYwEI",
  authDomain: "try-on-c05f0.firebaseapp.com",
  projectId: "try-on-c05f0",
  storageBucket: "your-project.appspot.com",
  messagingSenderId:  "681286310762",
  appId: "1:681286310762:web:d669a61938efbfaf7c6313"
};

// initialize once
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
