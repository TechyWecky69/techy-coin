const API = "http://localhost:5000"; // Make sure your Flask server is running!

function createAccount() {
  const username = document.getElementById("create-username").value;
  const password = document.getElementById("create-password").value;

  fetch(`${API}/create_account`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.userid) {
      document.getElementById("create-message").textContent = "Account created! Your ID: " + data.userid;
    }
  });
}

function login() {
  const userId = document.getElementById("login-userid").value;
  localStorage.setItem("userId", userId);
  window.location.href = "dashboard.html";
}

function loadDashboard() {
  const userId = localStorage.getItem("userId");
  fetch("userdata.json")
    .then(res => res.json())
    .then(users => {
      const user = users[userId];
      if (!user) {
        alert("User not found.");
        return;
      }
      document.getElementById("balance").textContent = `Balance: $${user.balance}`;

      const list = document.getElementById("coin-list");
      list.innerHTML = "";
      user.coins.forEach(code => {
        const li = document.createElement("li");
        li.textContent = code;
        list.appendChild(li);
      });
    });
}

function buyCoin() {
  const userId = localStorage.getItem("userId");
  fetch(`${API}/buy_coin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userid: userId })
  })
  .then(res => res.json())
  .then(data => {
    if (data.code) {
      document.getElementById("buy-message").textContent = `Coin purchased: ${data.code} ($${data.value})`;
      loadDashboard(); // Refresh info
    } else {
      document.getElementById("buy-message").textContent = "Purchase failed: " + (data.error || "Unknown error");
    }
  });
}

// Run on dashboard page
if (window.location.pathname.includes("dashboard.html")) {
  loadDashboard();
}

