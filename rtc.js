const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

const rtc = new RTCPeerConnection(servers);

const type = document.querySelectorAll(".type div button");
const copy = document.querySelector(".sdp button");
const chatbox = document.querySelector(".chatbox");
let flag = "";
let connection = false;
let sendMessage; // it will going to be a function which sends message to other peer

type[0].addEventListener("click", () => {
  if (flag) {
    return alert(`Already logged as ${flag}`);
  }

  type[0].style.backgroundColor = "rgb(255, 216, 168)";
  copy.innerText = "copy sdp offer";
  flag = "sender";

  handleSender();
});

type[1].addEventListener("click", () => {
  if (flag) {
    return alert(`Already logged as ${flag}`);
  }

  type[1].style.backgroundColor = "rgb(255, 216, 168)";
  copy.innerText = "copy sdp answer";
  flag = "receiver";

  handleReceiver();
});

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
const handleMessage = (event) => {
  event.preventDefault();
  const message = document.querySelector(".message input");

  if (!connection) {
    return alert("The connection is not established yet!");
  }
  if (!message.value) {
    return alert("Please enter the message!");
  }

  addChat(message.value, "sender");
  sendMessage(message.value);
  message.value = "";
};

// function to set sender's remote description
const setRemoteDesc = async (answer) => {
  try {
    await rtc.setRemoteDescription(answer);
    console.log("Set sender remote description!!!");

    const iceCandidates = JSON.parse(prompt("Add remote ice candidates :"));
    iceCandidates.forEach((iceCand) => {
      const ice = new RTCIceCandidate(iceCand);
      rtc.addIceCandidate(ice);
    });
  } catch (e) {
    console.error("Error while setting sender remote description: ");
    console.error(e);
  }
};

// function to setup WebRTC connection at the sender's end
const handleSender = async () => {
  const dc = rtc.createDataChannel("channel");

  dc.onmessage = (e) => {
    console.log("Got Message:", e.data);
    addChat(e.data, "receiver");
  };

  dc.onopen = (e) => {
    console.log("Receiver Connected ");
    copy.innerText = "connection established!";
    connection = true;
  };

  sendMessage = (message) => {
    dc.send(message);
  };

  let iceCandidates = [];
  let offer;

  rtc.onicecandidate = (e) => {
    e.candidate && iceCandidates.push(e.candidate.toJSON());
  };

  try {
    offer = await rtc.createOffer();
    console.log("Offer :", offer);

    await rtc.setLocalDescription(offer);
    console.log("Set local description");
  } catch (err) {
    console.error(err);
    console.error("Error while creating offer!");
  }

  copy.addEventListener("click", () => {
    if (copy.innerText === "copy sdp offer") {
      console.log("Offer copied :", offer);

      navigator.clipboard.writeText(JSON.stringify(offer));
      copy.innerText = "copied!!";

      setTimeout(() => {
        copy.innerText = "add answer sdp";
      }, 1000);
    } else {
      const answer = JSON.parse(prompt("Enter the answer sdp"));
      if (answer) setRemoteDesc(answer);
    }
  });

  console.log("Ice Candidates :", iceCandidates);
};

// function to setup WebRTC connection at the receiver's end
const handleReceiver = async () => {
  const offer = prompt("Enter the offer SDP token:");
  console.log("Offer received :", offer);

  if (offer.length < 20) {
    alert("Can't proceed without offer sdp");
    return;
  }

  const iceCandidates = [];
  let answer;

  rtc.onicecandidate = (e) => {
    e.candidate && iceCandidates.push(e.candidate.toJSON());
  };

  rtc.ondatachannel = (e) => {
    rtc.dc = e.channel;

    rtc.dc.onmessage = (e) => {
      console.log("Received message :", e.data);
      addChat(e.data, "receiver");
    };

    rtc.dc.onopen = (e) => {
      console.log("Connection Opened!");
      copy.innerText = "connection established!";
      connection = true;
    };
  };

  sendMessage = (message) => {
    rtc.dc.send(message);
  };

  try {
    await rtc.setRemoteDescription(JSON.parse(offer));
    console.log("Successfully set Remote Description or Offer!");

    const remoteIceCandidates = JSON.parse(
      prompt("Enter all ice candidates :")
    );
    remoteIceCandidates.forEach((iceCand) => {
      const ice = new RTCIceCandidate(iceCand);
      rtc.addIceCandidate(ice);
    });
  } catch (e) {
    console.error(e);
    console.error("Error while setting offer");
  }

  try {
    answer = await rtc.createAnswer();
    console.log("Answer :", answer);

    await rtc.setLocalDescription(answer);
    console.log("Set local description");
  } catch (err) {
    console.error(err);
    console.error("Error while creating answer!");
  }

  copy.addEventListener("click", () => {
    console.log("Answer copied :", answer);

    navigator.clipboard.writeText(JSON.stringify(answer));
    copy.innerText = "copied!!";
  });

  console.log("Ice Candidates :", iceCandidates);
};
