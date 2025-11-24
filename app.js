import { collection, getDocs, query, orderBy, Timestamp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { db } from "./config.js";

const blogsContainer = document.querySelector(".blogs-container");


const loginBtn = document.querySelector(".login-btn");
if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    window.location.href = "login.html";
  });
}


async function loadAllBlogs() {
  if (!blogsContainer) return;

  blogsContainer.innerHTML = "Loading blogs...";
  const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  blogsContainer.innerHTML = "";

  querySnapshot.forEach(docSnap => {
    const data = docSnap.data();
    const date = data.createdAt ? data.createdAt.toDate() : new Date();
    const formattedDate = date.toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });

    const cardHTML = document.createElement("div");
    cardHTML.classList.add("blog-card");
    cardHTML.innerHTML = `
      <div class="card-header">
        <img src="${data.profile || 'default-profile.jpg'}" class="profile-pic">
        <span class="user-name">${data.firstName || data.name || 'Anonymous'} ${data.lastName || ''}</span>
        <span class="publish-date">${formattedDate}</span>
      </div>
      <h3 class="card-title">${data.title}</h3>
      <p class="card-desc">${data.description}</p>
      <button class="see-all-btn"><i class="fas fa-eye"></i> See all from this user</button>
    `;

    const seeBtn = cardHTML.querySelector(".see-all-btn");
    seeBtn.addEventListener("click", () => {
      localStorage.setItem("selectedUserUID", data.uid);
      window.location.href = `userblogs.html`;
    });

    blogsContainer.appendChild(cardHTML);
  });
}

loadAllBlogs();
