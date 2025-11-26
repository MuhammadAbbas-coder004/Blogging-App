import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { collection, getDocs, query, where, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { auth, db } from "./config.js";

const blogsContainer = document.querySelector(".blogs-container");
const bigProfile = document.querySelector(".big-profile");
const bigName = document.querySelector(".big-username");
const bigEmail = document.querySelector(".big-email");
const allFrom = document.querySelector(".all-from");
const userProfileNav = document.querySelector("#user-profile");
const logoutBtn = document.querySelector("#logout-btn");
logoutBtn.addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const u = userSnap.data();
      userProfileNav.src = u.profile || "default-profile.jpg";
    } else {
      userProfileNav.src = "default-profile.jpg";
    }
  }
});


async function loadUserBlogs() {
  const selectedUID = localStorage.getItem("selectedUserUID");

  if (!selectedUID) {
    blogsContainer.innerHTML = "No user selected!";
    return;
  }

 
  const userDocRef = doc(db, "users", selectedUID);
  const userSnap = await getDoc(userDocRef);

  let userProfile = "default-profile.jpg";
  let userName = "Anonymous";
  let userEmail = "No email";

  if (userSnap.exists()) {
    const data = userSnap.data();
    userProfile = data.profile || userProfile;
    userName = `${data.firstName || ""} ${data.lastName || ""}`.trim() || "Anonymous";
    userEmail = data.email || "No email";
  }

  bigProfile.src = userProfile;
  bigName.textContent = userName;
  bigEmail.textContent = userEmail;
  allFrom.textContent = `All from ${userName}`;


 
  const q = query(collection(db, "blogs"), where("uid", "==", selectedUID));
  const snap = await getDocs(q);

  const blogs = [];
  snap.forEach(doc => blogs.push(doc.data()));

  blogsContainer.innerHTML = "";

  if (!blogs.length) {
    blogsContainer.innerHTML = "No blogs found for this user.";
    return;
  }

 
  blogs.sort((a, b) => {
    const d1 = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
    const d2 = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
    return d2 - d1;
  });


  
  blogs.forEach(b => {
    const date = b.createdAt?.toDate ? b.createdAt.toDate() : new Date();
    const formatted = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });

    const card = document.createElement("div");
    card.classList.add("blog-card");

    card.innerHTML = `
      <div class="card-header">
        <img src="${b.profile || userProfile}" class="profile-pic">
        <span class="user-name">${userName}</span>
        <span class="publish-date">${formatted}</span>
      </div>
      <h3 class="card-title">${b.title}</h3>
      <p class="card-desc">${b.description}</p>
    `;

    blogsContainer.appendChild(card);
  });
}

loadUserBlogs();
