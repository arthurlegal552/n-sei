// Replace the connectBtn click handler with this:
connectBtn.addEventListener('click', async () => {
    const remoteCode = document.getElementById('remote-code').value.trim();
    if (!remoteCode || remoteCode.length !== 4) return alert('Enter a 4-digit code');
    
    connectBtn.disabled = true;
    connectBtn.textContent = 'Connecting...';
    
    try {
        // In a real app, you'd need a server to map codes to IDs
        // For demo, we assume the remote peer has same ID structure
        const remoteId = remoteCode + peer.id.substring(4);
        
        if (conn) conn.close();
        conn = peer.connect(remoteId);
        
        conn.on('open', () => {
            connectBtn.textContent = 'Connected!';
            connectBtn.style.backgroundColor = '#a1e6a1';
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
        
        conn.on('close', () => {
            addMessage('Connection closed');
            resetConnectionUI();
        });
        
        conn.on('error', (err) => {
            addMessage(`Error: ${err.message}`);
            resetConnectionUI();
        });
        
    } catch (err) {
        addMessage(`Failed to connect: ${err.message}`);
        resetConnectionUI();
    }
});

function resetConnectionUI() {
    connectBtn.disabled = false;
    connectBtn.textContent = 'Connect';
    connectBtn.style.backgroundColor = '';
    conn = null;
}