import { collection, getDocs, query, where, doc, getDoc, Timestamp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { db } from "./config.js";

const blogsContainer = document.querySelector(".blogs-container");
const bigProfile = document.querySelector(".big-profile");
const bigName = document.querySelector(".big-username");
const bigEmail = document.querySelector(".big-email");
const allFrom = document.querySelector(".all-from");


const loginBtn = document.querySelector(".login-btn");
if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    window.location.href = "login.html";
  });
}

async function loadUserBlogs() {
  const uid = localStorage.getItem("selectedUserUID");
  if (!uid) {
    blogsContainer.innerHTML = "No user selected!";
    return;
  }


  const userDocRef = doc(db, "users", uid);
  const userSnap = await getDoc(userDocRef);
  let userEmail = "No email available";
  if (userSnap.exists()) {
    const userData = userSnap.data();
    userEmail = userData.email || "No email available";
  }

  const q = query(collection(db, "blogs"), where("uid", "==", uid));
  const querySnapshot = await getDocs(q);

  const blogs = [];
  let userProfile = null;
  let userName = null;

  querySnapshot.forEach(docSnap => {
    const data = docSnap.data();
    blogs.push(data);

    if (!userProfile) userProfile = data.profile || "default-profile.jpg";
    if (!userName) userName = (data.firstName || data.name || "Anonymous") + " " + (data.lastName || "");
  });

  if (!blogs.length) {
    blogsContainer.innerHTML = "No blogs found for this user.";
    return;
  }


  bigProfile.src = userProfile;
  bigName.textContent = userName;
  bigEmail.textContent = userEmail;
  allFrom.textContent = `All from ${userName}`;


  blogs.sort((a, b) => {
    const d1 = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
    const d2 = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
    return d2 - d1;
  });

  blogsContainer.innerHTML = "";
  blogs.forEach(data => {
    const date = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
    const formattedDate = date.toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });

    const cardHTML = document.createElement("div");
    cardHTML.classList.add("blog-card");
    cardHTML.innerHTML = `
      <div class="card-header">
        <img src="${data.profile || userProfile}" class="profile-pic">
        <span class="user-name">${userName}</span>
        <span class="publish-date">${formattedDate}</span>
      </div>
      <h3 class="card-title">${data.title || "No title"}</h3>
      <p class="card-desc">${data.description || "No description"}</p>
    `;
    blogsContainer.appendChild(cardHTML);
  });
}

loadUserBlogs();
