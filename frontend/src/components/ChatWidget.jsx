import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import { MessageCircle, Send, X, Minimize2, Maximize2, Upload, Check, CheckCheck, Image as ImageIcon, Mic, Square, Pencil, Trash2, Phone, Video, PhoneOff, MicOff, VideoOff } from 'lucide-react';

const ChatWidget = () => {
  const { user } = useAuth();
  const { socket, authenticated } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');
  const [callState, setCallState] = useState(null); // 'calling', 'ringing', 'connected'
  const [callType, setCallType] = useState(null); // 'audio' or 'video'
  const [incomingCall, setIncomingCall] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const audioChunksRef = useRef([]);
  const peerConnection = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Play notification sound
  const playNotificationSound = () => {
    const audio = new Audio('/notification.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  // Start or get existing chat
  const startChat = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/chat/start',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChat(response.data);
      loadMessages(response.data._id);
    } catch (error) {
      console.error('Error starting chat:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load messages
  const loadMessages = async (chatId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/chat/${chatId}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Socket listeners
  useEffect(() => {
    if (socket && chat) {
      // Join chat room
      socket.emit('join_chat', chat._id);
      
      // Request online status of admin
      const admin = chat.participants.find(p => p.role === 'admin');
      if (admin) {
        socket.emit('check_user_online', { userId: admin._id });
      }

      // Listen for new messages
      socket.on('new_message', (message) => {
        setMessages((prev) => [...prev, message]);
        if (message.sender._id !== user._id) {
          playNotificationSound();
        }
      });

      // Listen for typing
      socket.on('user_typing', ({ userId, isTyping }) => {
        if (userId !== user._id) {
          setOtherUserTyping(isTyping);
        }
      });

      // Listen for messages read
      socket.on('messages_read', ({ userId, readAt }) => {
        if (userId !== user._id) {
          setMessages(prev => prev.map(msg => 
            msg.sender._id === user._id && !msg.read 
              ? { ...msg, read: true, readAt } 
              : msg
          ));
        }
      });

      // Listen for message edits
      socket.on('message_edited', (updatedMsg) => {
        setMessages(prev => prev.map(msg => 
          msg._id === updatedMsg._id ? updatedMsg : msg
        ));
      });

      // Listen for message deletes
      socket.on('message_deleted', (deletedMsg) => {
        setMessages(prev => prev.map(msg => 
          msg._id === deletedMsg._id ? deletedMsg : msg
        ));
      });

      // Check online status
      socket.on('user_online', ({ userId }) => {
        const admin = chat.participants.find(p => p.role === 'admin');
        if (admin && admin._id === userId) {
          setIsOnline(true);
        }
      });

      socket.on('user_offline', ({ userId }) => {
        const admin = chat.participants.find(p => p.role === 'admin');
        if (admin && admin._id === userId) {
          setIsOnline(false);
        }
      });

      // WebRTC Call Events
      socket.on('incoming-call', (data) => {
        setIncomingCall(data);
      });

      socket.on('call-accepted', async (signal) => {
        if (peerConnection.current) {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(signal));
          setCallState('connected');
        }
      });

      socket.on('call-rejected', () => {
        endCall();
        alert('Call was rejected');
      });

      socket.on('call-ended', () => {
        endCall();
      });

      socket.on('ice-candidate', async (data) => {
        if (peerConnection.current && data.candidate) {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      });

      // Mark messages as read when chat is open (only if authenticated)
      if (isOpen && !isMinimized && authenticated) {
        socket.emit('mark_read', { chatId: chat._id });
      }

      return () => {
        socket.off('new_message');
        socket.off('user_typing');
        socket.off('messages_read');
        socket.off('message_edited');
        socket.off('message_deleted');
        socket.off('user_online');
        socket.off('user_offline');
        socket.off('incoming-call');
        socket.off('call-accepted');
        socket.off('call-rejected');
        socket.off('call-ended');
        socket.off('ice-candidate');
        
        // Clear typing indicator when unmounting
        if (isTyping && chat) {
          socket.emit('typing', { chatId: chat._id, isTyping: false });
        }
      };
    }
  }, [socket, chat, isOpen, isMinimized, user, authenticated]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !socket || !chat) return;

    if (editingMessage) {
      // Edit existing message
      socket.emit('edit_message', {
        messageId: editingMessage._id,
        newMessage: newMessage.trim()
      });
      setEditingMessage(null);
    } else {
      // Send new message
      socket.emit('send_message', {
        chatId: chat._id,
        message: newMessage.trim(),
        messageType: 'text'
      });
    }

    setNewMessage('');
    setIsTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    // Emit typing stopped
    if (socket && chat) {
      socket.emit('typing', { chatId: chat._id, isTyping: false });
    }
  };

  const handleEditMessage = (msg) => {
    setEditingMessage(msg);
    setNewMessage(msg.message);
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setNewMessage('');
  };

  const handleDeleteMessage = (msg) => {
    if (!socket) return;
    if (window.confirm('Are you sure you want to delete this message?')) {
      socket.emit('delete_message', { messageId: msg._id });
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!isTyping && socket && chat && e.target.value.length > 0) {
      setIsTyping(true);
      socket.emit('typing', { chatId: chat._id, isTyping: true });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (socket && chat) {
        socket.emit('typing', { chatId: chat._id, isTyping: false });
      }
    }, 1000);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !socket || !chat) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/upload/image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      socket.emit('send_message', {
        chatId: chat._id,
        message: file.name,
        messageType: 'image',
        fileUrl: response.data.url,
        fileName: file.name
      });
    } catch (error) {
      console.error('File upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (!chat) {
      startChat();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendVoiceMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please allow microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      setRecording(false);
      setMediaRecorder(null);
    }
  };

  const sendVoiceMessage = async (audioBlob) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', audioBlob, 'voice-message.webm');

      const token = localStorage.getItem('token');
      const uploadResponse = await axios.post(
        'http://localhost:5000/api/upload/voice',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (socket && chat) {
        socket.emit('send_message', {
          chatId: chat._id,
          message: '',
          messageType: 'voice',
          fileUrl: uploadResponse.data.url
        });
      }
    } catch (error) {
      console.error('Voice upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  // WebRTC Call Functions
  const startCall = async (type) => {
    try {
      const admin = chat.participants.find(p => p.role === 'admin');
      if (!admin) return;

      console.log('Starting call:', type);

      const constraints = {
        audio: true,
        video: type === 'video' ? { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          facingMode: 'user'
        } : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Got local stream with tracks:', stream.getTracks().map(t => `${t.kind}: ${t.enabled}`));
      
      setLocalStream(stream);
      setCallType(type);
      setCallState('calling');

      // Assign stream to video element immediately
      if (type === 'video' && localVideoRef.current) {
        const video = localVideoRef.current;
        video.srcObject = stream;
        video.muted = true; // Prevent echo
        
        // Set these before attaching stream
        video.setAttribute('autoplay', '');
        video.setAttribute('playsinline', '');
        
        // Wait for stream to be ready
        await new Promise((resolve) => {
          video.onloadedmetadata = resolve;
        });
        
        // Force play
        try {
          await video.play();
          console.log('Local video playing successfully');
        } catch (err) {
          console.error('Error playing local video:', err);
          // Retry after a short delay
          setTimeout(async () => {
            try {
              await video.play();
              console.log('Local video playing after retry');
            } catch (retryErr) {
              console.error('Retry failed:', retryErr);
            }
          }, 100);
        }
      }

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' }
        ]
      });

      peerConnection.current = pc;

      // Add local stream tracks
      stream.getTracks().forEach(track => {
        console.log('Adding track to peer connection:', track.kind, track.enabled);
        pc.addTrack(track, stream);
      });

      // Handle incoming remote stream
      pc.ontrack = (event) => {
        console.log('Received remote track:', event.track.kind, 'enabled:', event.track.enabled);
        if (event.streams && event.streams[0]) {
          console.log('Setting remote stream with tracks:', event.streams[0].getTracks().map(t => t.kind));
          setRemoteStream(event.streams[0]);
          
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
            remoteVideoRef.current.autoplay = true;
            remoteVideoRef.current.playsInline = true;
            
            remoteVideoRef.current.onloadedmetadata = async () => {
              try {
                await remoteVideoRef.current.play();
                console.log('Remote video playing');
              } catch (err) {
                console.error('Error playing remote video:', err);
              }
            };
          }
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('Sending ICE candidate');
          socket.emit('ice-candidate', {
            candidate: event.candidate,
            to: admin._id
          });
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', pc.iceConnectionState);
        if (pc.iceConnectionState === 'connected') {
          setCallState('connected');
        }
      };

      // Create and send offer
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: type === 'video'
      });
      await pc.setLocalDescription(offer);
      console.log('Sending call offer');

      socket.emit('call-user', {
        userToCall: admin._id,
        signalData: offer,
        from: user._id,
        name: user.name,
        callType: type
      });
    } catch (error) {
      console.error('Error starting call:', error);
      alert('Could not access camera/microphone. Please allow permissions.');
      endCall();
    }
  };

  const acceptCall = async () => {
    try {
      console.log('Accepting call:', incomingCall.callType);

      const constraints = {
        audio: true,
        video: incomingCall.callType === 'video' ? { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          facingMode: 'user'
        } : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Got local stream with tracks:', stream.getTracks().map(t => `${t.kind}: ${t.enabled}`));
      
      setLocalStream(stream);
      setCallType(incomingCall.callType);
      setCallState('connected');

      // Assign stream to video element immediately
      if (incomingCall.callType === 'video' && localVideoRef.current) {
        const video = localVideoRef.current;
        video.srcObject = stream;
        video.muted = true;
        
        video.setAttribute('autoplay', '');
        video.setAttribute('playsinline', '');
        
        await new Promise((resolve) => {
          video.onloadedmetadata = resolve;
        });
        
        try {
          await video.play();
          console.log('Local video playing successfully');
        } catch (err) {
          console.error('Error playing local video:', err);
          setTimeout(async () => {
            try {
              await video.play();
              console.log('Local video playing after retry');
            } catch (retryErr) {
              console.error('Retry failed:', retryErr);
            }
          }, 100);
        }
      }

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' }
        ]
      });

      peerConnection.current = pc;

      // Add local stream tracks
      stream.getTracks().forEach(track => {
        console.log('Adding track to peer connection:', track.kind, track.enabled);
        pc.addTrack(track, stream);
      });

      // Handle incoming remote stream
      pc.ontrack = (event) => {
        console.log('Received remote track:', event.track.kind, 'enabled:', event.track.enabled);
        if (event.streams && event.streams[0]) {
          console.log('Setting remote stream with tracks:', event.streams[0].getTracks().map(t => t.kind));
          setRemoteStream(event.streams[0]);
          
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
            remoteVideoRef.current.autoplay = true;
            remoteVideoRef.current.playsInline = true;
            
            remoteVideoRef.current.onloadedmetadata = async () => {
              try {
                await remoteVideoRef.current.play();
                console.log('Remote video playing');
              } catch (err) {
                console.error('Error playing remote video:', err);
              }
            };
          }
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('Sending ICE candidate');
          socket.emit('ice-candidate', {
            candidate: event.candidate,
            to: incomingCall.from
          });
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', pc.iceConnectionState);
      };

      // Set remote description and create answer
      await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.signal));
      console.log('Set remote description');
      
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      console.log('Sending answer');

      socket.emit('accept-call', {
        signal: answer,
        to: incomingCall.from
      });

      setIncomingCall(null);
    } catch (error) {
      console.error('Error accepting call:', error);
      alert('Could not access camera/microphone.');
      rejectCall();
    }
  };

  const rejectCall = () => {
    if (incomingCall && socket) {
      socket.emit('reject-call', { to: incomingCall.from });
    }
    setIncomingCall(null);
  };

  const endCall = () => {
    if (socket && chat) {
      const admin = chat.participants.find(p => p.role === 'admin');
      if (admin) {
        socket.emit('end-call', { to: admin._id });
      }
    }

    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }

    if (peerConnection.current) {
      peerConnection.current.close();
    }

    setLocalStream(null);
    setRemoteStream(null);
    setCallState(null);
    setCallType(null);
    setIsMuted(false);
    setIsVideoOff(false);
    peerConnection.current = null;
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
  };

  const getMessageStatus = (msg) => {
    if (msg.sender._id !== user._id) return null;
    if (msg.read) {
      return <CheckCheck className="h-3 w-3 text-blue-400" />;
    }
    return <Check className="h-3 w-3 text-gray-400" />;
  };

  if (!user || user.role === 'admin') {
    return null;
  }

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 sm:p-4 rounded-full shadow-2xl hover:from-blue-700 hover:to-purple-700 transition-all z-50 transform hover:scale-110"
        >
          <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed ${
            isMinimized 
              ? 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-80 h-14' 
              : 'inset-4 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-96 sm:h-[600px] w-[calc(100vw-2rem)] h-[calc(100vh-2rem)]'
          } bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl z-50 transition-all flex flex-col border border-slate-200`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 sm:p-4 rounded-t-2xl sm:rounded-t-3xl flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <div className="relative">
                <MessageCircle className="h-5 w-5" />
                {isOnline && (
                  <span className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-400 border-2 border-white rounded-full"></span>
                )}
              </div>
              <div>
                <span className="font-semibold block">
                  {isMinimized ? 'Chat' : 'Chat with Admin'}
                </span>
                {!isMinimized && (
                  <span className="text-xs text-blue-100">
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              {console.log('ChatWidget Debug:', { isMinimized, isOnline, callState, chat: !!chat })}
              {!isMinimized && isOnline && !callState && (
                <>
                  <button
                    onClick={() => startCall('audio')}
                    className="hover:bg-white/20 p-1.5 sm:p-2 rounded-lg transition-colors"
                    title="Audio Call"
                  >
                    <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                  <button
                    onClick={() => startCall('video')}
                    className="hover:bg-white/20 p-1.5 sm:p-2 rounded-lg transition-colors"
                    title="Video Call"
                  >
                    <Video className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                </>
              )}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hover:bg-white/20 p-1.5 sm:p-2 rounded-lg transition-colors"
              >
                {isMinimized ? (
                  <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4" />
                ) : (
                  <Minimize2 className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-1.5 sm:p-2 rounded-lg transition-colors"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-2 sm:p-3 lg:p-4 space-y-2 sm:space-y-3 bg-slate-50">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-gray-500">Loading...</div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500">
                      <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Start a conversation with admin</p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`flex ${
                        msg.sender._id === user._id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`group max-w-[70%] rounded-lg p-3 relative ${
                          msg.sender._id === user._id
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-800 border'
                        }`}
                      >
                        {/* Edit/Delete buttons for own messages */}
                        {msg.sender._id === user._id && !msg.deleted && (
                          <div className="absolute -top-8 right-0 hidden group-hover:flex gap-1 bg-white rounded shadow-lg p-1">
                            {msg.messageType === 'text' && (
                              <button
                                onClick={() => handleEditMessage(msg)}
                                className="p-1 hover:bg-gray-100 rounded"
                                title="Edit"
                              >
                                <Pencil className="h-3 w-3 text-gray-600" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteMessage(msg)}
                              className="p-1 hover:bg-gray-100 rounded"
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3 text-red-600" />
                            </button>
                          </div>
                        )}

                        {msg.sender._id !== user._id && (
                          <p className="text-xs font-semibold mb-1 text-blue-600">
                            {msg.sender.name}
                          </p>
                        )}
                        
                        {msg.deleted ? (
                          <p className="text-sm italic opacity-60">Message deleted</p>
                        ) : msg.messageType === 'image' ? (
                          <div>
                            <img 
                              src={msg.fileUrl} 
                              alt={msg.fileName}
                              className="max-w-full rounded mb-1"
                            />
                            <p className="text-xs">{msg.fileName}</p>
                          </div>
                        ) : msg.messageType === 'voice' ? (
                          <div className="flex items-center gap-2">
                            <audio controls className="max-w-full">
                              <source src={msg.fileUrl} type="audio/webm" />
                              Your browser does not support audio.
                            </audio>
                          </div>
                        ) : (
                          <p className="text-sm">{msg.message}</p>
                        )}
                        
                        <div className={`flex items-center gap-1 text-xs mt-1 ${
                          msg.sender._id === user._id
                            ? 'text-blue-100'
                            : 'text-gray-500'
                        }`}>
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {msg.edited && <span className="italic"> (edited)</span>}
                          {getMessageStatus(msg)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {otherUserTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 rounded-lg px-4 py-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-2 sm:p-3 lg:p-4 border-t bg-gradient-to-r from-slate-50 to-slate-100 rounded-b-2xl sm:rounded-b-3xl">
                {editingMessage && (
                  <div className="mb-2 p-2 bg-blue-50 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Pencil className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                      <span className="text-xs sm:text-sm text-blue-600 font-medium">Editing</span>
                    </div>
                    <button
                      onClick={handleCancelEdit}
                      className="text-slate-500 hover:text-slate-700 p-1 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                )}
                <div className="flex gap-1 sm:gap-1 sm:gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || recording || editingMessage}
                    className="text-slate-600 hover:text-blue-600 p-1.5 sm:p-2 rounded-xl hover:bg-slate-100 disabled:opacity-50 transition-all flex-shrink-0"
                  >
                    {uploading ? (
                      <div className="animate-spin h-4 w-4 sm:h-5 sm:w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    ) : (
                      <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </button>
                  <button
                    onClick={recording ? stopRecording : startRecording}
                    disabled={uploading || editingMessage}
                    className={`p-1.5 sm:p-2 rounded-xl disabled:opacity-50 transition-all flex-shrink-0 ${
                      recording 
                        ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse shadow-lg' 
                        : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100'
                    }`}
                  >
                    {recording ? <Square className="h-4 w-4 sm:h-5 sm:w-5" /> : <Mic className="h-4 w-4 sm:h-5 sm:w-5" />}
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={handleTyping}
                    onKeyPress={handleKeyPress}
                    placeholder={recording ? "Recording..." : "Message..."}
                    disabled={recording}
                    className="flex-1 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-slate-100"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || recording}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-1.5 sm:p-2 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none flex-shrink-0"
                  >
                    <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Incoming Call Modal */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="mb-4">
                {incomingCall.callType === 'video' ? (
                  <Video className="h-16 w-16 mx-auto text-blue-600" />
                ) : (
                  <Phone className="h-16 w-16 mx-auto text-blue-600" />
                )}
              </div>
              <h3 className="text-xl font-semibold mb-2">Incoming {incomingCall.callType} call</h3>
              <p className="text-gray-600 mb-6">{incomingCall.name}</p>
              <div className="flex gap-4">
                <button
                  onClick={rejectCall}
                  className="flex-1 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600"
                >
                  Reject
                </button>
                <button
                  onClick={acceptCall}
                  className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600"
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Call Interface */}
      {callState && (
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
                  className="w-full h-full object-cover bg-black"
                />
                {/* Local Video (small corner) */}
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute top-4 right-4 w-48 h-36 object-cover rounded-lg border-2 border-white shadow-lg bg-gray-800"
                />
              </>
            ) : (
              <>
                {/* Audio only - hidden audio elements */}
                <audio ref={remoteVideoRef} autoPlay playsInline className="hidden" />
                <audio ref={localVideoRef} autoPlay playsInline muted className="hidden" />
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-white">
                    <Phone className="h-24 w-24 mx-auto mb-4 animate-pulse" />
                    <p className="text-2xl font-semibold">
                      {callState === 'calling' ? 'Calling...' : 'Connected'}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Call Controls */}
          <div className="bg-gray-800 p-6">
            <div className="flex justify-center items-center gap-6">
              {/* Video Toggle - Only for video calls */}
              {callType === 'video' && (
                <button
                  onClick={toggleVideo}
                  className={`p-4 rounded-full transition-colors ${
                    isVideoOff 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-gray-600 hover:bg-gray-700'
                  } text-white`}
                  title={isVideoOff ? "Turn On Video" : "Turn Off Video"}
                >
                  {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                </button>
              )}
              {/* Mute Toggle */}
              <button
                onClick={toggleMute}
                className={`p-4 rounded-full transition-colors ${
                  isMuted 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-gray-600 hover:bg-gray-700'
                } text-white`}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </button>
              {/* End Call */}
              <button
                onClick={endCall}
                className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full"
                title="End Call"
              >
                <PhoneOff className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
