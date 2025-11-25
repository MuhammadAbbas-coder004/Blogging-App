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

// Logout
logoutBtn.addEventListener("click", () => {
  signOut(auth).then(() => window.location.href = "index.html");
});

// Navbar profile pic for logged-in user
onAuthStateChanged(auth, user => {
  if(user){
    userProfileNav.src = user.photoURL || "default-profile.jpg";
  }
});

// Load selected user's blogs
async function loadUserBlogs() {
  const uid = localStorage.getItem("selectedUserUID");
  if(!uid){
    blogsContainer.innerHTML = "No user selected!";
    return;
  }

  const userDocRef = doc(db, "users", uid);
  const userSnap = await getDoc(userDocRef);
  let userProfile = "default-profile.jpg";
  let userName = "Anonymous";
  let userEmail = "No email available";

  if(userSnap.exists()){
    const data = userSnap.data();
    userProfile = data.profile || userProfile;
    userName = (data.firstName || data.name || "Anonymous") + " " + (data.lastName || "");
    userEmail = data.email || "No email available";
  }

  bigProfile.src = userProfile;
  bigName.textContent = userName;
  bigEmail.textContent = userEmail;
  allFrom.textContent = `All from ${userName}`;

  const q = query(collection(db, "blogs"), where("uid", "==", uid));
  const querySnap = await getDocs(q);
  const blogs = [];

  querySnap.forEach(docSnap => blogs.push(docSnap.data()));

  if(!blogs.length){
    blogsContainer.innerHTML = "No blogs found for this user.";
    return;
  }

  blogs.sort((a,b)=>{
    const d1 = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
    const d2 = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
    return d2 - d1;
  });

  blogsContainer.innerHTML = "";
  blogs.forEach(data => {
    const date = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
    const formattedDate = date.toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });

    const card = document.createElement("div");
    card.classList.add("blog-card");
    card.innerHTML = `
      <div class="card-header">
        <img src="${data.profile || userProfile}" class="profile-pic">
        <span class="user-name">${userName}</span>
        <span class="publish-date">${formattedDate}</span>
      </div>
      <h3 class="card-title">${data.title || "No title"}</h3>
      <p class="card-desc">${data.description || "No description"}</p>
    `;
    blogsContainer.appendChild(card);
  });
}

loadUserBlogs();
