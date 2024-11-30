import { useState, useEffect, useRef } from "react";

const Video = () => {
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null); // Reference to the img element
  const socket = useRef(null);   // WebSocket reference to manage the connection

  // Function to start the WebSocket connection and video stream
  const startVideoStream = () => {
    socket.current = new WebSocket("ws://localhost:8000/ws");

    socket.current.onopen = () => {
      console.log("WebSocket connected!");
      setVideoPlaying(true);
    };

    socket.current.onmessage = (event) => {
      const base64Image = event.data;
      if (videoRef.current) {
        videoRef.current.src = `data:image/jpeg;base64,${base64Image}`;
      }
    };

    socket.current.onerror = (err) => {
      setError(`WebSocket error: ${err.message}`);
      console.error("WebSocket error:", err);
    };

    socket.current.onclose = () => {
      console.log("WebSocket closed");
      setVideoPlaying(false);
    };
  };

  // Function to stop the WebSocket connection and video stream
  const stopVideoStream = () => {
    if (socket.current) {
      socket.current.close();
      setVideoPlaying(false);
    }
  };

  // Cleanup WebSocket on component unmount
  useEffect(() => {
    return () => {
      if (socket.current) {
        socket.current.close();
      }
    };
  }, []);

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="text-2xl font-bold text-black mb-8">
        <h1>Tracked Video Stream</h1>
      </div>

      <div className="bg-gray-200 p-8 rounded-lg shadow-lg text-center md:w-2/3 lg:w-1/2">
        <h1 className="text-black mb-8">Video Controls</h1>

        <div className="flex justify-center gap-4 mb-8">
          {/* Start Tracking Button */}
          <button
            onClick={videoPlaying ? stopVideoStream : startVideoStream}
            className={`py-2 px-4 rounded-full font-bold text-white ${
              videoPlaying ? "bg-red-500 hover:bg-red-700" : "bg-green-500 hover:bg-green-700"
            }`}
          >
            {videoPlaying ? "Stop Tracking" : "Start Tracking"}
          </button>
        </div>

        {videoPlaying && (
          <div className="mt-8">
            <h2 className="text-black mb-4">Live Video Stream</h2>
            <img
              ref={videoRef}
              alt="Tracked Video Frame"
              className="max-w-full h-auto border-2 border-gray-500"
            />
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-100 text-red-700 p-2 rounded-lg">
            <p>{error}</p>
          </div>
        )}
      </div>

      <div className="mt-4 bg-orange-100 text-orange-700 p-2 rounded-lg">
        <p>
          <strong className="font-bold">Note:</strong> Start tracking for object detection in real-time.
        </p>
      </div>
    </div>
  );
};

export default Video;
