# socket.iortc

socket.iortc is a library that combines WebRTC and Socket.IO to facilitate real-time communication. This library uses UDP protocol for data transfer using WebRTC ensuring low-latency and efficient communication. 

This library provides an interface identical to Socket.IO, making it easy for users familiar with socket.io to use.

<!-- It allows for communication between browsers and Node.js environments using WebRTC for direct connections and Socket.IO for signaling.  -->

## Features

- Peer-to-peer communication using WebRTC
- Signaling through WebSocket
- Support for both browser and Node.js environments
- Event-based architecture

## Installation

First, ensure you have Node.js installed. Then, install the package as shown below

```shell
npm install socket.iortc
```
This package works in the browser with [browserify](https://browserify.org). 
<!-- If you do not use a bundler, you can use the `socket-rtc.min.js` standalone script
directly in a `<script>` tag. This exports a `socket.iortc` constructor on
`window`. -->
# Usage
## Server

```js

const express = require('express');
const http = require('http');
const path = require('path');
const SocketRTC = require('socket.iortc');

const PORT = 8002;

const app = express();
app.use(express.static(path.join(__dirname)));

const server = http.createServer(app);

const rtc = new SocketRTC({ server });

rtc.on('connect', ({ id, pc }) => {
    console.log('Connected to peer with id:', id);
    rtc.send(JSON.stringify({ from: 'sserver',data: 'Hello, Peer! from node' }));
});

rtc.on('message', (data) => {
    console.log('Received message:', JSON.parse(data));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

```

## Client
Copy the `socketiortc.min.js` and paste it in project folder.


-  Include the minified file in your HTML file.
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SocketRTC</title>
    <script src="./socketiortc.min.js"></script>
</head>
<body>
    <h1>SocketRTC Client</h1>
    <script src="index.js"></script>
</body>
</html>

```

`index.js`
```js
let rtc = null;

rtc = new SocketRTC({ url: 'http://localhost:8002' });

rtc.on('connect', (id) => {
    console.log('connected');
    rtc.send(JSON.stringify({ from: id, data: 'Hello, Peer!' }));
});
rtc.on('disconnect', () => {
    console.log('disconnected')
});

rtc.on('message', (data) => {
    console.log(`message received: ${JSON.parse(data).data}`);
});

rtc.on('error', (err) => {
    console.error(err)
});

```



# Use Case
This library is ideal for scenarios where data needs to be sent quickly without the overhead of ensuring perfect delivery, such as:

- **Multiplayer application**: In multiplayer applications where player positions need to be communicated to all other players in real-time. Using UDP, updates can be sent quickly without worrying about packet loss or ordering, ensuring smooth gameplay even if some packets are dropped.