import { onAuthStateChanged, signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { auth } from "./config.js";

// DOM Elements
const navProfilePic = document.querySelector(".nav-right img");
const profileCardPic = document.querySelector(".big-profile");
const updateBtn = document.querySelector(".update-btn");

// Create name element dynamically
const profileCard = document.querySelector(".profile-card");
let nameEl = document.createElement("p");
nameEl.className = "profile-name";
nameEl.style.color = "white";
nameEl.style.fontWeight = "600";
nameEl.style.margin = "10px 0";
profileCard.insertBefore(nameEl, profileCardPic.nextSibling);

// Password inputs
const oldPass = profileCard.querySelector('input[placeholder="Old Password"]');
const newPass = profileCard.querySelector('input[placeholder="New Password"]');
const repeatPass = profileCard.querySelector('input[placeholder="Repeat Password"]');

// Logout button
const logoutBtn = document.querySelector(".nav-right button");
logoutBtn.addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location = "index.html";
  });
});

// Auth state
onAuthStateChanged(auth, (user) => {
  if (user) {
    const photoURL = user.photoURL || "default-profile.jpg";
    const name = user.displayName || user.email;

    // Set profile pics
    navProfilePic.src = photoURL;
    profileCardPic.src = photoURL;

    // Set user name
    nameEl.textContent = name;
  } else {
    window.location = "login.html";
  }
});

// Update password
updateBtn.addEventListener("click", async () => {
  const user = auth.currentUser;

  if (!oldPass.value || !newPass.value || !repeatPass.value) {
    alert("Please fill all password fields!");
    return;
  }

  if (newPass.value !== repeatPass.value) {
    alert("New password and repeat password do not match!");
    return;
  }

  try {
    // Reauthenticate user with old password
    const credential = EmailAuthProvider.credential(user.email, oldPass.value);
    await reauthenticateWithCredential(user, credential);

    // Update password
    await updatePassword(user, newPass.value);
    alert("Password updated successfully!");
    
    // Clear inputs
    oldPass.value = "";
    newPass.value = "";
    repeatPass.value = "";
  } catch (error) {
    console.error(error);
    alert("Error updating password: " + error.message);
  }
});
