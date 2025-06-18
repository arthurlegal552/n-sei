// ====== GLOBALS ====== //
const peer = new Peer();
let conn = null;
let username = "";
let connectedUsers = {};

// ====== DOM ELEMENTS ====== //
const loginUI = document.getElementById("login");
const chatUI = document.getElementById("chat-ui");
const joinBtn = document.getElementById("join");
const connectBtn = document.getElementById("connect");
const sendBtn = document.getElementById("send");
const messageInput = document.getElementById("message");
const chatDisplay = document.getElementById("chat");
const displayUsername = document.getElementById("display-username");
const usersDisplay = document.getElementById("users");

// ====== FUNCTIONS ====== //
function addMessage(text, sender = "system") {
    const msgElement = document.createElement("div");
    msgElement.classList.add("message");
    
    if (sender === username) {
        msgElement.classList.add("you");
        msgElement.textContent = `You: ${text}`;
    } else if (sender === "system") {
        msgElement.classList.add("system");
        msgElement.textContent = text;
    } else {
        msgElement.textContent = `${sender}: ${text}`;
    }
    
    chatDisplay.appendChild(msgElement);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

function updateUsersList() {
    const users = Object.values(connectedUsers);
    usersDisplay.textContent = `Online: ${username}${users.length ? `, ${users.join(", ")}` : ""}`;
}

function resetConnection() {
    if (conn) conn.close();
    conn = null;
    connectedUsers = {};
    updateUsersList();
    connectBtn.disabled = false;
    connectBtn.textContent = "Connect";
    messageInput.disabled = true;
    sendBtn.disabled = true;
}

// ====== EVENT LISTENERS ====== //
joinBtn.addEventListener("click", () => {
    username = document.getElementById("username").value.trim();
    if (!username) return alert("Please enter a username!");
    
    peer.on("open", (id) => {
        displayUsername.textContent = username;
        loginUI.style.display = "none";
        chatUI.style.display = "block";
        addMessage("Welcome! Share your code: " + id.substring(0, 4));
    });
    
    peer.on("error", (err) => {
        addMessage("Error: " + err.message);
    });
});

connectBtn.addEventListener("click", () => {
    const remoteCode = document.getElementById("remote-id").value.trim();
    if (!remoteCode || remoteCode.length !== 4) return alert("Enter a valid 4-digit code!");
    
    connectBtn.disabled = true;
    connectBtn.textContent = "Connecting...";
    
    // In a real app, use a server to map codes to full IDs
    const remoteId = remoteCode + peer.id.substring(4);
    
    resetConnection();
    conn = peer.connect(remoteId);
    
    conn.on("open", () => {
        connectBtn.textContent = "Connected!";
        messageInput.disabled = false;
        sendBtn.disabled = false;
        conn.send({ type: "username", username });
    });
    
    conn.on("data", (data) => {
        if (data.type === "username") {
            connectedUsers[data.username] = data.username;
            updateUsersList();
            addMessage(`${data.username} joined the chat!`, "system");
        } else if (data.type === "message") {
            addMessage(data.text, data.username);
        }
    });
    
    conn.on("close", () => {
        addMessage("Disconnected.", "system");
        resetConnection();
    });
    
    conn.on("error", (err) => {
        addMessage("Connection error: " + err.message, "system");
        resetConnection();
    });
});

sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});

function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || !conn) return;
    
    conn.send({ type: "message", text, username });
    addMessage(text, username);
    messageInput.value = "";
}

// Handle incoming connections
peer.on("connection", (connection) => {
    if (conn) {
        connection.close();
        return;
    }
    
    conn = connection;
    messageInput.disabled = false;
    sendBtn.disabled = false;
    
    conn.on("data", (data) => {
        if (data.type === "username") {
            connectedUsers[data.username] = data.username;
            updateUsersList();
            addMessage(`${data.username} joined the chat!`, "system");
        } else if (data.type === "message") {
            addMessage(data.text, data.username);
        }
    });
    
    conn.on("close", () => {
        addMessage("Disconnected.", "system");
        resetConnection();
    });
});