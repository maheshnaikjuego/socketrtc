# SocketRTC

SocketRTC is a library that combines WebRTC and Socket.IO to facilitate real-time communication. This library uses UDP protocol for data transfer using WebRTC ensuring low-latency and efficient communication. 

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
npm install socket-rtc
```
This package works in the browser with [browserify](https://browserify.org). 
<!-- If you do not use a bundler, you can use the `socket-rtc.min.js` standalone script
directly in a `<script>` tag. This exports a `SocketRTC` constructor on
`window`. -->
# Usage
## Server

```js

const express = require('express');
const http = require('http');
const path = require('path');
const SocketRTC = require('socket-rtc');

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
Bundle the js file using browserify or any other bundler.

- Install `browserify`
```shell
npm install -g browserify
```
```js
const SocketRTC = require('socket-rtc');

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

- Bundle your JavaScript with Browserify: Use Browserify to bundle your JavaScript file so that it can be used in the browser.
```shell
browserify main.js -o bundle.js
```
-  Include the bundled JavaScript file in your HTML file.
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SocketRTC</title>
</head>
<body>
    <h1>SocketRTC Client</h1>
    <script src="bundle.js"></script>
</body>
</html>

```