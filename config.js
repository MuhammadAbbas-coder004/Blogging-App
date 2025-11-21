import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC6LVKF-E3-v3EfqlyvbExnSQ9jL9cRb10",
  authDomain: "facebook-authentication-741ad.firebaseapp.com",
  projectId: "facebook-authentication-741ad",
  storageBucket: "facebook-authentication-741ad.firebasestorage.app",
  messagingSenderId: "847457968053",
  appId: "1:847457968053:web:a069689373a3b910c283fc",
  measurementId: "G-0ENNEY6HBD",
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
