import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { auth, db } from "./config.js";
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const blogsContainer = document.querySelector(".blogs-container");

// Fetch user profile info from Firestore
async function getUserProfile(uid, userAuth) {
  const q = query(collection(db, "users"), where("uid", "==", uid));
  const snap = await getDocs(q);

  let profile = userAuth?.photoURL || "default-profile.jpg";
  let name = userAuth?.displayName || "Anonymous";

  if (!snap.empty) {
    const data = snap.docs[0].data();
    profile = data.profile || profile;

    if (data.firstName || data.lastName) {
      name = `${data.firstName || ""} ${data.lastName || ""}`.trim();
    } else if (data.name) {
      name = data.name;
    }
  }

  return { profile, name };
}

// Load all blogs from Firestore
async function loadAllBlogs(currentUserUID) {
  blogsContainer.innerHTML = "Loading blogs...";

  // Order all blogs by createdAt ascending (oldest first)
  const q = query(collection(db, "blogs"), orderBy("createdAt", "asc"));
  const querySnapshot = await getDocs(q);
  blogsContainer.innerHTML = "";

  const normalBlogs = [];
  const currentUserBlogs = [];

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const date = data.createdAt ? data.createdAt.toDate() : new Date();
    const formattedDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    const cardHTML = `
      <div class="blog-card">
        <div class="card-header">
          <img src="${data.profile || 'default-profile.jpg'}" alt="User Profile" class="profile-pic">
          <span class="user-name">${data.firstName || data.name || "Anonymous"} ${data.lastName || ""}</span>
          <span class="publish-date">${formattedDate}</span>
        </div>
        <h3 class="card-title">${data.title}</h3>
        <p class="card-desc">${data.description}</p>
        <button class="see-all-btn"><i class="fas fa-eye"></i> See all from this user</button>
      </div>
    `;

    // Split current user's blogs to append at the end
    if (data.uid === currentUserUID) {
      currentUserBlogs.push(cardHTML);
    } else {
      normalBlogs.push(cardHTML);
    }
  });

  // Render: older blogs first, current user's blogs last
  blogsContainer.innerHTML = normalBlogs.join("") + currentUserBlogs.join("");
}

// Auth state: load blogs
onAuthStateChanged(auth, async (user) => {
  const currentUID = user ? user.uid : null;
  await loadAllBlogs(currentUID);
});
