import React from "react";
import styles from "./Room.module.css";
import Draggable from "../../components/Draggable";
import VideoChatSpeakerScreen from "../../../assets/VideoChatSpeakerScreen.png";
import MarinaUser from "../../../assets/MarinaUser.png";
import CrystalUser from "../../../assets/CrystalUser.png";
import NicolasUser from "../../../assets/NicolasUser.png";
import Audio from "../../../assets/Audio.png";
import Video from "../../../assets/Video.png";
import ScreenShare from "../../../assets/ScreenShare.png";
import AddUser from "../../../assets/AddUser.png";
import Chat from "../../../assets/Chat.png";
import Game from "../../../assets/Game.png";
import Web from "../../../assets/Web.png";
import Exit from "../../../assets/Exit.png";

export default function Room() {
  return (
    <div className={styles.container}>
      <div className={styles["main-stream"]}>
        <img
          style={{
            width: "100%",
            minHeight: "100%"
          }}
          src={VideoChatSpeakerScreen}
          alt="VideoChatSpeakerScreen"
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
            <img src={CrystalUser} alt="CrystalUser" />
            <img src={MarinaUser} alt="MarinaUser" />
            <img src={NicolasUser} alt="NicolasUser" />
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
