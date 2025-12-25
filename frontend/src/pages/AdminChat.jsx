import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import { MessageCircle, Send, Users, Search, Check, CheckCheck, Image as ImageIcon, UserPlus, Mic, Square, Pencil, Trash2, X, Phone, Video, PhoneOff, MicOff, VideoOff } from 'lucide-react';

const AdminChat = () => {
  const { user } = useAuth();
  const { socket, authenticated } = useSocket();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [callState, setCallState] = useState(null);
  const [callType, setCallType] = useState(null);
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

  // Load all chats
  useEffect(() => {
    if (user && user.role === 'admin') {
      loadChats();
      loadAdmins();
    }
  }, [user]);

  const loadAdmins = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:5000/api/users/all',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAdmins(response.data.filter(u => u.role === 'admin'));
    } catch (error) {
      console.error('Error loading admins:', error);
    }
  };

  const loadChats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:5000/api/chat/admin/all-chats',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChats(response.data);
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

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

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    loadMessages(chat._id);
    if (socket) {
      socket.emit('join_chat', chat._id);
    }
  };

  // Socket listeners
  useEffect(() => {
    if (socket) {
      socket.on('new_message', (message) => {
        if (selectedChat && message.chatId === selectedChat._id) {
          setMessages((prev) => [...prev, message]);
        } else {
          playNotificationSound();
        }
        loadChats(); // Refresh chat list
      });

      socket.on('message_edited', (updatedMsg) => {
        setMessages(prev => prev.map(msg => 
          msg._id === updatedMsg._id ? updatedMsg : msg
        ));
      });

      socket.on('message_deleted', (deletedMsg) => {
        setMessages(prev => prev.map(msg => 
          msg._id === deletedMsg._id ? deletedMsg : msg
        ));
      });

      socket.on('chat_updated', () => {
        loadChats();
      });

      socket.on('user_typing', ({ userId, isTyping }) => {
        if (userId !== user._id) {
          setOtherUserTyping(isTyping);
        }
      });

      socket.on('messages_read', ({ userId, readAt }) => {
        if (userId !== user._id) {
          setMessages(prev => prev.map(msg => 
            msg.sender._id === user._id && !msg.read 
              ? { ...msg, read: true, readAt } 
              : msg
          ));
        }
      });

      socket.on('user_online', ({ userId }) => {
        setOnlineUsers(prev => [...new Set([...prev, userId])]);
      });

      socket.on('user_offline', ({ userId }) => {
        setOnlineUsers(prev => prev.filter(id => id !== userId));
      });

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

      socket.emit('get_online_users');
      socket.on('online_users', (users) => {
        setOnlineUsers(users);
      });

      return () => {
        socket.off('new_message');
        socket.off('chat_updated');
        socket.off('user_typing');
        socket.off('messages_read');
        socket.off('message_edited');
        socket.off('message_deleted');
        socket.off('user_online');
        socket.off('user_offline');
        socket.off('online_users');
        socket.off('incoming-call');
        socket.off('call-accepted');
        socket.off('call-rejected');
        socket.off('call-ended');
        socket.off('ice-candidate');
        
        // Clear typing indicator when unmounting
        if (isTyping && selectedChat) {
          socket.emit('typing', { chatId: selectedChat._id, isTyping: false });
        }
      };
    }
  }, [socket, selectedChat, user]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !socket || !selectedChat) return;

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
        chatId: selectedChat._id,
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
    if (socket && selectedChat) {
      socket.emit('typing', { chatId: selectedChat._id, isTyping: false });
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
    
    if (!isTyping && socket && selectedChat) {
      setIsTyping(true);
      socket.emit('typing', { chatId: selectedChat._id, isTyping: true });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (socket && selectedChat) {
        socket.emit('typing', { chatId: selectedChat._id, isTyping: false });
      }
    }, 1000);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !socket || !selectedChat) return;

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
        chatId: selectedChat._id,
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

  const handleAssignChat = async (assignedToId) => {
    if (!selectedChat) return;

    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/chat/${selectedChat._id}/assign`,
        { assignedTo: assignedToId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowAssignModal(false);
      loadChats();
    } catch (error) {
      console.error('Error assigning chat:', error);
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

      if (socket && selectedChat) {
        socket.emit('send_message', {
          chatId: selectedChat._id,
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
      if (!selectedChat) return;
      const otherUser = getOtherParticipant(selectedChat);
      if (!otherUser) return;

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
            to: otherUser._id
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
        userToCall: otherUser._id,
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
    if (socket && selectedChat) {
      const otherUser = getOtherParticipant(selectedChat);
      if (otherUser) {
        socket.emit('end-call', { to: otherUser._id });
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
      }
    }
  };

  const getOtherParticipant = (chat) => {
    return chat.participants.find(p => p._id !== user._id);
  };

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  const getMessageStatus = (msg) => {
    if (msg.sender._id !== user._id) return null;
    if (msg.read) {
      return <CheckCheck className="h-3 w-3 text-blue-400" />;
    }
    return <Check className="h-3 w-3 text-gray-400" />;
  };

  const filteredChats = chats.filter(chat => {
    const otherUser = getOtherParticipant(chat);
    return otherUser?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           otherUser?.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-slate-900 to-slate-700 text-transparent bg-clip-text">Admin Chat Center</h1>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/50 overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
          <div className="flex h-full flex-col lg:flex-row">
            {/* Chat List Sidebar */}
            <div className={`${selectedChat ? 'hidden lg:flex' : 'flex'} w-full lg:w-80 border-b lg:border-b-0 lg:border-r bg-slate-50/50 flex-col max-h-[40vh] lg:max-h-full`}>
              {/* Search */}
              <div className="p-4 border-b bg-white">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
              {filteredChats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Users className="h-12 w-12 mb-2 opacity-50" />
                  <p>No conversations yet</p>
                </div>
              ) : (
                filteredChats.map((chat) => {
                  const otherUser = getOtherParticipant(chat);
                  const unreadCount = chat.unreadCount?.get?.(user._id) || 0;
                  const online = isUserOnline(otherUser?._id);

                  return (
                    <div
                      key={chat._id}
                      onClick={() => handleSelectChat(chat)}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-100 transition ${
                        selectedChat?._id === chat._id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <h3 className="font-semibold text-gray-900">
                                {otherUser?.name}
                              </h3>
                              {online && (
                                <span className="absolute -top-1 -right-3 h-2 w-2 bg-green-500 rounded-full"></span>
                              )}
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              otherUser?.role === 'agent' 
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {otherUser?.role}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {otherUser?.email}
                          </p>
                          {chat.lastMessage && (
                            <p className="text-sm text-gray-500 truncate mt-1">
                              {chat.lastMessage}
                            </p>
                          )}
                          {chat.assignedTo && (
                            <p className="text-xs text-blue-600 mt-1">
                              Assigned to: {chat.assignedTo.name}
                            </p>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      {chat.lastMessageTime && (
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(chat.lastMessageTime).toLocaleString()}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Messages Area */}
          <div className={`${selectedChat ? 'flex' : 'hidden lg:flex'} flex-1 flex-col`}>
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-3 sm:p-4 border-b bg-gradient-to-r from-slate-50 to-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    {/* Back button for mobile */}
                    <button
                      onClick={() => setSelectedChat(null)}
                      className="lg:hidden p-2 hover:bg-slate-200 rounded-xl transition-colors flex-shrink-0"
                    >
                      <svg className="h-5 w-5 text-slate-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M15 19l-7-7 7-7"></path>
                      </svg>
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-base sm:text-lg text-slate-900 truncate">
                          {getOtherParticipant(selectedChat)?.name}
                        </h2>
                        {isUserOnline(getOtherParticipant(selectedChat)?._id) && (
                          <span className="h-2 w-2 bg-green-500 rounded-full flex-shrink-0 animate-pulse"></span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 truncate">
                        {getOtherParticipant(selectedChat)?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    {isUserOnline(getOtherParticipant(selectedChat)?._id) && !callState && (
                      <>
                        <button
                          onClick={() => startCall('audio')}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          title="Audio Call"
                        >
                          <Phone className="h-5 w-5 text-gray-600" />
                        </button>
                        <button
                          onClick={() => startCall('video')}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          title="Video Call"
                        >
                          <Video className="h-5 w-5 text-gray-600" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setShowAssignModal(true)}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <UserPlus className="h-4 w-4" />
                      Assign
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-2 sm:p-3 lg:p-4 space-y-2 sm:space-y-3 bg-slate-50">
                  {messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`flex ${
                        msg.sender._id === user._id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`group max-w-[85%] sm:max-w-[75%] lg:max-w-[70%] rounded-2xl p-2.5 sm:p-3 relative shadow-md ${
                          msg.sender._id === user._id
                            ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white'
                            : 'bg-white text-slate-800 border border-slate-200'
                        }`}
                      >
                        {/* Edit/Delete buttons for own messages */}
                        {msg.sender._id === user._id && !msg.deleted && (
                          <div className="absolute -top-8 right-0 hidden sm:group-hover:flex gap-1 bg-white rounded-lg shadow-xl p-1 border border-slate-200">
                            {msg.messageType === 'text' && (
                              <button
                                onClick={() => handleEditMessage(msg)}
                                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Pencil className="h-3 w-3 text-slate-600" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteMessage(msg)}
                              className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3 text-red-600" />
                            </button>
                          </div>
                        )}

                        {msg.sender._id !== user._id && (
                          <p className="text-[10px] sm:text-xs font-bold mb-1 text-blue-600">
                            {msg.sender.name}
                          </p>
                        )}
                        
                        {msg.deleted ? (
                          <p className="text-xs sm:text-sm italic opacity-60">Message deleted</p>
                        ) : msg.messageType === 'image' ? (
                          <div>
                            <img 
                              src={msg.fileUrl} 
                              alt={msg.fileName}
                              className="max-w-full rounded-lg mb-1 max-h-48 sm:max-h-64"
                            />
                            <p className="text-[10px] sm:text-xs">{msg.fileName}</p>
                          </div>
                        ) : msg.messageType === 'voice' ? (
                          <div className="flex items-center gap-2">
                            <audio controls className="max-w-full h-8 sm:h-10">
                              <source src={msg.fileUrl} type="audio/webm" />
                              Your browser does not support audio.
                            </audio>
                          </div>
                        ) : (
                          <p className="text-xs sm:text-sm break-words">{msg.message}</p>
                        )}
                        
                        <div className={`flex items-center gap-1 text-[10px] sm:text-xs mt-1 ${
                          msg.sender._id === user._id
                            ? 'text-blue-100'
                            : 'text-slate-500'
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
                  ))}
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
                <div className="p-2 sm:p-3 lg:p-4 border-t bg-gradient-to-r from-slate-50 to-slate-100">
                  {editingMessage && (
                    <div className="mb-2 p-2 bg-blue-50 rounded-xl flex items-center justify-between text-sm sm:text-base">
                      <div className="flex items-center gap-2">
                        <Pencil className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                        <span className="text-xs sm:text-sm text-blue-600 font-medium">Editing message</span>
                      </div>
                      <button
                        onClick={handleCancelEdit}
                        className="text-slate-500 hover:text-slate-700 p-1 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        <X className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  )}
                  <div className="flex gap-1 sm:gap-2">
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
                      className="text-slate-600 hover:text-blue-600 p-2 rounded-xl hover:bg-slate-100 disabled:opacity-50 transition-all flex-shrink-0"
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
                      className={`p-2 rounded-xl disabled:opacity-50 transition-all flex-shrink-0 ${
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
                      placeholder={recording ? "Recording..." : editingMessage ? "Edit..." : "Message..."}
                      disabled={recording}
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-slate-100"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || recording}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 sm:px-6 py-2 sm:py-2.5 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center gap-1 sm:gap-2 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none font-bold text-sm sm:text-base flex-shrink-0"
                    >
                      <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden sm:inline">Send</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && selectedChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Assign Chat</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {admins.map((admin) => (
                <button
                  key={admin._id}
                  onClick={() => handleAssignChat(admin._id)}
                  className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition"
                >
                  <p className="font-semibold">{admin.name}</p>
                  <p className="text-sm text-gray-600">{admin.email}</p>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAssignModal(false)}
              className="mt-4 w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
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
    </div>
  );
};

export default AdminChat;
