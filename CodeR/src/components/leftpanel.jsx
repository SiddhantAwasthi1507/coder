import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';



function LeftPanel({ joiners , socketId, onClientSelect, clientSocketid }) {
    const [joinees, setJoiners] = useState([]);

      useEffect(() => {
        setJoiners(joiners);
      }, [joiners]);
    return (
    <div className="min-w-[200px] h-screen bg-gray-800 p-2 border-r border-gray-700">
        {/* <h1 className="text-3xl font-semibold mb-4">CodeR</h1> */}
          <h2 className="text-xl font-semibold mb-4">Joiners</h2>
          <div className="space-y-2">
            {joinees.map((joiner) => (
              <div 
                key={joiner.socketId} 
                onClick= {() => onClientSelect(joiner)}
                className={`p-1 pl-3 rounded ${
                  joiner.socketId === socketId
                    ? 'bg-green-600' 
                    : 'bg-yellow-600'
                } ${joiner.socketId === clientSocketid ? 'bg-blue-600' : ''}`}
              >
                {joiner.username} 
              </div>
            ))}
          </div>
        </div>
        );
};

export default LeftPanel;