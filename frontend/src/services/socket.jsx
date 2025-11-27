import {io} from 'socket.io-client';

class SocketService {
    constructor(){
        this.socket = null;
        // this.isInGame = false;
    }

    connect() {
        if(!this.socket){
            this.socket = io("http://localhost:8080", {
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 2000
            });
        }
        return this.socket;
    }

    disconnect(){
        if(this.socket){
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export default new SocketService();