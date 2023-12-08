const type = document.querySelectorAll(".type div button");
const copy = document.querySelector(".sdp button");
const chatbox = document.querySelector(".chatbox");

let connection = false;

// function to add chat element to DOM
const addChat = (message, type) => {
  const p = document.createElement("p");
  p.classList.add("chat");
  p.classList.add(type);
  p.innerText = message;

  chatbox.appendChild(p);
  chatbox.scrollTop = chatbox.scrollHeight;
};

// function to handle message and send it to other peer
document.querySelector(".message button").addEventListener("click", () => {
  const message = document.querySelector(".message input");

  if (!connection) {
    return alert("The connection is not established yet!");
  }
  if (!message.value) {
    return alert("Please enter the message!");
  }

  addChat(message.value, "sender");
  message.value = "";
});
