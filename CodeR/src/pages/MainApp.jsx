import React, { useEffect, useRef, useState } from "react";
import { useParams, useLocation, useNavigate, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import Editor from "../components/editor";
import Leftpanel from "../components/leftpanel";
import Chatpanel from "../components/chat";
import { initSocket } from "../socket";
import ClientEditor from "../components/clienteditor";

function HostPage() {
    const socketRef = useRef(null);
    const { roomid } = useParams();
    const location = useLocation();
    const reactNavigator = useNavigate();
    const isHost = location.pathname.includes("/host");

    // State Variables
    const [socketid, setSocket] = useState(null);
    const [joiners, setjoiners] = useState([]);
    const [code, setCode] = useState("");
    const [clientCodes, setClientCode] = useState("");
    const [clientSocketid, setClientSocketid] = useState(null);
    const [messages, setMessages] = useState([]);

    // ✅ Handles selecting a client
    const handleClient = (client) => {
        if (clientSocketid === client.socketId) {
            console.log("🔄 Deselecting client");
            setClientCode("");
            setClientSocketid(null);
            return;
        }

        if (!socketRef.current) {
            console.error("❌ Socket not initialized");
            return;
        }

        console.log("🟢 Selected Client:", client);
        setClientSocketid(client.socketId); // ✅ State updates asynchronously
    };

    // ✅ Emit request AFTER `clientSocketid` updates
    useEffect(() => {
        if (clientSocketid && socketRef.current) {
            console.log("✅ Sending request to server with updated clientSocketid:", clientSocketid);
            socketRef.current.emit("request_clientcode", {
                roomId: roomid,
                targetSocketid: clientSocketid,
                requesterSocketId: socketRef.current?.id,
            });
        }
    }, [clientSocketid]); // ✅ Runs only when `clientSocketid` updates

    // ✅ Initialize Socket Connection
    useEffect(() => {
        const init = async () => {
            if (!roomid) return; // Prevent errors if roomid is missing

            socketRef.current = await initSocket();
            if (!socketRef.current) {
                console.error("❌ Failed to initialize WebSocket.");
                return;
            }

            socketRef.current.on("connect_error", handleErrors);
            socketRef.current.on("connect_failed", handleErrors);

            function handleErrors(e) {
                console.error("Socket error:", e);
                toast.error("Socket connection failed. Please try again later.");
                reactNavigator("/");
            }

            socketRef.current.emit("join", {
                roomId: roomid,
                username: location.state?.joinName,
                hostname: location.state?.hostName,
            });

            // ✅ Listening for joined event
            socketRef.current.on("joined", ({ clients, username, socketId }) => {
                if (socketRef.current.id === socketId) {
                    setSocket(socketId);
                }

                if (username !== location.state?.username) {
                    toast.success(`${username} joined the room.`);
                }

                setjoiners(clients);
            });

            //Listening for teacher broadcast
            socketRef.current.on("broad_cast", ({ code, socketid }) => {
                console.log("📥 Received Code Response:", { code, socketid });
                setCode(code);
                console.log("✅ Code updated:", code);
            });

            // ✅ Listening for client code updates
            socketRef.current.on("client_codes", ({ code, sourceSocketId }) => {
                console.log("📥 Received Code Response:", { code, sourceSocketId, clientSocketid });
                    setClientCode(code);
                    console.log("✅ Client code updated:", code);
            });

            // ✅ Listening for chat messages
            socketRef.current.on("receive_chat_message", (messageData) => {
                setMessages(messageData);
            });

            // ✅ Listening for disconnected users
            socketRef.current.on("disconnected", ({ socketId, username }) => {
                toast.success(`${username} left the room.`);
                setjoiners((prev) => prev.filter((joiner) => joiner.socketId !== socketId));
            });
        };

        init();

        return () => {
            socketRef.current?.disconnect(); // ✅ Cleanup to prevent duplicate sockets
        };
    }, [roomid, location.state]);

    // ✅ Redirect if `location.state` is missing
    if (!location.state) {
        return <Navigate to="/" />;
    }

    return (
        <div className="flex h-screen w-screen bg-gray-900 text-white">
    {/* Left Panel (Fixed Width) */}
    {isHost && (
        <div className="w-[200px] h-full">
            <Leftpanel 
                joiners={joiners} 
                socketId={socketid} 
                onClientSelect={handleClient} 
                clientSocketid={clientSocketid} 
            />
        </div>
    )}

    {/* Editor (Fills Remaining Space) */}
    <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className=" flex items-center justify-center w-full text-4xl font-bold text-gray-400 p-4  border-b border-gray-700">CodeR</div>
        
        {/* Make Editors Fill Remaining Space */}
        <div className="flex-1 flex items-center justify-center w-full h-full">
            { isHost ? ( 
                <>
                <ClientEditor roomId={roomid} socketRef={socketRef} code={code} isHost={isHost}/>
                <Editor roomId={roomid} socketRef={socketRef} code={clientCodes} isHost={isHost} />
                </>) : <>
                <Editor roomId={roomid} socketRef={socketRef} code={clientCodes} isHost={isHost} />
                <ClientEditor roomId={roomid} socketRef={socketRef} code={code} isHost={isHost}/>
                </>}
        </div>
    </div>

    {/* Chat Panel (Fixed Width) */}
    <div className="w-[330px] h-full flex flex-col justify-end">
        <Chatpanel clientMessages={messages.messageData} socketRef={socketRef} roomId={roomid} />
    </div>
</div>

    );
}

export default HostPage;
