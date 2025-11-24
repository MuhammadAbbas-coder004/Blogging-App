import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { db } from "./config.js";

const blogsContainer = document.querySelector(".blogs-container");
const bigProfile = document.querySelector(".big-profile");
const bigName = document.querySelector(".big-username");
const bigEmail = document.querySelector(".big-email");
const allFrom = document.querySelector(".all-from");

// LOGIN BUTTON: always redirect to login.html
const loginBtn = document.querySelector(".login-btn");
if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    window.location.href = "login.html";
  });
}

async function loadUserBlogs() {
  const user = JSON.parse(localStorage.getItem("selectedUser"));
  if (!user) {
    blogsContainer.innerHTML = "No user selected!";
    return;
  }

  // Set basic profile info
  bigProfile.src = user.profile || "default-profile.jpg";
  bigName.textContent = `${user.name || "Anonymous"} ${user.lastName || ""}`;
  allFrom.textContent = `All from ${user.name || "Anonymous"} ${user.lastName || ""}`;

  blogsContainer.innerHTML = "Loading blogs...";

  try {
    const q = query(collection(db, "blogs"), where("uid", "==", user.uid));
    const querySnapshot = await getDocs(q);

    const blogs = [];
    let emailFromFirestore = null;

    querySnapshot.forEach(docSnap => {
      const data = docSnap.data();

      // agar Firestore me email hai to capture karo
      if (!emailFromFirestore && data.email) {
        emailFromFirestore = data.email;
      }

      blogs.push(data);
    });

    // Set email from localStorage ya Firestore
    if (user.email && user.email !== "No email available") {
      bigEmail.textContent = user.email;
    } else if (emailFromFirestore) {
      bigEmail.textContent = emailFromFirestore;
    } else {
      bigEmail.textContent = "No email available";
    }

    // Sort blogs by createdAt descending
    blogs.sort((a, b) => {
      const d1 = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
      const d2 = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
      return d2 - d1;
    });

    blogsContainer.innerHTML = "";

    if (blogs.length === 0) {
      blogsContainer.innerHTML = "No blogs found for this user.";
      return;
    }

    blogs.forEach(data => {
      const date = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
      const formattedDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });

      const cardHTML = document.createElement("div");
      cardHTML.classList.add("blog-card");
      cardHTML.innerHTML = `
        <div class="card-header">
          <img src="${data.profile || user.profile || 'default-profile.jpg'}" class="profile-pic">
          <span class="user-name">${user.name || "Anonymous"} ${user.lastName || ""}</span>
          <span class="publish-date">${formattedDate}</span>
        </div>
        <h3 class="card-title">${data.title || "No title"}</h3>
        <p class="card-desc">${data.description || "No description"}</p>
      `;
      blogsContainer.appendChild(cardHTML);
    });

  } catch (err) {
    console.error("Error loading user blogs:", err);
    blogsContainer.textContent = "Error loading blogs.";
  }
}

loadUserBlogs();
