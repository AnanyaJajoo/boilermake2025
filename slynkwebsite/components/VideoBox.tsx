import { useRef, useState, useCallback, useEffect } from 'react';

export function VideoBox({ 
  videoTrack, 
  muteVideo, 
  className, 
  style,
  poster,
  debug = false,
}: {
  videoTrack: any | null;
  muteVideo?: boolean;
  className?: string;
  style?: React.CSSProperties;
  poster?: string;
  debug?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isVideoAttached, setIsVideoAttached] = useState(false);
  
  // Helper function to safely log, only if debug is enabled
  const debugLog = useCallback((message: string, data?: any) => {
    if (debug) {
      console.log(`VideoBox.tsx: ${message}`, data || '');
    }
  }, [debug]);

  useEffect(() => {
    debugLog('VideoBox rendered', { 
      hasVideoTrack: !!videoTrack, 
      trackType: videoTrack ? typeof videoTrack : 'null',
      trackProperties: videoTrack ? Object.keys(videoTrack) : []
    });
    
    const video = videoRef.current;
    
    if (!video) {
      debugLog('No video element ref available');
      return;
    }
    
    if (!videoTrack) {
      debugLog('No video track provided');
      setIsVideoAttached(false);
      return;
    }
    
    // Handle cleanup of previous attachments
    if (mediaStream) {
      debugLog('Cleaning up previous MediaStream');
      video.srcObject = null;
      setMediaStream(null);
    }
    
    debugLog('Attempting to attach video track', videoTrack);
    
    // Check if this is a Daily.co track with attach method
    const attachTrack = async () => {
      try {
        // Case 1: Daily.co direct track attachment - we now know this doesn't work reliably
        // Skip this method and go straight to MediaStream approach
        
        // Case 2: Track is MediaStreamTrack or has getTrack() method
        debugLog('Trying MediaStream method');
        let mediaStreamTrack;
        
        if (typeof videoTrack.getTrack === 'function') {
          mediaStreamTrack = videoTrack.getTrack();
          debugLog('Got track from getTrack()', mediaStreamTrack);
        } else if (videoTrack instanceof MediaStreamTrack) {
          mediaStreamTrack = videoTrack;
          debugLog('Using track directly as MediaStreamTrack');
        } else if (videoTrack.track && videoTrack.track instanceof MediaStreamTrack) {
          mediaStreamTrack = videoTrack.track;
          debugLog('Using track.track property as MediaStreamTrack');
        }
        
        if (mediaStreamTrack) {
          const newStream = new MediaStream([mediaStreamTrack]);
          video.srcObject = newStream;
          video.muted = !!muteVideo;
          video.play().catch((err: Error) => debugLog('Error playing video', err));
          setMediaStream(newStream);
          setIsVideoAttached(true);
          debugLog('MediaStream attachment successful');
          return true;
        }
        
        // Case 3: Track is already a MediaStream
        if (videoTrack instanceof MediaStream) {
          debugLog('Track is a MediaStream, using directly');
          video.srcObject = videoTrack;
          video.muted = !!muteVideo;
          video.play().catch((err: Error) => debugLog('Error playing video', err));
          setMediaStream(videoTrack);
          setIsVideoAttached(true);
          return true;
        }
        
        // Case 4: Track has mediaStream property
        if (videoTrack.mediaStream && videoTrack.mediaStream instanceof MediaStream) {
          debugLog('Using track.mediaStream property');
          video.srcObject = videoTrack.mediaStream;
          video.muted = !!muteVideo;
          video.play().catch((err: Error) => debugLog('Error playing video', err));
          setMediaStream(videoTrack.mediaStream);
          setIsVideoAttached(true);
          return true;
        }
        
        // Case 5: Track has persistentTrack property (specific to Daily.co)
        if (videoTrack.persistentTrack && videoTrack.persistentTrack instanceof MediaStreamTrack) {
          debugLog('Using persistentTrack property');
          const newStream = new MediaStream([videoTrack.persistentTrack]);
          video.srcObject = newStream;
          video.muted = !!muteVideo;
          video.play().catch((err: Error) => debugLog('Error playing video', err));
          setMediaStream(newStream);
          setIsVideoAttached(true);
          return true;
        }
        
        debugLog('All attachment methods failed', { 
          hasAttachMethod: typeof videoTrack.attach === 'function',
          isMediaStreamTrack: videoTrack instanceof MediaStreamTrack,
          hasGetTrackMethod: typeof videoTrack.getTrack === 'function',
          isMediaStream: videoTrack instanceof MediaStream,
          hasMediaStreamProp: !!videoTrack.mediaStream,
          hasPersistentTrack: !!videoTrack.persistentTrack
        });
        
        // Last resort: show error message and relevant debug info
        console.error('Failed to attach video track with all methods. Track info:', videoTrack);
        
        return false;
      } catch (err) {
        debugLog('Error during video attachment', err);
        console.error('VideoBox attachment error:', err);
        return false;
      }
    };
    
    attachTrack();
    
    return () => {
      debugLog('Cleaning up video attachment');
      
      // Reset the video element's source
      if (video) {
        if (video.srcObject) {
          try {
            // Stop all tracks in the stream
            const stream = video.srcObject as MediaStream;
            if (stream) {
              stream.getTracks().forEach(track => {
                track.stop();
              });
            }
          } catch (err) {
            debugLog('Error stopping media tracks', err);
          }
          
          // Clear source
          video.srcObject = null;
        }
      }
      
      // Clear state
      setMediaStream(null);
      setIsVideoAttached(false);
    };
  }, [videoTrack, muteVideo, className, debugLog]);
  
  return (
    <div className={`relative ${className || ''}`} style={style}>
      <video 
        ref={videoRef}
        autoPlay 
        playsInline
        muted={!!muteVideo}
        poster={poster}
        className="w-full h-full object-cover"
      />
      {debug && !isVideoAttached && (
        <div className="absolute top-0 left-0 bg-black/50 text-white text-xs p-1">
          No video track attached
        </div>
      )}
    </div>
  );
} 