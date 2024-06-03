const express = require('express');
const http = require('http');
const path = require('path');
const SocketRTC = require('./src/socketrtc');

const app = express();
const server = http.createServer(app);

const PORT = 8001;

app.use(express.static(path.join(__dirname, 'dist')));

const socketRTC = new SocketRTC({server}, 'server')

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


