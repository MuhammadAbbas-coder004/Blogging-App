import { collection, getDocs, query, orderBy, where } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { db, auth } from "./config.js";

const blogsContainer = document.querySelector(".blogs-container");
const loginBtn = document.querySelector(".login-btn");
const logoutBtn = document.querySelector("#logout-btn");
const userProfileNav = document.querySelector("#user-profile");

if (loginBtn) loginBtn.addEventListener("click", () => window.location.href = "login.html");
if (logoutBtn) logoutBtn.addEventListener("click", () => signOut(auth).then(() => window.location.href="index.html"));


async function getUserProfile(uid) {
  const q = query(collection(db, "users"), where("uid", "==", uid));
  const snap = await getDocs(q);
  if (!snap.empty) {
    const data = snap.docs[0].data();
    return data.profile || "default-profile.jpg";
  }
  return "default-profile.jpg";
}


async function loadAllBlogs() {
  blogsContainer.innerHTML = "Loading blogs...";
  const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  blogsContainer.innerHTML = "";

  for (let docSnap of querySnapshot.docs) {
    const data = docSnap.data();
    const date = data.createdAt ? data.createdAt.toDate() : new Date();
    const formattedDate = date.toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });


    const profilePic = data.profile || await getUserProfile(data.uid);

    const firstName = data.firstName || data.name || "Anonymous";
    const lastName = data.lastName || "";

    const cardHTML = document.createElement("div");
    cardHTML.classList.add("blog-card");
    cardHTML.innerHTML = `
      <div class="card-header">
        <img src="${profilePic}" class="profile-pic">
        <span class="user-name">${firstName} ${lastName}</span>
        <span class="publish-date">${formattedDate}</span>
      </div>
      <h3 class="card-title">${data.title}</h3>
      <p class="card-desc">${data.description}</p>
      <button class="see-all-btn"><i class="fas fa-eye"></i> See all from this user</button>
    `;


    cardHTML.querySelector(".see-all-btn").addEventListener("click", () => {
      localStorage.setItem("selectedUserUID", data.uid);
      window.location.href = "userloginblog.html";
    });

    blogsContainer.appendChild(cardHTML);
  }
}


onAuthStateChanged(auth, async (user) => {
  if (user) {
    
    let profile = user.photoURL || await getUserProfile(user.uid) || "default-profile.jpg";
    userProfileNav.src = profile;
  } else {
    userProfileNav.src = "default-profile.jpg";
  }
  loadAllBlogs();
});
