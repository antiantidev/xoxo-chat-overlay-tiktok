let websocket = null;
const chatDiv = document.getElementById("chat");

let chatQueue = []; // Hàng đợi tin nhắn chat
let isProcessingChat = false;

// 👉 Biến lưu fieldData
let fieldData = {};

// 👉 Lấy giá trị từ fieldData
function getFieldValue(key, defaultValue) {
  try {
    return fieldData[key] !== undefined ? fieldData[key] : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

// 👉 Áp dụng fields -> CSS variables
function applyFields() {
  document.documentElement.style.setProperty(
    "--font-size",
    getFieldValue("fontSize", 22) + "px"
  );
  document.documentElement.style.setProperty(
    "--text-color",
    getFieldValue("textColor", "#000000")
  );
  // User
  document.documentElement.style.setProperty(
    "--user-bg",
    getFieldValue("userBg", "#ffffff")
  );
  document.documentElement.style.setProperty(
    "--user-border",
    getFieldValue("userBorder", "#000000")
  );

  // Nick Name
  document.documentElement.style.setProperty(
    "--nickname-bg",
    getFieldValue("nicknameBg", "#ffcc00")
  );
  document.documentElement.style.setProperty(
    "--nickname-text",
    getFieldValue("nicknameText", "#000000")
  );
  document.documentElement.style.setProperty(
    "--nickname-font-size",
    getFieldValue("nicknameFontSize", 20) + "px"
  );
  document.documentElement.style.setProperty(
    "--nickname-border",
    getFieldValue("nicknameBorder", "#000000")
  );
  document.documentElement.style.setProperty(
    "--text-background",
    getFieldValue("textBg", "#ffffff")
  );
  document.documentElement.style.setProperty(
    "--text-border",
    getFieldValue("textBorder", "#000000")
  );
  document.documentElement.style.setProperty(
    "--avatar-border",
    getFieldValue("avatarBorder", "#000000")
  );
  document.documentElement.style.setProperty(
    "--gifter-bg",
    getFieldValue("gifterBg", "rgba(71, 126, 255, 0.7)")
  );
  document.documentElement.style.setProperty(
    "--follow-bg",
    getFieldValue("followBg", "rgba(215, 78, 54, 0.6)")
  );
  document.documentElement.style.setProperty(
    "--top-gifter-bg",
    getFieldValue("topGifterBg", "rgba(254, 44, 85, 0.4)")
  );
  document.documentElement.style.setProperty(
    "--mod-bg",
    getFieldValue("modBg", "rgba(63, 63, 63, 0.5)")
  );
}

// 👉 Lấy settings từ fields
let maxMsgCount = 10;
let lineHeight = 90;
let showAvatar = false;

function updateMaxMsgCount() {
  const chatHeight = chatDiv.clientHeight;
  maxMsgCount = Math.floor(chatHeight / lineHeight);
}

window.addEventListener("resize", updateMaxMsgCount);

// 👉 Chỉ chạy khi widget load xong
window.addEventListener("onWidgetLoad", function (obj) {
  fieldData = obj.detail.fieldData || {};

  // apply style
  applyFields();

  // lấy settings
  maxMsgCount = getFieldValue("maxMessages", 10);
  lineHeight = getFieldValue("lineHeight", 90);
  showAvatar = getFieldValue("showAvatar", false);

  updateMaxMsgCount();
  connect();
});

// 👉 Kết nối WebSocket
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

      if (parsed.event === "chat" && parsed.data) {
        const {
          uniqueId,
          nickname,
          comment,
          profilePictureUrl,
          gifterLevel,
          isModerator,
          topGifterRank,
          teamMemberLevel,
        } = parsed.data;

        chatQueue.push({
          uniqueId,
          user: nickname,
          comment,
          avatar: profilePictureUrl,
          gifterLevel: gifterLevel || 0,
          isModerator: isModerator || false,
          topGifterRank: topGifterRank || 0,
          teamMemberLevel: teamMemberLevel || 0,
          type: "chat",
        });

        processChatQueue();
      }
    } catch (e) {
      console.error("Invalid JSON", e);
    }
  };
}

// 👉 Tạo nickname + badges
function createUserElement(data) {
  const name = document.createElement("div");
  name.className = "user";

  // Nickname
  const nicknameSpan = document.createElement("span");
  nicknameSpan.className = "nickname";
  nicknameSpan.textContent = data.user;
  name.appendChild(nicknameSpan);

  // Gifter badge
  if (data.gifterLevel > 0) {
    const gifterGroup = document.createElement("div");
    gifterGroup.className = "gifter-group";

    const gifterIcon = document.createElement("img");
    gifterIcon.className = "gifter-icon";

    const level = data.gifterLevel;
    if (level >= 50) {
      gifterIcon.src =
        "https://p16-webcast.tiktokcdn.com/webcast-va/grade_badge_icon_lite_lv50_v1.png~tplv-obj.image";
    } else if (level >= 45) {
      gifterIcon.src =
        "https://p16-webcast.tiktokcdn.com/webcast-va/grade_badge_icon_lite_lv45_v1.png~tplv-obj.image";
    } else if (level >= 40) {
      gifterIcon.src =
        "https://p16-webcast.tiktokcdn.com/webcast-va/grade_badge_icon_lite_lv40_v2.png~tplv-obj.image";
    } else if (level >= 35) {
      gifterIcon.src =
        "https://p16-webcast.tiktokcdn.com/webcast-va/grade_badge_icon_lite_lv35_v3.png~tplv-obj.image";
    } else if (level >= 30) {
      gifterIcon.src =
        "https://p16-webcast.tiktokcdn.com/webcast-va/grade_badge_icon_lite_lv30_v1.png~tplv-obj.image";
    } else if (level >= 25) {
      gifterIcon.src =
        "https://p16-webcast.tiktokcdn.com/webcast-va/grade_badge_icon_lite_lv25_v1.png~tplv-obj.image";
    } else if (level >= 20) {
      gifterIcon.src =
        "https://p16-webcast.tiktokcdn.com/webcast-va/grade_badge_icon_lite_lv20_v1.png~tplv-obj.image";
    } else if (level >= 15) {
      gifterIcon.src =
        "https://p16-webcast.tiktokcdn.com/webcast-va/grade_badge_icon_lite_lv15_v2.png~tplv-obj.image";
    } else if (level >= 10) {
      gifterIcon.src =
        "https://p16-webcast.tiktokcdn.com/webcast-va/grade_badge_icon_lite_lv10_v1.png~tplv-obj.image";
    } else if (level >= 5) {
      gifterIcon.src =
        "https://p16-webcast.tiktokcdn.com/webcast-va/grade_badge_icon_lite_lv5_v1.png~tplv-obj.image";
    } else {
      gifterIcon.src =
        "https://p16-webcast.tiktokcdn.com/webcast-va/grade_badge_icon_lite_lv0_v2.png~tplv-obj.image";
    }

    gifterIcon.alt = `LV${level}`;

    const gifterText = document.createElement("span");
    gifterText.className = "gifter-text";
    gifterText.textContent = `${level}`;

    gifterGroup.append(gifterIcon, gifterText);
    name.appendChild(gifterGroup);
  }

  // Team Member Badge (followRole)
  const teamLevel = data.teamMemberLevel || 0;

  if (teamLevel >= 1) {
    const followDiv = document.createElement("div");
    followDiv.className = "follow-badge";

    const followIcon = document.createElement("img");
    followIcon.className = "follow-icon";

    if (teamLevel >= 50) {
      followIcon.src =
        "https://p16-webcast.tiktokcdn.com/webcast-va/fans_badge_icon_lv50_v0.png~tplv-obj.image";
    } else if (teamLevel >= 40) {
      followIcon.src =
        "https://p16-webcast.tiktokcdn.com/webcast-va/fans_badge_icon_lv40_v0.png~tplv-obj.image";
    } else if (teamLevel >= 30) {
      followIcon.src =
        "https://p16-webcast.tiktokcdn.com/webcast-va/fans_badge_icon_lv30_v0.png~tplv-obj.image";
    } else if (teamLevel >= 20) {
      followIcon.src =
        "https://p16-webcast.tiktokcdn.com/webcast-va/fans_badge_icon_lv20_v0.png~tplv-obj.image";
    } else if (teamLevel >= 10) {
      followIcon.src =
        "https://p16-webcast.tiktokcdn.com/webcast-va/fans_badge_icon_lv10_v0.png~tplv-obj.image";
    } else {
      followIcon.src =
        "https://p16-webcast.tiktokcdn.com/webcast-va/fans_badge_icon_lv1_v0.png~tplv-obj.image";
    }

    const followText = document.createElement("span");
    followText.className = "follow-text";

    if (teamLevel >= 50) {
      followText.textContent = "Ⅵ";
    } else if (teamLevel >= 40) {
      followText.textContent = "Ⅴ";
    } else if (teamLevel >= 30) {
      followText.textContent = "Ⅳ";
    } else if (teamLevel >= 20) {
      followText.textContent = "Ⅲ";
    } else if (teamLevel >= 10) {
      followText.textContent = "Ⅱ";
    } else {
      followText.textContent = "Ⅰ";
    }

    followDiv.append(followIcon, followText);
    name.appendChild(followDiv);
  }

  // Top Gifter
  if ([1, 2, 3].includes(data.topGifterRank)) {
    const topGifterDiv = document.createElement("div");
    topGifterDiv.className = "top-gifter";

    const topIcon = document.createElement("img");
    topIcon.className = "top-icon";
    topIcon.src =
      "https://p16-webcast.tiktokcdn.com/webcast-sg/new_top_gifter_version_2.png~tplv-obj.image";
    topIcon.alt = "Top Gifter";

    const rankSpan = document.createElement("span");
    rankSpan.className = "top-rank";
    rankSpan.textContent = `#${data.topGifterRank}`;

    topGifterDiv.append(topIcon, rankSpan);
    name.appendChild(topGifterDiv);
  }

  // Moderator
  if (data.isModerator) {
    const modWrapper = document.createElement("div");
    modWrapper.className = "mod-wrapper";

    const modIcon = document.createElement("img");
    modIcon.className = "mod-icon";
    modIcon.src =
      "https://p16-webcast.tiktokcdn.com/webcast-va/moderater_badge_icon.png~tplv-obj.image";
    modIcon.alt = "Moderator";

    modWrapper.appendChild(modIcon);
    name.appendChild(modWrapper);
  }

  return name;
}

// 👉 Xử lý chat
function processChatQueue() {
  if (isProcessingChat || chatQueue.length === 0) return;

  isProcessingChat = true;
  const data = chatQueue.shift();

  const existingMsgs = Array.from(chatDiv.children);
  const firstRects = existingMsgs.map((el) => el.getBoundingClientRect());

  const div = document.createElement("div");
  div.className = "msg";

  if (data.isModerator) {
    div.classList.add("moderator-msg");
  }

  if (data.uniqueId === "nguyennhatlinh.official") {
    div.classList.add("special-user");
  }

  if (showAvatar) {
    const avatar = createSafeImage(data.avatar);
    div.appendChild(avatar);
  }

  const content = document.createElement("div");
  content.className = "msg-content";

  const name = createUserElement(data);

  const text = document.createElement("span");
  text.className = "text";
  text.textContent = data.comment;

  content.append(name, text);
  div.append(content);
  chatDiv.appendChild(div);

  animateIn(div, existingMsgs, firstRects, () => {
    trimMessages();
    isProcessingChat = false;
    processChatQueue();
  });
}

// 👉 Hiệu ứng trượt lên
function animateIn(div, existingMsgs, firstRects, callback) {
  requestAnimationFrame(() => {
    const lastRects = existingMsgs.map((el) => el.getBoundingClientRect());

    existingMsgs.forEach((el, i) => {
      const deltaY = firstRects[i].top - lastRects[i].top;

      if (deltaY !== 0) {
        el.style.transition = "none";
        el.style.transform = `translateY(${deltaY}px)`;
        el.getBoundingClientRect(); // force reflow
        el.style.transition = "transform 0.4s ease";
        el.style.transform = "translateY(0)";
      }
    });

    requestAnimationFrame(() => {
      div.classList.add("show");
      setTimeout(() => {
        if (typeof callback === "function") callback();
      }, 450);
    });
  });
}

// 👉 Giới hạn số tin nhắn hiển thị
function trimMessages() {
  while (chatDiv.children.length > maxMsgCount) {
    chatDiv.removeChild(chatDiv.firstChild);
  }
}

// 👉 Avatar có fallback
function createSafeImage(src) {
  const wrapper = document.createElement("div");
  wrapper.className = "avatar-wrapper";

  const img = document.createElement("img");
  img.className = "avatar";
  img.src = src;
  img.alt = "avatar";
  img.onerror = () => {
    img.src = "https://placehold.co/32x32";
  };

  wrapper.appendChild(img);
  return wrapper;
}
