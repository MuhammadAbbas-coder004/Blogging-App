import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { auth, db } from "./config.js";
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
const upload = document.querySelector("#upload-btn");
const login = document.querySelector("#login");
const logoutbtn = document.querySelector("#logout");
const userImg = document.querySelector("#user-profile");
const uploadbtn = document.querySelector("#upload-btn");
const procontainer = document.querySelector(".product-container");
login.addEventListener("click", (event) => {
  event.preventDefault();
  window.location = "login.html";
});
onAuthStateChanged(auth, async (users) => {
  if (users) {
    const uid = users.uid;
    console.log(`User uid : ${uid}`);

    login.style.display = "none";
    logoutbtn.style.display = "block";
    upload.style.display = "block";
    userImg.style.display = "block";

    const userInfo = await getDataFromDB(uid, "users");
    userImg.src = userInfo.length > 0 ? userInfo[0].profile : "default.jpg";

    const allAds = await getDataFromDB(null, "ads");

    procontainer.innerHTML = ""; 

    allAds.map((item) => {
      procontainer.innerHTML += `
        <div class="card">
          <img class="carimg" src="${item.carImage}" alt="Product 1">
          <div class="card-content">
            <h3>${item.carTitle}</h3>
            <div class="price">$${item.carPrice}</div>
            <p>${item.carDescription}</p>
            <a href="#" data-id="${item.docid}" class="more-btn">
              <i class="fa-solid fa-circle-info"></i> More Info
            </a>
          </div>
          <div class="card-footer">
            <div class="location"><i class="fa-solid fa-location-dot"></i>${item.location || "Unknown"}</div>
            <i class="fa-regular fa-heart favorite"></i>
          </div>
        </div>
      `;
    });
    const moreInfoBtns = document.querySelectorAll(".more-btn");
    moreInfoBtns.forEach(btn => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        const id = btn.dataset.id;
        localStorage.setItem("itemID", id);
        window.location = "detail.html";
      });
    });

  } else {
    login.style.display = "block";
    logoutbtn.style.display = "none";
    upload.style.display = "none";
    userImg.style.display = "block";
    console.log("user is not login");
  }
});

async function getDataFromDB(uid, collections) {
  const userdata = [];
  let querySnapshot;

  if (uid) {
    const q = query(collection(db, collections), where("uid", "==", uid));
    querySnapshot = await getDocs(q);
  } else {
    querySnapshot = await getDocs(collection(db, collections));
  }

  querySnapshot.forEach((doc) => {
    userdata.push({ ...doc.data(), docid: doc.id });
  });

  return userdata;
}

logoutbtn.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      window.location = "index.html";
    })
    .catch((error) => {
      console.log(error, "error");
    });
});

uploadbtn.addEventListener("click", () => {
  window.location = "upload.html";
});
