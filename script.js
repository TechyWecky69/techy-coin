const API = "http://localhost:5000";

function loadDashboard() {
  const userId = localStorage.getItem("userId");

  fetch(`${API}/get_user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userid: userId })
  })
  .then(res => res.json())
  .then(user => {
    if (!user.userid) {
      alert("User not found");
      return;
    }

    document.getElementById("balance").textContent = `Balance: $${user.balance.toFixed(2)}`;

    const list = document.getElementById("coin-list");
    list.innerHTML = "";
    user.coins.forEach(code => {
      const li = document.createElement("li");
      li.textContent = code;
      list.appendChild(li);
    });

    // Disable buy button if balance too low
    const buyBtn = document.getElementById("buy-btn");
    if (user.balance < 1) {
      buyBtn.disabled = true;
      document.getElementById("buy-message").textContent = "You don't have enough money to buy coins.";
    } else {
      buyBtn.disabled = false;
    }

    // Store latest user data for selling
    window.currentUserData = user;
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
    } else {
      document.getElementById("buy-message").textContent = data.error || "Purchase failed.";
    }
    loadDashboard(); // Refresh info
  });
}

function sellCoins() {
  const amountToSell = parseInt(document.getElementById("sell-amount").value);
  const userId = localStorage.getItem("userId");

  if (!amountToSell || amountToSell < 1) {
    document.getElementById("sell-message").textContent = "Enter a valid number of coins to sell.";
    return;
  }

  const user = window.currentUserData;
  if (amountToSell > user.coins.length) {
    document.getElementById("sell-message").textContent = "You don't own that many coins.";
    return;
  }

  // Remove coins from list
  const coinsToSell = user.coins.slice(0, amountToSell);
  const remainingCoins = user.coins.slice(amountToSell);
  const newBalance = user.balance + (1.0 * amountToSell);

  // Update on server via custom /update_user endpoint (or directly update file for now)
  fetch(`${API}/get_user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userid: userId })
  })
  .then(res => res.json())
  .then(latestUser => {
    latestUser.balance = newBalance;
    latestUser.coins = remainingCoins;

    // Overwrite entire user file
    fetch("/update_user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: latestUser })
    })
    .then(() => {
      document.getElementById("sell-message").textContent = `Sold ${amountToSell} coin(s) for $${(amountToSell).toFixed(2)}`;
      loadDashboard();
    });
  });
}

// Auto-load dashboard
if (window.location.pathname.includes("dashboard.html")) {
  loadDashboard();
}
