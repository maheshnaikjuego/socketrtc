const SimplePeer = require('simple-peer');

class SocketRTC {
    constructor(socketConfig, id = "", rtcconfig = {}) {

        this.peer = null;
        this.id = id;
        this.socket = null;
        if (typeof window === 'undefined') {
            // Node.js environment
            const wrtc = require('wrtc');
            this.config = Object.assign({ wrtc: wrtc }, rtcconfig);
            this.io = require('socket.io')(socketConfig.server);
            this.clients = {};
            this.initializeServer();
        } else {
            // Browser environment
            this.config = rtcconfig;
            const socketioclient = require('socket.io-client');
            this.socket = socketioclient(socketConfig.url);
            this.initializeClient();
        }

    }

    initializeServer() {
        this.io.on('connection', (socket) => {
            this.socket = socket;
            this.peer = new SimplePeer(this.config);
            // this.clients[this.id] = this.peer;
            console.log('socket connected', socket.id);
            this.peer.on('connect', () => {
                console.log('peerconnection established');
                // peer.send(JSON.stringify({ from: 'Server', data: 'Hello from Node server!' }));
            });

            this.peer.on('signal', this._onPeerSignal.bind(this));

            this.peer.on('data', (data) => {
                const pdata = JSON.parse(data);
                // console.log(Object.keys(this.clients))
                Object.keys(this.clients).forEach((clientId) => {
                    if (clientId !== pdata.from) {
                        // console.log(`Sending message from ${clientId} to ${pdata.from}`, this.clients[clientId])
                        // this.clients[clientId].send(data);
                    }
                });
            });

            this.peer.on('close', () => {
                console.log('peerconnection closed');
                delete this.clients[this.id];
            });

            socket.on('signal', this._onSocketSignal.bind(this));
            
        })
    }

    initializeClient() {
        // const clients = {};

        this.socket.on('connect', () => {
            console.log('socket connected');
        });
        this.peer = new SimplePeer(this.config);

        this.peer.on('signal', this._onPeerSignal.bind(this));

        this.peer.on('connect', () => {
            console.log(`peer connection established`, this.peer.send);
            // this.peer.send(JSON.stringify({ from: this.clientId, data: 'Hello from Node server!' }));
        });

        this.peer.on('data', (data) => {
            const pdata = JSON.parse(data)
            console.log(`Received message from ${pdata.from}: ${pdata.data}`);
            // chatBox.value += 'Peer: ' + data + '\n';
        });

        this.peer.on('close', () => {
            this.peer.destroy();
        });
        this.socket.on('signal', this._onSocketSignal.bind(this));
    }

    send(message) {
        if (this.peer && this.peer.connected) {
            this.peer.send(JSON.stringify({ from: this.id, data: message }));
        } else {
            console.error('Peer is not connected');
        }
    }

    _onPeerSignal(data) {
        this.socket.emit('signal', data);
    }

    _onSocketSignal(data) {
        this.peer.signal(data);
    }

}

module.exports = SocketRTC;
