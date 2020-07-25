import io from "socket.io-client";

/*
interface Message {
  event: string,
  roomId: string
  value: ?
}
*/

const peerConnectionConfig = {
    iceServers: [
        {urls: 'stun:stun.stunprotocol.org:3478'},
        {urls: 'stun:stun.l.google.com:19302'},
    ]
  };

export default (
    onLocalStream,
    onRemoteStream,
    roomId
) => {
    const socket = io(`${process.env.REACT_APP_SOCKET_URL}`);
    const participants = {};
    const getLocalStream = () => {
        return navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        });
    }
    const login = () => {
        getLocalStream().then((stream) => {
            onLocalStream(stream);
            socket.emit('message', {
                event: 'login',
                roomId
            });
        }).catch((err) => {
            onLocalStream(null);
            console.log(err)
        });
    };
    const createRTCPeerConnection = () => {
        const connection = new RTCPeerConnection(peerConnectionConfig);
        connection.onicecandidate = onIceCandidate;
        connection.ontrack = onTrack;
        return connection;
    };
    const onIceCandidate = (e) => {
        if (e.candidate) {
            const connection = e.currentTarget;
            socket.emit('message', {
                event: 'iceCandidate',
                roomId,
                value: {
                    iceCandidate: e.candidate,
                    fromSocketId: socket.id,
                    toSocketId: connection.fromSocketId
                }
            });
        }
    };
    const onTrack = (e) => { 
        const connection = e.currentTarget;
        const stream = e.streams[0];
        onRemoteStream(stream, connection.fromSocketId);
    }
    socket.on('message', (message) => {
        if (message.event === "newConnection") {
            const fromSocketId = message.value.fromSocketId;
            if (!participants.hasOwnProperty(fromSocketId)){
                getLocalStream().then((stream) => {
                    const connection = createRTCPeerConnection();
                    participants[fromSocketId] = {
                        connection,
                    }
                    stream.getTracks().forEach(track => participants[fromSocketId].connection.addTrack(track, stream));
                    participants[fromSocketId].connection.fromSocketId = fromSocketId;
                    participants[fromSocketId].connection.createOffer()
                        .then((description) => {
                            participants[fromSocketId].connection.setLocalDescription(description)
                                .then(() => {
                                    socket.emit('message', {
                                        event: 'offer',
                                        roomId,
                                        value: {
                                            toSocketId: fromSocketId,
                                            fromSocketId: socket.id,
                                            sdp: participants[fromSocketId].connection.localDescription
                                        }
                                    })
                                }).catch((err) => { console.log(err)})
                        })
                        .catch((err) => {
                            console.log(err)
                        })
                }).catch((err) => console.log(err))
            }
        }
        else if (message.event === "offer") {
            const fromSocketId = message.value.fromSocketId;
            if (!participants.hasOwnProperty(fromSocketId)){
                getLocalStream().then((stream) => {
                    const connection = createRTCPeerConnection();
                    participants[fromSocketId] = {
                        connection,
                    }
                    stream.getTracks().forEach(track => participants[fromSocketId].connection.addTrack(track, stream));
                    participants[fromSocketId].connection.fromSocketId = fromSocketId;
                    participants[fromSocketId].connection.setRemoteDescription(new RTCSessionDescription(message.value.sdp))
                        .then(() => {
                            participants[fromSocketId].connection.createAnswer().then((description) => {
                                connection.setLocalDescription(description)
                                    .then(() => {socket.emit('message', {
                                        event: 'answer',
                                        roomId,
                                        value: {
                                            toSocketId: fromSocketId,
                                            fromSocketId: socket.id,
                                            sdp: participants[fromSocketId].connection.localDescription
                                        }
                                    })})
                                    .catch((err) => {
                                        console.log(err)
                                    })
                            })
                            .catch((err) => {
                                console.log(err);
                            })
                        })
                    })
                    .catch((err) => console.log(err))
            }
        }
        else if (message.event === 'answer') {
            const fromSocketId = message.value.fromSocketId;
            if (participants) {
                participants[fromSocketId].connection.setRemoteDescription(new RTCSessionDescription(message.value.sdp))
                    .catch((err) => console.log(err))
            }
        }
        else if (message.event === 'iceCandidate') {
            const fromSocketId = message.value.fromSocketId;
            if (participants[fromSocketId]) {
                participants[fromSocketId].connection.addIceCandidate(message.value.iceCandidate)
                    .catch((err) => console.log(err))
            }
        }
    });
    const close = () => {
        socket.close();
    };
    return {
        login,
        close
    };
};