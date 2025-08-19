// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDxT8fHzvgXudRPkmFgjJ1AKj94kUCITvc",
  authDomain: "planclan.firebaseapp.com",
  projectId: "planclan",
  storageBucket: "planclan.firebasestorage.app",
  messagingSenderId: "155123589616",
  appId: "1:155123589616:web:e1556daa45fae35f5c7d35"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
