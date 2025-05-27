import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';

function Login() {
  const Navigate = useNavigate();
  
  // State for hosting a room
  const [hostEmail, setHostEmail] = useState('');
  const [hostName, setHostName] = useState('');
  const [hostRoomName, setHostRoomName] = useState('');
  const [hostMeetingLink, setHostMeetingLink] = useState('');

  // State for joining a room
  const [joinEmail, setJoinEmail] = useState('');
  const [joinName, setJoinName] = useState('');
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [code, setCode] = useState('');

  // State for current view
  const [currentView, setCurrentView] = useState('initial'); // 'initial', 'host', 'join'

  // Generate meeting link for hosting
  const generateMeetingLink = () => {
    const roomCode = Math.floor(100000 + Math.random() * 900000);
    setCode(roomCode);
    const generatedLink = `https://coder.app/room/${roomCode}`;
    setHostMeetingLink(generatedLink);
    return roomCode;
  };

  // Handle hosting a room
  const handleHostRoom = () => {
    generateMeetingLink();
    setCurrentView('host');
  };

  // Handle joining a room
  const handleJoinRoom = () => {
    setCurrentView('join');
  };

  // Submit handler for hosting a room
  const handleHostSubmit = (e) => {
    e.preventDefault();
    
    if(!hostEmail || !hostName || !hostRoomName) {
        toast.error('EMAIL & NAME & ROOM NAME are required');
        return;
    }

    console.log('Hosting room:', { 
      email: hostEmail, 
      name: hostName, 
      roomName: hostRoomName, 
      meetingLink: hostMeetingLink 
    });
    toast.success('Room created successfully!');
    Navigate('/host/' + code, {
        state: {
            hostName,
            code,
        },
    });
  };

  // Submit handler for joining a room
  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if(!joinRoomCode || !joinName || !joinEmail) {
        toast.error('ROOM ID & NAME & EMAIL are required');
        return;
    }

    console.log('Joining room:', { 
      email: joinEmail, 
      name: joinName, 
      roomCode: joinRoomCode 
    });
    Navigate('/joinee/'+ joinRoomCode, {
        state: {
            joinName,
            joinRoomCode,
        },
    });
  };

  // Copy meeting link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(hostMeetingLink).then(() => {
      alert('Meeting link copied to clipboard!');
    });
  };

  // Render initial view
  const renderInitialView = () => (
    <div className="space-y-4">
      <button 
        onClick={handleHostRoom}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300"
      >
        Host a Room
      </button>
      <div className="text-center text-gray-400">or</div>
      <button 
        onClick={handleJoinRoom}
        className="w-full bg-gray-700 text-white py-2 rounded-md hover:bg-gray-600 transition duration-300"
      >
        Join a Room
      </button>
    </div>
  );

  // Render host room view
  const renderHostRoomView = () => (
    <form onSubmit={handleHostSubmit} className="space-y-4">
      <div>
        <label htmlFor="hostRoomName" className="block text-gray-300 mb-2">Room Name</label>
        <input 
          type="text" 
          id="hostRoomName"
          value={hostRoomName}
          onChange={(e) => setHostRoomName(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter room name"
          required 
        />
      </div>
      <div>
        <label htmlFor="hostName" className="block text-gray-300 mb-2">Your Name</label>
        <input 
          type="text" 
          id="hostName"
          value={hostName}
          onChange={(e) => setHostName(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your name"
          required 
        />
      </div>
      <div>
        <label htmlFor="hostEmail" className="block text-gray-300 mb-2">Email</label>
        <input 
          type="email" 
          id="hostEmail"
          value={hostEmail}
          onChange={(e) => setHostEmail(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your email"
          required 
        />
      </div>
      
      {hostMeetingLink && (
        <div className="bg-gray-700 p-3 rounded-md">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300 truncate">{hostMeetingLink}</span>
            <button 
              type="button"
              onClick={copyToClipboard}
              className="ml-2 bg-blue-600 text-white px-2 py-1 rounded text-sm hover:bg-blue-700"
            >
              Copy
            </button>
          </div>
        </div>
      )}
      
      <button 
        type="submit" 
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300"
      >
        Create Room
      </button>
      <button 
        type="button"
        onClick={() => setCurrentView('initial')}
        className="w-full bg-gray-700 text-white py-2 rounded-md hover:bg-gray-600 transition duration-300 mt-2"
      >
        Back
      </button>
    </form>
  );

  // Render join room view
  const renderJoinRoomView = () => (
    <form onSubmit={handleJoinSubmit} className="space-y-4">
      <div>
        <label htmlFor="joinRoomCode" className="block text-gray-300 mb-2">Room Code</label>
        <input 
          type="text" 
          id="joinRoomCode"
          value={joinRoomCode}
          onChange={(e) => setJoinRoomCode(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter room code"
          required 
        />
      </div>
      <div>
        <label htmlFor="joinName" className="block text-gray-300 mb-2">Your Name</label>
        <input 
          type="text" 
          id="joinName"
          value={joinName}
          onChange={(e) => setJoinName(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your name"
          required 
        />
      </div>
      <div>
        <label htmlFor="joinEmail" className="block text-gray-300 mb-2">Email</label>
        <input 
          type="email" 
          id="joinEmail"
          value={joinEmail}
          onChange={(e) => setJoinEmail(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your email"
          required 
        />
      </div>
      
      <button 
        type="submit" 
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300"
      >
        Join Room
      </button>
      <button 
        type="button"
        onClick={() => setCurrentView('initial')}
        className="w-full bg-gray-700 text-white py-2 rounded-md hover:bg-gray-600 transition duration-300 mt-2"
      >
        Back
      </button>
    </form>
  );

  return (
    <div className="min-h-screen min-w-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-96">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">CodeR</h2>
        
        {currentView === 'initial' && renderInitialView()}
        {currentView === 'host' && renderHostRoomView()}
        {currentView === 'join' && renderJoinRoomView()}
      </div>
    </div>
  );
}

export default Login;