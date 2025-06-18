// Simplified PeerJS Chat with usernames and short codes
const peer = new Peer();
let conn = null;
let username = '';
let shortCode = '';

// DOM elements
const loginUI = document.getElementById('login');
const chatUI = document.getElementById('chat-ui');
const joinBtn = document.getElementById('join');
const connectBtn = document.getElementById('connect');
const sendBtn = document.getElementById('send');

// Join chat with username
joinBtn.addEventListener('click', () => {
    username = document.getElementById('username').value.trim();
    if (!username) return alert('Please enter a username');
    
    peer.on('open', (id) => {
        // Generate 4-digit code from first part of peer ID
        shortCode = id.substring(0, 4);
        
        document.getElementById('display-username').textContent = username;
        document.getElementById('your-code').textContent = shortCode;
        loginUI.classList.add('hidden');
        chatUI.classList.remove('hidden');
    });
});

// Connect to another peer
connectBtn.addEventListener('click', () => {
    const remoteCode = document.getElementById('remote-code').value.trim();
    if (!remoteCode || remoteCode.length !== 4) return alert('Enter a 4-digit code');
    
    // In a real app, you'd need a server to map short codes to full peer IDs
    // For this demo, we'll assume the remote peer has the same prefix
    const remoteId = remoteCode + peer.id.substring(4);
    
    if (conn) conn.close();
    conn = peer.connect(remoteId);
    
    conn.on('open', () => {
        conn.send({ type: 'username', value: username });
        addMessage(`Connected to ${remoteCode}`);
    });
    
    conn.on('data', (data) => {
        if (data.type === 'username') {
            addMessage(`${data.value} joined the chat`);
        } else {
            addMessage(`${data.sender}: ${data.text}`);
        }
    });
    
    conn.on('close', () => addMessage('Connection closed'));
});

// Send message
sendBtn.addEventListener('click', sendMessage);
document.getElementById('message').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
    const msgInput = document.getElementById('message');
    const text = msgInput.value.trim();
    if (!text || !conn) return;
    
    conn.send({ 
        type: 'message', 
        text: text, 
        sender: username 
    });
    addMessage(`You: ${text}`);
    msgInput.value = '';
}

function addMessage(msg) {
    const chat = document.getElementById('chat');
    const div = document.createElement('div');
    div.textContent = msg;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

// Handle incoming connections
peer.on('connection', (connection) => {
    if (conn) return connection.close();
    
    conn = connection;
    conn.on('data', (data) => {
        if (data.type === 'username') {
            addMessage(`${data.value} joined the chat`);
        } else {
            addMessage(`${data.sender}: ${data.text}`);
        }
    });
    conn.send({ type: 'username', value: username });
});