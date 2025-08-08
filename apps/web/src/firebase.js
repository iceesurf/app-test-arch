import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCbnUYk7lL8zPsPxYGOSVHn_Rg3ESSWnrU",
  authDomain: "app-arch-6c99b.firebaseapp.com",
  projectId: "app-arch-6c99b",
  storageBucket: "app-arch-6c99b.firebasestorage.app",
  messagingSenderId: "889952359187",
  appId: "1:889952359187:web:27675fd48b6aba239a80e6",
  measurementId: "G-Z92BFD8J1G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const functions = getFunctions(app);
const db = getFirestore(app);

// Connect to emulators in development
if (import.meta.env.DEV) {
  try {
    connectAuthEmulator(auth, "http://localhost:9099");
    connectFunctionsEmulator(functions, "localhost", 5001);
    connectFirestoreEmulator(db, "localhost", 8081);
    console.log("✅ Conectado aos emuladores Firebase");
  } catch (error) {
    console.log("⚠️ Emuladores já conectados ou não disponíveis");
  }
}

export { app, auth, db, functions };

