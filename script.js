let websocket = null;

function connect() {
  if (websocket) return;

  websocket = new WebSocket("ws://localhost:21213/");

  websocket.onopen = () => {
    document.getElementById("status").innerHTML = `
      Connected<br>
      <a href="/xoxo-chat-overlay-tiktok/chat" target="_blank"><button>Go To Chat</button></a>
      <a href="/xoxo-chat-overlay-tiktok/events" target="_blank"><button>Go To Events</button></a>
    `;
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
}

window.addEventListener("DOMContentLoaded", connect);
