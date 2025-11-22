import { 
  collection, 
  getDocs, 
  query, 
  where 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

import { auth, db } from "./config.js";

import { 
  signOut, 
  onAuthStateChanged, 
  reauthenticateWithCredential, 
  EmailAuthProvider, 
  updatePassword 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// ---------------- DOM SELECT ----------------

// Navbar
const navProfilePic = document.querySelector("#user-profile");
const logoutBtn = document.querySelector("#logout-btn");

// Profile card
const bigProfilePic = document.querySelector("#form-user-profile");
const profileCard = document.querySelector(".profile-card");

// Name under big profile
const nameDiv = document.createElement("p");
nameDiv.className = "name";
nameDiv.style.color = "white";
nameDiv.style.fontSize = "18px";
nameDiv.style.textAlign = "center";
nameDiv.style.margin = "10px 0";
profileCard.insertBefore(nameDiv, bigProfilePic.nextSibling);

// Password inputs and form
const userForm = document.querySelector("#user-form");
const oldPassInput = document.querySelector("#old-password");
const newPassInput = document.querySelector("#new-password");
const repeatPassInput = document.querySelector("#repeat-Password");

// ---------------- LOGOUT ----------------
logoutBtn.addEventListener("click", () => {
  signOut(auth)
    .then(() => window.location = "login.html")
    .catch(() => Swal.fire({ icon: "error", title: "Error logging out" }));
});

// ---------------- FETCH USER DATA ----------------
onAuthStateChanged(auth, async (user) => {
  if (!user) return window.location = "login.html";

  try {
    const q = query(collection(db, "users"), where("uid", "==", user.uid));
    const snapshot = await getDocs(q);
    const userData = snapshot.empty ? null : snapshot.docs[0].data();

    const photo = userData?.profile || user.photoURL || "default-avatar.png";

    let name = "User";
    if (userData?.firstName || userData?.lastName) {
      name = `${userData.firstName || ""} ${userData.lastName || ""}`.trim();
    } else if (user.displayName) {
      name = user.displayName;
    }

    navProfilePic.src = photo;
    bigProfilePic.src = photo;
    nameDiv.textContent = name;

  } catch (err) {
    console.error("Error fetching user data:", err);
  }
});

// ---------------- UPDATE PASSWORD ----------------
userForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  const oldPass = oldPassInput.value;
  const newPass = newPassInput.value;
  const repeatPass = repeatPassInput.value;

  if (!newPass || !repeatPass) {
    Swal.fire({ icon: "error", title: "Oops!", text: "Please fill all fields!" });
    return;
  }

  if (newPass !== repeatPass) {
    Swal.fire({ icon: "error", title: "Oops!", text: "Passwords do not match!" });
    return;
  }

  try {
    const isPasswordUser = user.providerData.some(p => p.providerId === "password");

    if (isPasswordUser) {
      if (!oldPass) {
        Swal.fire({ icon: "error", title: "Oops!", text: "Please enter old password!" });
        return;
      }
      const credential = EmailAuthProvider.credential(user.email, oldPass);
      await reauthenticateWithCredential(user, credential);
    }

    await updatePassword(user, newPass);

    Swal.fire({ icon: "success", title: "Success", text: "Password updated successfully!", timer: 1500, showConfirmButton: false });

    oldPassInput.value = "";
    newPassInput.value = "";
    repeatPassInput.value = "";

  } catch (err) {
    console.error("Error updating password:", err);
    Swal.fire({ icon: "error", title: "Error", text: err.message });
  }
});
