// Ambil semua elemen HTML
const loginScreen = document.getElementById("loginScreen");
const chatScreen = document.getElementById("chatScreen");
const usernameInput = document.getElementById("username");
const loginBtn = document.getElementById("loginBtn");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const messagesDiv = document.getElementById("messages");
const logoutBtn = document.getElementById("logoutBtn");
const loginStatus = document.getElementById("loginStatus");

let currentUser = null;
let username = "";

// 🔐 Login dengan Google
loginBtn.addEventListener("click", () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider);
});

// 🚪 Logout
logoutBtn.addEventListener("click", () => {
  firebase.auth().signOut();
  chatScreen.classList.add("hidden");
  loginScreen.classList.remove("hidden");
  messagesDiv.innerHTML = "";
});

// 📩 Kirim pesan
sendBtn.addEventListener("click", () => {
  const msg = messageInput.value.trim();
  if (msg && currentUser) {
    const messagesRef = firebase.database().ref("messages");
    messagesRef.push({
      username: username,
      message: msg,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      uid: currentUser.uid
    });
    messageInput.value = "";
  }
});

// 🔔 Enter untuk kirim
messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendBtn.click();
});

// 👁️ Dengarkan siapa yang login
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    currentUser = user;

    // Simpan nama samaran di localStorage biar tetap ada
    username = localStorage.getItem("username") || prompt("Pilih nama samaran:", "Teman Baru");
    if (!localStorage.getItem("username")) {
      localStorage.setItem("username", username);
    }

    loginScreen.classList.add("hidden");
    chatScreen.classList.remove("hidden");
    loginStatus.textContent = `Halo, ${username}!`;

    // Muat semua pesan dari Firebase
    loadMessages();
  } else {
    loginScreen.classList.remove("hidden");
    chatScreen.classList.add("hidden");
  }
});

// 💬 Muat pesan dari database
function loadMessages() {
  const messagesRef = firebase.database().ref("messages");
  messagesRef.limitToLast(100).on("child_added", (snapshot) => {
    const data = snapshot.val();
    const msgElement = document.createElement("div");
    msgElement.classList.add("message");
    
    if (data.uid === currentUser.uid) {
      msgElement.classList.add("my-message");
    } else {
      msgElement.classList.add("other-message");
    }

    const nameSpan = document.createElement("strong");
    nameSpan.textContent = data.username || "Anonim";
    msgElement.appendChild(nameSpan);

    const textNode = document.createElement("p");
    textNode.textContent = data.message;
    msgElement.appendChild(textNode);

    messagesDiv.appendChild(msgElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}
