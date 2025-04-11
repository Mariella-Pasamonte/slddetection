import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

const MediaRecorderComponent: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [chunks, setChunks] = useState<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [capturedFrames, setCapturedFrames] = useState<string[]>([]);

  const stopCurrentStream = () => {
    activeStream?.getTracks().forEach((track) => track.stop());
    setActiveStream(null);
    setIsVideoReady(false);
    setErrorMessage("");
  };

  const startWebcam = async () => {
    try {
      stopCurrentStream();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setActiveStream(stream);
        setIsVideoReady(true);
        setErrorMessage("");
      }
    } catch (err) {
      console.error("Error starting webcam:", err);
      setErrorMessage(
        "Camera not available. Please check your permissions or device."
      );
    }
  };

  const startScreenShare = async () => {
    try {
      stopCurrentStream();
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setActiveStream(stream);
        setIsVideoReady(true);
        setErrorMessage(""); // clear any previous error
      }
    } catch (err) {
      console.error("Error starting screen share:", err);
      setErrorMessage("Screen sharing failed.");
    }
  };

  const startFrameCapture = () => {
    let count = 0;
    const interval = setInterval(() => {
      if (!videoRef.current || !canvasRef.current) return;
  
      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;
  
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
  
      ctx.drawImage(videoRef.current, 0, 0);
      const frame = canvasRef.current.toDataURL("image/webp"); // or use toBlob()
  
      count++;
      console.log(`Frame ${count}:`, frame);
    }, 1000); // Every ~30 frames assuming 30fps
  
    return interval; // So you can clear it later
  };
  
  const stopFrameCapture = (intervalId: NodeJS.Timeout) => {
    clearInterval(intervalId);
  };

  const startRecording = () => {
    // const stream = videoRef.current?.srcObject as MediaStream;
    // if (!stream) return;
  
    // const recorder = new MediaRecorder(stream);
    // mediaRecorderRef.current = recorder;
    // setChunks([]);
  
    // recorder.ondataavailable = (e) => {
    //   if (e.data.size > 0) {
    //     setChunks((prev) => [...prev, e.data]);
    //   }
    // };
  
    // recorder.onstop = () => {
    //   const blob = new Blob(chunks, { type: "video/webm" });
    //   const url = URL.createObjectURL(blob);
    //   const a = document.createElement("a");
    //   a.href = url;
    //   a.download = "recording.webm";
    //   a.click();
    //   URL.revokeObjectURL(url);
    // };
  
    // recorder.start();
    setRecording(true);
  
    const intervalId = startFrameCapture();
    // mediaRecorderRef.current._frameInterval = intervalId; // store to stop later
  };

  const stopRecording = () => {
    // if (mediaRecorderRef.current?._frameInterval) {
    //   stopFrameCapture(mediaRecorderRef.current._frameInterval);
    // }
    // mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  useEffect(() => {
    startWebcam(); // auto-start webcam when mounted

    return () => {
      stopCurrentStream(); // clean up on unmount
    };
  }, []);

  return (
    <div className="h-full w-full">
      <div className="relative w-fit h-[500]">
        <video
          ref={videoRef}
          autoPlay
          muted
          className={`rounded-lg h-full ${isVideoReady ? "block" : "hidden"}`}
        />
        {!isVideoReady && (
          <div className="w-[700px] h-full bg-[#222222] text-white p-2 rounded-lg">
            {errorMessage || "No video available"}
          </div>
        )}
        <canvas ref={canvasRef} style={{ display: "none" }} />
        <button
          onClick={recording ? stopRecording : startRecording}
          disabled={isVideoReady == false}
          className={`absolute bottom-4 left-1/2 transform -translate-x-1/2`}
        >
          {recording ?
            <Image src="/stop record.png" alt="Stop Recording" width={50} height={50}/>
            :
            <Image src="/record.png" alt="Start Recording" width={50} height={50} />
          }
        </button>
      </div>
      <div className="grid grid-cols-4 mt-4 space-x-2 content-center place-items-center">
        <button
          onClick={startWebcam}
          className="col-start-2 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Webcam
        </button>
        <button
          onClick={startScreenShare}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Screen Share
        </button>
      </div>
    </div>
  );
};

export default MediaRecorderComponent;
