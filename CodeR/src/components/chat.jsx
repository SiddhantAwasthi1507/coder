import react, { useState, useEffect, useRef } from 'react';

function Chat({ roomId, username, clientMessages, socketRef }) {
  // State for chat
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    { message: "Welcome to the chat!", timestamp: new Date().toISOString(), isOwn: false }
]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    // if (!Array.isArray(clientMessages)) {
    //     console.error('clientMessages is not an array:', clientMessages);
    //     return; // Prevent further execution if it's not an array
    // }
    // const msg = clientMessages.map(({ message, timestamp, isOwn}) => ({
    //     message, 
    //     timestamp,
    //     isOwn,
    // }));
    if (!clientMessages) return;
    const msg = Array.isArray(clientMessages) ? clientMessages : [clientMessages];
    setMessages((prevMessages) => [...prevMessages, ...msg]);
    console.log('chat panel',messages);
  },[clientMessages]);

//   useEffect(() => {
//     const setupSocket = async () => {
//         try {
//             const socket = await initSocket();
//             socketRef.current = socket;

//             socket.on('receive_chat_message', (messageData) => {
//                 setInputMessage(prevMessages => [...prevMessages, messageData]);
//             });
//         } catch (error) {
//             console.error('Socket setup failed:', error);
//         }
//     };

//     setupSocket();

//     return () => {
//         if(socketRef.current) {
//             socketRef.current.off('receive_chat_message');
//         }
//     };
//   }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending chat message
  const sendMessage = (e) => {
    // e.preventDefault();
    if(!inputMessage.trim()) return;

    const messageData = {
        roomId,
        // username,
        message: inputMessage,
        timestamp: new Date().toISOString(),
        isOwn: false,
    };

    socketRef.current.emit('send_chat_message', messageData);
    
    setMessages(prevMessages => [...prevMessages, {
        // username,
        roomId,
        message: inputMessage,
        timestamp: new Date().toISOString(),
        isOwn: true
    }]);

    console.log(messages);

    setInputMessage('');
  };

    return (
        <div className="max-w-[400px] h-screen bg-gray-900 p-2 border-l border-gray-800 flex flex-col">
    {/* Chat Header */}
    <div className="bg-gray-900 p-2 border-b border-gray-800 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Chat</h1>
    </div>

    {/* Chat Messages */}
    <div className="flex-grow overflow-y-auto mt-2 mb-2 space-y-2 p-2 scrollbar-thin scrollbar-thumb-gray-600">
        {messages.map((msg, index) => (
            <div
                key={index}
                className={`max-w-[80%] p-3 rounded-lg text-sm shadow-md ${
                    msg.isOwn === true 
                        ? 'bg-blue-500 text-white ml-auto' // User message (right-aligned)
                        : 'bg-gray-700 text-gray-200 mr-auto' // Other messages (left-aligned)
                }`}
            >
                {msg.message}
            </div>
        ))}
    </div>

    {/* Chat Input */}
    <div className="flex items-center bg-gray-800 p-2 rounded-lg">
        <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-grow bg-transparent text-white p-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
            placeholder="Type a message..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-4 py-2 ml-2 rounded-lg hover:bg-blue-700 transition duration-200"
        >
            Send
        </button>
    </div>
</div>

    );
};

export default Chat;