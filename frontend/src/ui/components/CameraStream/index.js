import React, { useState, useEffect, useCallback } from "react";

export default function CameraStream(props) {
  const { stream, style } = props;
  const [ref, setRef] = useState(null);
  const onRefChange = useCallback(
    node => {
      setRef(node);
      if (node !== null && stream) {
        node.srcObject = stream;
      }
    }, [setRef, stream]);
  return <video ref={onRefChange} style={style} autoPlay />;
}
