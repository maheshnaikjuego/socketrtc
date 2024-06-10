const SimplePeer = require('simple-peer');

class SocketRTC {
    constructor(socketConfig, id = "", rtcconfig = {}) {

        this.id = id;
        this.socket = null;
        this.events = {};
        if (typeof window === 'undefined') {
            // Node.js environment
            const wrtc = require('wrtc');
            this.config = Object.assign({ wrtc: wrtc }, rtcconfig);
            this.io = require('socket.io')(socketConfig.server);
            this.initializeServer();
        } else {
            // Browser environment
            this.config = Object.assign({initiator: true}, rtcconfig);
            const socketioclient = require('socket.io-client');
            this.socket = socketioclient(socketConfig.url, {query: {
                customID: this.id
              }});
            this.initializeClient();
        }

    }

    /**
     * Adds a listener for the specified event.
     *
     * @param {string} event - The event to listen for.
     * @param {Function} listener - The function to execute when the event is triggered.
     */
    on(event, listener) {
        // If the event doesn't exist in the events object, create an empty array for it
        if (!this.events[event]) {
            this.events[event] = [];
        }
        
        // Add the listener to the event's array of listeners
        this.events[event].push(listener);
    }

    emit(event, ...args) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(...args));
        }
    }

    initializeServer() {
        const clients = {};
        this.io.on('connection', (socket) => {
            this.socket = socket;
            const peer = new SimplePeer(this.config);
            const id = socket.handshake.query['customID'];
            clients[id] = peer;

            // console.log('socket connected', socket.id);
            peer.on('connect', () => {
                console.log('peerconnection established');
                // peer.send(JSON.stringify({ from: 'Server', data: 'Hello from Node server!' }));
            });

            peer.on('signal', (data) => {
                this.socket.emit('signal', data);
            });

            peer.on('data', (data) => {
                const pdata = JSON.parse(data);
                // console.log(Object.keys(this.clients))
                const allClients = Object.keys(clients);

                for (let i = 0; i < allClients.length; i++) {
                    if (allClients[i] !== socket.id) {
                        // console.log(`Sending message from ${clientId} to ${pdata.from}`, this.clients[clientId])
                        try {
                            clients[allClients[i]].send(data);
                        } catch (error) {
                            console.log(`error sending to ${allClients[i]}`, error.message)
                        }
                    }
                };
            });

            peer.on('close', () => {
                console.log('peerconnection closed');
                delete clients[id];
            });

            socket.on('signal', (data) => {
                peer.signal(data);
            });

            socket.on("disconnect", async (event) => {
                console.log('socket disconnected', event);
                delete clients[id];
                peer.destroy();
            })
        })
    }

    initializeClient() {
        // const clients = {};

        this.socket.on('connect', () => {
            // console.log('socket connected');
        });
        const peer = new SimplePeer(this.config);

        // console.log(peer)
        peer.on('signal', (data) => {
            this.socket.emit('signal', data);
        });

        peer.on('connect', () => {
            console.log(`peer connection established`);
            // this.peer.send(JSON.stringify({ from: this.clientId, data: 'Hello from Node server!' }));
        });

        peer.on('data', (data) => {
            const pdata = JSON.parse(data)
            console.log(`Received message from ${pdata.from}: ${pdata.data}`);
            // chatBox.value += 'Peer: ' + data + '\n';
        });

        peer.on('close', () => {
            peer.destroy();
        });

        this.socket.on('signal', (data) => {
            peer.signal(data);
        });

        const sendMessage = (message) => {
            if (peer && peer.connected) {
                peer.send(JSON.stringify({ from: this.id, data: message }));
            } else {
                console.error('Peer is not connected');
            }
        }

        this.send = sendMessage;
    }

}

module.exports = SocketRTC;
