import React, { useState, useCallback } from "react";
import styles from "./Draggable.module.css";

export default function Draggable(props) {
  const { className, children } = props;
  const [position, setPosition] = useState({
    originalTop: 0,
    originalLeft: 0,
    newTop: 0,
    newLeft: 0,
    width: 0,
    height: 0
  });
  const [mousePosition, setMousePosition] = useState({
    screenX: null,
    screenY: null
  });
  const handleOnMouseDown = useCallback(
    e => {
      const { screenX, screenY } = e;
      setMousePosition(prevMousePosition => ({
        ...prevMousePosition,
        screenX,
        screenY
      }));
      e.preventDefault();
      e.stopPropagation();
    },
    [setMousePosition]
  );
  const handleOnMouseMove = useCallback(
    e => {
      const { screenX, screenY } = e;
      if (mousePosition.screenX && mousePosition.screenY) {
        setPosition(prevPosition => ({
          ...prevPosition,
          newTop: Math.max(
            0,
            screenY - mousePosition.screenY + prevPosition.originalTop
          ),
          newLeft: Math.max(
            0,
            screenX - mousePosition.screenX + prevPosition.originalLeft
          )
        }));
      }
      e.preventDefault();
      e.stopPropagation();
    },
    [mousePosition, setPosition]
  );
  const handleOnMouseUp = useCallback(
    e => {
      if (mousePosition.screenX && mousePosition.screenY) {
        const { screenX, screenY } = e;
        setPosition(prevPosition => ({
          ...prevPosition,
          originalTop: Math.max(
            0,
            screenY - mousePosition.screenY + prevPosition.originalTop
          ),
          originalLeft: Math.max(
            0,
            screenX - mousePosition.screenX + prevPosition.originalLeft
          ),
          newTop: Math.max(
            0,
            screenY - mousePosition.screenY + prevPosition.originalTop
          ),
          newLeft: Math.max(
            0,
            screenX - mousePosition.screenX + prevPosition.originalLeft
          )
        }));
        setMousePosition(prevMousePosition => ({
          ...prevMousePosition,
          screenX: null,
          screenY: null
        }));
      }
      e.preventDefault();
      e.stopPropagation();
    },
    [mousePosition, setMousePosition, setPosition]
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
      {React.Children.map(children, child =>
        React.cloneElement(child, {
          className: child.props.className,
          style: {
            ...child.props.style,
            zIndex: 0
          }
        })
      )}
    </div>
  );
}
