import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { auth, db } from "./config.js";
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// DOM Elements
const userImg = document.querySelector("#user-profile");
const logoutBtn = document.querySelector("#logout-btn");
const storyForm = document.querySelector("#story-form");
const blogsContainer = document.querySelector(".blogs-container");

// Get user profile & name (supports Google login & email/password)
async function getUserProfile(uid, userAuth) {
  const q = query(collection(db, "users"), where("uid", "==", uid));
  const snap = await getDocs(q);

  let profile = "default-profile.jpg";
  let name = "Anonymous";

  if (!snap.empty) {
    const data = snap.docs[0].data();
    profile = data.profile || profile;
    if (data.firstName || data.lastName) {
      name = `${data.firstName || ""} ${data.lastName || ""}`.trim();
    } else if (data.name) {
      name = data.name;
    }
  } 

  // If Firestore has no name, use Google displayName (from userAuth)
  if (name === "Anonymous" && userAuth.displayName) {
    name = userAuth.displayName;
  }

  return { profile, name };
}

// Load only current user's blogs
async function loadUserBlogs(uid) {
  blogsContainer.innerHTML = "Loading your blogs...";
  const q = query(collection(db, "blogs"), where("uid", "==", uid));
  const querySnapshot = await getDocs(q);
  blogsContainer.innerHTML = "";

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const date = data.createdAt ? data.createdAt.toDate() : new Date();
    const formattedDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    const card = document.createElement("div");
    card.classList.add("blog-card");
    card.dataset.id = docSnap.id;

    card.innerHTML = `
      <div class="card-header">
        <img src="${data.profile}" alt="User Profile" class="profile-pic">
        <span class="user-name">${data.firstName || data.name || "Anonymous"} ${data.lastName || ""}</span>
        <span class="publish-date">${formattedDate}</span>
      </div>
      <h3 class="card-title">${data.title}</h3>
      <p class="card-desc">${data.description}</p>
      <div class="card-actions">
        <button class="edit-btn"><i class="fas fa-edit"></i> Edit</button>
        <button class="delete-btn"><i class="fas fa-trash-alt"></i> Delete</button>
      </div>
    `;
    blogsContainer.appendChild(card);
  });

  // Add delete functionality
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const card = e.target.closest(".blog-card");
      const blogId = card.dataset.id;
      if (confirm("Are you sure you want to delete this blog?")) {
        await deleteDoc(doc(db, "blogs", blogId));
        loadUserBlogs(uid); // reload blogs
      }
    });
  });

  // Edit button placeholder
  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const card = e.target.closest(".blog-card");
      const blogId = card.dataset.id;
      alert(`You can implement edit functionality for blog ID: ${blogId}`);
    });
  });
}

// Auth state
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const { profile, name } = await getUserProfile(user.uid, user);
    userImg.src = profile;

    // Ensure Firestore has user info saved
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, { name: name, profile: profile, uid: user.uid }, { merge: true });

    loadUserBlogs(user.uid);
  } else {
    window.location = "login.html"; // Not logged-in
  }
});

// Publish new blog
storyForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.querySelector("#story-title").value;
  const desc = document.querySelector("#story-desc").value;
  const user = auth.currentUser;
  const { profile, name } = await getUserProfile(user.uid, user);

  await addDoc(collection(db, "blogs"), {
    title,
    description: desc,
    uid: user.uid,
    profile,
    firstName: name.split(" ")[0] || "",
    lastName: name.split(" ")[1] || "",
    createdAt: new Date()
  });

  Swal.fire({
    icon: "success",
    text: "Blog Published!",
    timer: 1300,
    showConfirmButton: false,
  });

  storyForm.reset();
  loadUserBlogs(user.uid);
});

// Logout
logoutBtn.addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location = "index.html";
  });
});
