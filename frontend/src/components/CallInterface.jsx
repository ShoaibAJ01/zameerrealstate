import React, { useRef, useEffect } from 'react';
import { Phone, Video, Mic, PhoneOff } from 'lucide-react';

const CallInterface = ({ 
  callState, 
  callType, 
  localStream, 
  remoteStream,
  onToggleMute,
  onToggleVideo,
  onEndCall 
}) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      {/* Video Streams */}
      <div className="flex-1 relative">
        {callType === 'video' ? (
          <>
            {/* Remote Video (full screen) */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {/* Local Video (small corner) */}
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="absolute top-4 right-4 w-48 h-36 object-cover rounded-lg border-2 border-white shadow-lg"
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white">
              <Phone className="h-24 w-24 mx-auto mb-4 animate-pulse" />
              <p className="text-2xl font-semibold">
                {callState === 'calling' ? 'Calling...' : 'Connected'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Call Controls */}
      <div className="bg-gray-800 p-6">
        <div className="flex justify-center items-center gap-6">
          {callType === 'video' && (
            <button
              onClick={onToggleVideo}
              className="bg-gray-600 hover:bg-gray-700 text-white p-4 rounded-full"
              title="Toggle Video"
            >
              <Video className="h-6 w-6" />
            </button>
          )}
          <button
            onClick={onToggleMute}
            className="bg-gray-600 hover:bg-gray-700 text-white p-4 rounded-full"
            title="Toggle Mute"
          >
            <Mic className="h-6 w-6" />
          </button>
          <button
            onClick={onEndCall}
            className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full"
            title="End Call"
          >
            <PhoneOff className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallInterface;
