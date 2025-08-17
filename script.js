let websocket = null;

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
}

window.addEventListener("DOMContentLoaded", connect);
