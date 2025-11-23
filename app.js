import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { auth, db } from "./config.js";
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const blogsContainer = document.querySelector(".blogs-container");

// Load all blogs in descending order of createdAt
async function loadAllBlogs() {
  blogsContainer.innerHTML = "Loading blogs...";

  try {
    const blogsQuery = query(
      collection(db, "blogs"),
      orderBy("createdAt", "desc") // latest blogs first
    );
    const querySnapshot = await getDocs(blogsQuery);
    blogsContainer.innerHTML = "";

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const date = data.createdAt ? data.createdAt.toDate() : new Date();
      const formattedDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

      const card = document.createElement("div");
      card.classList.add("blog-card");

      card.innerHTML = `
        <div class="card-header">
          <img src="${data.profile || 'default-profile.jpg'}" alt="User Profile" class="profile-pic">
          <span class="user-name">${data.firstName || data.name || "Anonymous"} ${data.lastName || ""}</span>
          <span class="publish-date">${formattedDate}</span>
        </div>
        <h3 class="card-title">${data.title}</h3>
        <p class="card-desc">${data.description}</p>
        <button class="see-all-btn"><i class="fas fa-eye"></i> See all from this user</button>
      `;
      blogsContainer.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading blogs:", err);
    blogsContainer.innerHTML = "Failed to load blogs.";
  }
}

// Auth state: load all blogs (ordered)
onAuthStateChanged(auth, async (user) => {
  await loadAllBlogs();
});
