const express = require('express');
const http = require('http');
const path = require('path');
const SocketRTC = require('./src/socketrtc');

const app = express();
const server = http.createServer(app);

const PORT = 8001;

app.use(express.static(path.join(__dirname, 'dist')));

const socketRTC = new SocketRTC({ server })
socketRTC.on('connect', (data) => {
    console.log('peer connection established: ', data.id);
})

socketRTC.on('disconnect', (data) => {
    console.log('peer connection disconnected');
})

// This event listener is bound to the 'message' event on the socketRTC object.
// When a message is sent from the user, socketRTC emits the 'message' event

socketRTC.on('message', (data) => {
    console.log(`data: ${data}`)
    
    // Handle message from user, eg: storing it for restoring message history
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


