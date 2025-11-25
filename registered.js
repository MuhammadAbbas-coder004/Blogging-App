import { 
  createUserWithEmailAndPassword, 
  signInWithPopup 
}
 from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

 import { auth, provider, db } from "./config.js";

 import { 
  setDoc, 
  doc 
}
 from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";


let uploadImage = null;

const myWidget = cloudinary.createUploadWidget(
  {
    cloudName: "dptuo3qjf",
    uploadPreset: "user_img",
  },
  (error, result) => {
    if (!error && result && result.event === "success") {
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
}
);

const registerForm = document.querySelector("#signup-form");
const firstName = document.querySelector("#f-Name");
const lastName = document.querySelector("#l-Name");
const email = document.querySelector("#email");
const password = document.querySelector("#password");
 const confirmPassword = document.querySelector("#C-password");
registerForm.addEventListener("submit", async (event) => {
event.preventDefault();

  if (!firstName.value || !lastName.value || !email.value || !password.value || !confirmPassword.value) {
    return Swal.fire({
      icon: "warning",
      text: "Please fill in all fields.",
    });
  }

  if (password.value !== confirmPassword.value) {
    return Swal.fire({
      icon: "warning",
      text: "Passwords do not match!",
    });
  }

  if (!uploadImage) {
    return Swal.fire({
      icon: "warning",
      text: "Please upload a profile picture.",
    });
  }

try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email.value,
      password.value
    );

    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      profile: uploadImage,
      uid: user.uid,
    });

    Swal.fire({
      icon: "success",
      title: "Registration Successful!",
      text: "Your account has been registered.",
    }).then(() => {
      window.location = "home.html";
    });

  } catch (error) {
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
        uid: user.uid,
      });

      window.location = "home.html";
    })
    .catch((error) => {
      console.log(error.message);
    });
});
