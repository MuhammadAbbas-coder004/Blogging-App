import { 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import { auth, provider, db } from "./config.js";
import { setDoc, doc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
const loginForm = document.querySelector("#login-form");
const loginEmail = document.querySelector("#email");
const loginPassword = document.querySelector("#password");

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value)
    .then((userCredential) => {
      console.log(userCredential.user);
      window.location = "index.html";
    })
    .catch((error) => {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please Register The Account",
      });
    });
});
const resetbtn = document.querySelector("#forgot-btn");

resetbtn.addEventListener("click", () => {
  const email = prompt("Enter your email");

  sendPasswordResetEmail(auth, email)
    .then(() => {
      Swal.fire({
        text: "Please Check Your Email To Reset Your Password",
        icon: "success",
      });
    })
    .catch((error) => {
      console.log(error.message);
    });
});
const googleBtn = document.querySelector("#google-btn");
googleBtn.addEventListener("click", () => {
  signInWithPopup(auth, provider)
    .then(async (result) => {
      const user = result.user;

      await setDoc(doc(db, "users", user.uid), {
        name: user.displayName,
        email: user.email,
        profile: user.photoURL,
        uid: user.uid
      });
      window.location = "home.html";
    })
    .catch((error) => {
      console.log(error.message);
    });
});
