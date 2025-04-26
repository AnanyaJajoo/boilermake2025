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
    
    let attachedElement: HTMLVideoElement | null = null;
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
        // Case 1: Direct Daily.co track attachment
        if (typeof videoTrack.attach === 'function') {
          debugLog('Attempting direct Daily.co track attachment');
          attachedElement = videoTrack.attach();
          
          if (attachedElement) {
            // Copy video attributes from our ref to the attached element
            attachedElement.muted = !!muteVideo;
            attachedElement.className = className || '';
            
            // Replace our video element with the attached one
            if (video.parentNode) {
              video.parentNode.replaceChild(attachedElement, video);
              setIsVideoAttached(true);
              debugLog('Direct track attachment successful');
              return true;
            }
          }
        }
        
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
        
        debugLog('All attachment methods failed', { 
          hasAttachMethod: typeof videoTrack.attach === 'function',
          isMediaStreamTrack: videoTrack instanceof MediaStreamTrack,
          hasGetTrackMethod: typeof videoTrack.getTrack === 'function',
          isMediaStream: videoTrack instanceof MediaStream,
          hasMediaStreamProp: !!videoTrack.mediaStream
        });
        
        return false;
      } catch (err) {
        debugLog('Error during video attachment', err);
        return false;
      }
    };
    
    attachTrack();
    
    return () => {
      debugLog('Cleaning up video attachment');
      // Clean up the attached element if we created one
      if (attachedElement && attachedElement.parentNode) {
        attachedElement.parentNode.removeChild(attachedElement);
      }
      
      // Reset the video element's source
      if (video) {
        video.srcObject = null;
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