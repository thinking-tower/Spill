import React, { useState, useCallback } from "react";
import styles from "./Draggable.module.css";

export default function Draggable(props) {
  const { className, children } = props;
  const [position, setPosition] = useState({
    originalTop: 0,
    originalLeft: 0,
    newTop: 0,
    newLeft: 0,
  });
  const [mousePosition, setMousePosition] = useState({
    screenX: null,
    screenY: null
  });
  const handleOnMouseDown = useCallback(
    e => {
      const { screenX, screenY } = e;
      setMousePosition({
        screenX,
        screenY
      });
      e.preventDefault();
      e.stopPropagation();
    },
    [setMousePosition]
  );
  const handleOnMouseMove = useCallback(
    e => {
      e.preventDefault();
      e.stopPropagation();
      if (!(mousePosition.screenX && mousePosition.screenY)) {
        return;
      }
      const { screenX, screenY } = e;
      const newTop = Math.max(0, screenY - mousePosition.screenY + position.originalTop);
      const newLeft = Math.max(0, screenX - mousePosition.screenX + position.originalLeft);
      setPosition((prevPosition) => ({
        ...prevPosition,
        newTop,
        newLeft
      }));
    },
    [mousePosition, position, setPosition]
  );
  const handleOnMouseUp = useCallback(
    e => {
      e.preventDefault();
      e.stopPropagation();
      if (!(mousePosition.screenX && mousePosition.screenY)) {
        return;
      }
      const { screenX, screenY } = e;
      const originalTop = Math.max(0, screenY - mousePosition.screenY + position.originalTop);
      const originalLeft = Math.max(0, screenX - mousePosition.screenX + position.originalLeft);
      const newTop = Math.max(0, screenY - mousePosition.screenY + position.originalTop);
      const newLeft = Math.max(0, screenX - mousePosition.screenX + position.originalLeft);
      setPosition(({
        originalTop,
        originalLeft,
        newTop,
        newLeft 
      }));
      setMousePosition({
        screenX: null,
        screenY: null
      });
    },
    [mousePosition, setMousePosition, position, setPosition]
  );

  return (
    <div
      className={`${className} ${styles.container}`}
      style={{
        top: position.newTop,
        left: position.newLeft
      }}
      onMouseDown={handleOnMouseDown}
      onMouseMove={handleOnMouseMove}
      onMouseUp={handleOnMouseUp}
      onMouseLeave={handleOnMouseUp}
    >
      {children}
    </div>
  );
}
