import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import WebRTCWrapper from "../../../domain/WebRTCWrapper";
import styles from "./Room.module.css";
import Draggable from "../../components/Draggable";
import CameraStream from "../../components/CameraStream";
import Audio from "../../../assets/Audio.png";
import Video from "../../../assets/Video.png";
import ScreenShare from "../../../assets/ScreenShare.png";
import AddUser from "../../../assets/AddUser.png";
import Chat from "../../../assets/Chat.png";
import Game from "../../../assets/Game.png";
import Web from "../../../assets/Web.png";
import Exit from "../../../assets/Exit.png";


export default function Room() {
  const { id : roomId } = useParams();
  const [ localStream, setLocalStream ] = useState(null);
  const [ remoteStreams, setRemoteStreams ] = useState({});
  const onLocalStream = useCallback((stream) => {
    setLocalStream(stream);
  }, [setLocalStream])
  const onRemoteStream = useCallback((stream, fromSocketId) => {
    setRemoteStreams((remoteStreams) => {
      return {
        ...remoteStreams, 
        [fromSocketId]: stream
      };
    });
  }, [remoteStreams, setRemoteStreams]);
  const { current: webRTCWrapper } = useRef(WebRTCWrapper(onLocalStream, onRemoteStream));
  useEffect(() => {
    webRTCWrapper.login(roomId);
    return () => {
      webRTCWrapper.close();
    }
  }, [roomId]);
  return (
    <div className={styles.container}>
      <div className={styles["main-stream"]}>
        <CameraStream 
          style={{
            minWidth: "100%",
            minHeight: "100%"
          }}
          stream={localStream}
        />
      </div>
      <Draggable>
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.5)",
            padding: "10px",
            borderRadius: "10px"
          }}
        >
          Participants
          <div
            style={{
              display: "flex",
              flexDirection: "horizontal",
              justifyItems: "center"
            }}
          >
            {
              Object.values(remoteStreams).map((remoteStream, i) => {
                return <CameraStream 
                  key={i}
                  stream={remoteStream}
                  style={{
                    width: '200px',
                    height: '200px'
                  }}
                />
              })
            }
          </div>
        </div>
      </Draggable>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column-reverse"
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "horizontal",
            width: "100%",
            justifyContent: "space-between"
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "horizontal"
            }}
          >
            <img src={Audio} alt="Audio" />
            <img src={Video} alt="Video" />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "horizontal",
              justifyContent: "space-between"
            }}
          >
            <img src={ScreenShare} alt="ScreenShare" />
            <img src={AddUser} alt="AddUser" />
            <img src={Chat} alt="Chat" />
            <img src={Game} alt="Game" />
            <img src={Web} alt="Web" />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "horizontal"
            }}
          >
            <img src={Exit} alt="Exit" />
          </div>
        </div>
      </div>
    </div>
  );
}
