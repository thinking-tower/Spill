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
        {urls: [
            'stun:stun.l.google.com:19302', 
            'stun:stun1.l.google.com:19302',
            'stun:stun2.l.google.com:19302',
            'stun:stun3.l.google.com:19302',
            'stun:stun4.l.google.com:19302'
        ]},
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
        connection.onnegotiationneeded = (e) => {console.log(e)}
        return connection;
    };
    const onIceCandidate = (e) => {
        console.log(e)
        if (e.candidate) {
            // console.log(e.candidate)
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
    const onIceConnectionStateChange = (e) => {
        const connection = e.currentTarget;
        console.log(connection)
        if (connection.iceConnectionState === "failed"){
            connection.restartIce();
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
                        iceCandidates: [],
                        setRemoteDescription: false
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
                        iceCandidates: [],
                        setRemoteDescription: false
                    }
                    stream.getTracks().forEach(track => participants[fromSocketId].connection.addTrack(track, stream));
                    participants[fromSocketId].connection.fromSocketId = fromSocketId;
                    participants[fromSocketId].connection.setRemoteDescription(new RTCSessionDescription(message.value.sdp))
                        .then(() => {
                            participants[fromSocketId].connection.createAnswer().then((description) => {
                                participants[fromSocketId].setRemoteDescription = true
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
                    .then((res) => {
                        console.log(participants[fromSocketId].setRemoteDescription)
                        participants[fromSocketId].setRemoteDescription = true
                        if (participants[fromSocketId].iceCandidates.length > 0) {
                            participants[fromSocketId].iceCandidates.forEach((iceCandidate) => {
                                participants[fromSocketId].connection.addIceCandidate(iceCandidate)
                                .catch((err) => console.log(err))
                            });
                        }
                    })
                    .catch((err) => console.log(err))
            }
        }
        else if (message.event === 'iceCandidate') {
            const fromSocketId = message.value.fromSocketId;
            if (participants[fromSocketId]) {
                if (participants[fromSocketId].setRemoteDescription){
                    participants[fromSocketId].connection.addIceCandidate(message.value.iceCandidate)
                    .then((res) => console.log("Adding ice candidate.")).catch((err) => console.log(err))
                } else {
                    participants[fromSocketId].iceCandidates.push(message.value.iceCandidate)
                }
            }
        }
        console.log(message)
        console.log(participants)
    });
    const close = () => {
        socket.close();
    };
    return {
        login,
        close
    };
};