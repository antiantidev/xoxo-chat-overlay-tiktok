let websocket = null;
const welcomeQueue = [];
const giftQueue = [];

let isProcessingWelcome = false;
let isProcessingGift = false;

const giftSound = new Audio("./assets/gift.wav");
giftSound.volume = 1; // âm lượng từ 0 đến 1

// Kết nối WebSocket
function connect() {
  if (websocket) return;

  websocket = new WebSocket("ws://localhost:21213/");

  websocket.onopen = () => {
    document.getElementById("status").innerHTML = "Connected";
  };

  websocket.onclose = () => {
    document.getElementById("status").innerHTML = "Disconnected";
    websocket = null;
    setTimeout(connect, 1000);
  };

  websocket.onerror = () => {
    document.getElementById("status").innerHTML = "Connection Failed";
    websocket = null;
    setTimeout(connect, 1000);
  };

  websocket.onmessage = (event) => {
    try {
      const parsed = JSON.parse(event.data);

      if (parsed.event === "member" && parsed.data) {
        const { nickname, profilePictureUrl } = parsed.data;
        if (!nickname || !profilePictureUrl) return;
        welcomeQueue.push({ user: nickname, avatar: profilePictureUrl });
        processWelcomeQueue();
      }

      if (parsed.event === "gift" && parsed.data) {
        const { nickname, profilePictureUrl, giftName, repeatCount } =
          parsed.data;
        if (!nickname || !profilePictureUrl || !giftName) return;
        giftQueue.push({
          user: nickname,
          avatar: profilePictureUrl,
          giftName,
          repeatCount,
        });
        processGiftQueue();
      }
    } catch (e) {
      console.error("Invalid JSON", e);
    }
  };
}

window.addEventListener("DOMContentLoaded", connect);

// Xử lý welcome
function processWelcomeQueue() {
  if (isProcessingWelcome || welcomeQueue.length === 0) return;

  isProcessingWelcome = true;
  const data = welcomeQueue.shift();

  const welcomeBox = document.getElementById("welcome-container");
  if (!welcomeBox) return;

  welcomeBox.innerHTML = "";

  const div = document.createElement("div");
  div.className = "welcome";

  const head = document.createElement("div");
  head.className = "welcome-head";
  head.textContent = `Welcome`;

  const content = document.createElement("div");
  content.className = "welcome-content";

  const avatar = document.createElement("img");
  avatar.className = "welcome-avatar";
  avatar.src = data.avatar;
  avatar.alt = "avatar";
  avatar.onerror = () => {
    avatar.src = "https://placehold.co/40x40";
  };

  const text = document.createElement("span");
  text.className = "welcome-text";
  text.textContent = `🌟 ${data.user} vừa tham gia live!`;

  content.append(avatar, text);
  div.append(head, content);
  welcomeBox.appendChild(div);

  void div.offsetWidth;
  div.classList.add("show");

  setTimeout(() => {
    div.classList.remove("show");
    setTimeout(() => {
      welcomeBox.removeChild(div);
      isProcessingWelcome = false;
      processWelcomeQueue();
    }, 600);
  }, 2500);
}

function processGiftQueue() {
  if (isProcessingGift || giftQueue.length === 0) return;

  isProcessingGift = true;
  const data = giftQueue.shift();

  const giftBox = document.getElementById("gift-container");
  if (!giftBox) return;

  giftBox.innerHTML = "";

  const div = document.createElement("div");
  div.className = "gift";

  const head = document.createElement("div");
  head.className = "gift-head";
  head.textContent = `New gift`;

  const content = document.createElement("div");
  content.className = "gift-content";

  const avatar = document.createElement("img");
  avatar.className = "gift-avatar";
  avatar.src = data.avatar;
  avatar.alt = "avatar";
  avatar.onerror = () => {
    avatar.src = "https://placehold.co/40x40";
  };

  const text = document.createElement("span");
  text.className = "gift-text";
  text.textContent = `⭐ Cảm ơn ${data.user} đã tặng ${data.repeatCount} x ${data.giftName}!`;

  content.append(avatar, text);
  div.append(head, content);
  giftBox.appendChild(div);

  // 🔊 Phát âm thanh thông báo
  giftSound.currentTime = 0;
  giftSound.play().catch((e) => {
    console.warn("Không thể phát âm thanh:", e);
  });

  void div.offsetWidth;
  div.classList.add("show");

  setTimeout(() => {
    div.classList.remove("show");
    setTimeout(() => {
      giftBox.removeChild(div);
      isProcessingGift = false;
      processGiftQueue();
    }, 600);
  }, 5000);
}
