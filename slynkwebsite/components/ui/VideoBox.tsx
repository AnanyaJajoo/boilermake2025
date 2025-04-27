import React, { useEffect, useRef, useState } from "react";
import { useParticipant } from "@daily-co/daily-react";

interface VideoBoxProps {
  id: string;
}

const VideoBox: React.FC<VideoBoxProps> = ({ id }) => {
  const participant = useParticipant(id);
  const videoTrack = participant?.tracks?.video;
  const isLocal = participant?.local === true;
  const [videoConnected, setVideoConnected] = useState(false);
  
  const videoElement = useRef<HTMLVideoElement>(null);
  
  // Debug output for VideoBox
  useEffect(() => {
    console.log(`VideoBox for ${id}:`, {
      participantExists: !!participant,
      videoTrackExists: !!videoTrack,
      videoTrackState: videoTrack?.state,
      hasVideoTrack: !!videoTrack?.track,
      trackSubscribed: videoTrack?.subscribed
    });
    
    // Extra debugging for the track
    if (videoTrack) {
      console.log("Video track details:", {
        state: videoTrack.state,
        subscribed: videoTrack.subscribed,
        blocked: videoTrack.blocked,
        id: videoTrack.persistentTrack
      });
    }
  }, [id, participant, videoTrack]);
  
  // Handle track state changes
  useEffect(() => {
    console.log(`Video track state changed for ${id}:`, videoTrack?.state);
    
    if (videoTrack?.state === 'playable') {
      setVideoConnected(true);
    } else {
      setVideoConnected(false);
    }
  }, [id, videoTrack?.state]);
  
  // Handle video element attachment
  useEffect(() => {
    if (!videoElement.current || !videoTrack) return;
    
    console.log(`Attempting to attach video for ${id}. Track state:`, videoTrack.state);
    
    if (videoTrack.state === 'playable') {
      try {
        console.log(`Attaching video track for ${id}`);
        
        // Clear any existing video source
        try {
          // Force clean any existing video sources
          if (videoElement.current.srcObject) {
            const stream = videoElement.current.srcObject as MediaStream;
            if (stream) {
              stream.getTracks().forEach(track => track.stop());
            }
            videoElement.current.srcObject = null;
          }
        } catch (e) {
          console.error("Error cleaning video element:", e);
        }
        
        // Ensure video track is enabled
        if (videoTrack.track) {
          videoTrack.track.enabled = true;
        }
        
        // Use MediaStream directly instead of trying to call attach
        if (videoTrack.track) {
          const stream = new MediaStream([videoTrack.track]);
          videoElement.current.srcObject = stream;
          videoElement.current.play().catch(e => console.error("Error playing video:", e));
          console.log("Video attached via MediaStream");
        }
        
        // Force the video to play
        videoElement.current.play()
          .then(() => console.log("Video is playing"))
          .catch(err => {
            console.error("Error playing video:", err);
            // Try once more with user interaction
            const playPromise = videoElement.current?.play();
            if (playPromise) {
              playPromise.catch(e => console.error("Second attempt to play failed:", e));
            }
          });
        
        setVideoConnected(true);
      } catch (error) {
        console.error("Error attaching video track:", error);
        setVideoConnected(false);
      }
    } else {
      setVideoConnected(false);
    }
    
    return () => {
      if (videoTrack?.state === 'playable' && videoElement.current) {
        try {
          console.log(`Detaching video track for ${id}`);
          
          // Just clear the srcObject directly instead of trying to call detach
          if (videoElement.current.srcObject) {
            const stream = videoElement.current.srcObject as MediaStream;
            if (stream) {
              stream.getTracks().forEach(track => track.stop());
            }
            videoElement.current.srcObject = null;
          }
          
          setVideoConnected(false);
        } catch (error) {
          console.error("Error detaching video track:", error);
        }
      }
    };
  }, [id, videoTrack]);

  if (!participant) {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center text-white">
        <div className="text-center p-4">
          <p>No video participant found</p>
          <p className="text-xs text-gray-400 mt-1">Participant ID: {id}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <video
        autoPlay
        playsInline
        muted={isLocal}
        ref={videoElement}
        className="w-full h-full object-cover"
      />
      
      {!videoConnected && (
        <div className="absolute inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center text-white">
          <div className="text-center p-4">
            <p>Waiting for video...</p>
            <p className="text-xs text-gray-300 mt-2">
              Video state: {videoTrack?.state || "no track"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoBox; 