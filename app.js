// Initialize Peer
const peer = new Peer({
    host: '0.peerjs.com',
    port: 443,
    path: '/',
    debug: 3
});

let conn = null;

// When peer is open (ready)
peer.on('open', (id) => {
    document.getElementById('peer-id').textContent = id;
});

// Handle connection
peer.on('connection', (connection) => {
    if (conn) {
        connection.close();
        return;
    }
    
    conn = connection;
    setupConnection();
});

// Connect button
document.getElementById('connect').addEventListener('click', () => {
    const remoteId = document.getElementById('remote-id').value.trim();
    if (!remoteId) return;
    
    if (conn) {
        conn.close();
    }
    
    conn = peer.connect(remoteId);
    setupConnection();
});

// Send button
document.getElementById('send').addEventListener('click', () => {
    const message = document.getElementById('message').value.trim();
    if (!message || !conn) return;
    
    conn.send(message);
    appendMessage('You: ' + message);
    document.getElementById('message').value = '';
});

// Setup connection handlers
function setupConnection() {
    conn.on('open', () => {
        appendMessage('Connected to ' + conn.peer);
    });
    
    conn.on('data', (data) => {
        appendMessage(conn.peer + ': ' + data);
    });
    
    conn.on('close', () => {
        appendMessage('Connection closed');
        conn = null;
    });
    
    conn.on('error', (err) => {
        console.error(err);
        appendMessage('Connection error: ' + err);
    });
}

// Helper function to append messages to chat
function appendMessage(message) {
    const chat = document.getElementById('chat');
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    chat.appendChild(messageElement);
    chat.scrollTop = chat.scrollHeight;
}