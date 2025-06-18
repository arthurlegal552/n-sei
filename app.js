// Initialize Peer
const peer = new Peer({
    host: '0.peerjs.com',
    port: 443,
    path: '/',
    debug: 3
});

let conn = null;

// DOM Elements
const peerIdElement = document.getElementById('peer-id');
const remoteIdInput = document.getElementById('remote-id');
const connectBtn = document.getElementById('connect');
const messageInput = document.getElementById('message');
const sendBtn = document.getElementById('send');
const chatDisplay = document.getElementById('chat');

// When peer is open (ready)
peer.on('open', (id) => {
    peerIdElement.textContent = id;
});

// Handle incoming connections
peer.on('connection', (connection) => {
    if (conn) {
        connection.close();
        return;
    }
    
    conn = connection;
    setupConnection();
    addSystemMessage(`${conn.peer} connected`);
});

// Connect button
connectBtn.addEventListener('click', () => {
    const remoteId = remoteIdInput.value.trim();
    if (!remoteId) return;
    
    if (conn) {
        conn.close();
    }
    
    conn = peer.connect(remoteId);
    setupConnection();
});

// Send button
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Setup connection handlers
function setupConnection() {
    conn.on('open', () => {
        addSystemMessage(`Connected to ${conn.peer}`);
        messageInput.disabled = false;
        sendBtn.disabled = false;
    });
    
    conn.on('data', (data) => {
        addMessage(data, false);
    });
    
    conn.on('close', () => {
        addSystemMessage('Connection closed');
        conn = null;
        messageInput.disabled = true;
        sendBtn.disabled = true;
    });
    
    conn.on('error', (err) => {
        addSystemMessage(`Error: ${err}`);
    });
}

// Send message function
function sendMessage() {
    const message = messageInput.value.trim();
    if (!message || !conn) return;
    
    conn.send(message);
    addMessage(message, true);
    messageInput.value = '';
}

// Add message to chat
function addMessage(message, isLocal) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(isLocal ? 'local-message' : 'remote-message');
    messageElement.textContent = message;
    chatDisplay.appendChild(messageElement);
    scrollToBottom();
}

// Add system message
function addSystemMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('system-message');
    messageElement.textContent = message;
    chatDisplay.appendChild(messageElement);
    scrollToBottom();
}

// Scroll chat to bottom
function scrollToBottom() {
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}