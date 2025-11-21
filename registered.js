import { createUserWithEmailAndPassword,  signInWithPopup } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { auth, provider, db } from "./config.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";


let uploadImage = null;

const myWidget = cloudinary.createUploadWidget(
  {
    cloudName: "dptuo3qjf", 
    uploadPreset: "user_img",
  },
  (error, result) => {
    if (!error && result && result.event === "success") {
      console.log("Image uploaded:", result.info.secure_url);
      uploadImage = result.info.secure_url;
      Swal.fire({
        icon: "success",
        text: "Profile image uploaded successfully!",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  }
);

document.getElementById("profilePic").addEventListener("click", () => {
  myWidget.open();
})
const registerForm = document.querySelector("#signup-form");
const firstName = document.querySelector("#f-Name");
const lastName = document.querySelector("#l-Name");
const email = document.querySelector("#email");
const password = document.querySelector("#password");
const conformpassword = document.querySelector("#C-password");





registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  
  if (!email.value || !password.value) {
    return Swal.fire({
      icon: "warning",
      text: "Please fill in all fields.",
    });
  }

  if (!uploadImage) {
    return Swal.fire({
      icon: "warning",
      text: "Please upload a profile image before registering.",
    });
  }

  try {

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      firstName.value,
      lastName.value,
      email.value,
      password.value,
      conformpassword.value,

    );
    const user = userCredential.user;
    console.log(" User created:", user.uid);
    await addDoc(collection(db, "users"), {
      email: email.value,
      profile: uploadImage,
      uid: user.uid,
    })
    await Swal.fire({
      icon: "success",
      title: "Registration Successful!",
      text: "Your account has been created.",
      confirmButtonText: "Go to Login",
    });

    window.location = "login.html";
  } catch (error) {
    console.error("Error:", error.message);

    Swal.fire({
      icon: "error",
      title: "Registration Failed",
      text:
        error.code === "auth/email-already-in-use"
          ? "This email is already registered."
          : error.message,
    });
  }
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
      window.location = "index.html";
    })
    .catch((error) => {
      console.log(error.message);
    });
});
