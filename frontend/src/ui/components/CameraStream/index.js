import React, { useState, useEffect, useCallback } from "react";

export default function CameraStream(props) {
  const { remote, onStreamLoaded, onVideoLoaded, style } = props;
  const [stream, setStream] = useState(null);
  const getStream = useCallback(async () => {
    if (!remote) {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });
      setStream(stream);
      if (onStreamLoaded) {
        onStreamLoaded(stream);
      }
    }
  }, [setStream, onStreamLoaded, remote]);
  useEffect(() => {
    getStream();
  }, [onStreamLoaded]);
  const [ref, setRef] = useState(null);
  const onRefChange = useCallback(
    node => {
      setRef(node);
      if (node !== null) {
        node.srcObject = stream;
        if (onVideoLoaded) {
          onVideoLoaded(node);
        }
      }
    },
    [setRef, stream, onVideoLoaded]
  );

  return <video ref={onRefChange} style={style} autoPlay />;
}
