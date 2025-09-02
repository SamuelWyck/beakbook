import "../styles/mainPage.css";
import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import apiManager from "../utils/apiManager.js";
import { io } from "socket.io-client";
import LoadingPage from "./loadingPage.jsx";
import ChatRoom from "./chatRoom.jsx";
import eleFromPoint from "../utils/eleFromPoint.js";
import logoImg from "../assets/logo.png";



function MainPage() {
    const navigate = useNavigate();
    const headerRef = useOutletContext();
    const [userData, setUserData] = useState(null);
    const [roomId, setRoomId] = useState(null);
    const [showingChat, setShowingChat] = useState(false);
    const [socket, setSocket] = useState(null);


    useEffect(function() {
        apiManager.getUserData().then(function(res) {
            if (res.errors) {
                const firstErrMsg = res.errors[0].msg;
                if (firstErrMsg === "Client not authenticated") {
                    navigate("/signup", {replace: true});
                    return;
                }
            }
            setUserData(res.userData);
            headerRef.current.updateUser(res.userData.user);
            const socket = io(apiManager.getSocketUrl());
            setSocket(socket);
        });
    }, []);


    function showChat(event) {
        const target = eleFromPoint(
            event.clientX, event.clientY, ".chat-btn"
        );
        
        const roomId = target.dataset.chatid;
        setRoomId(roomId);
        setShowingChat(true);
        socket.emit("join-room", roomId);
    };


    function handleClose() {
        setRoomId(null);
        setShowingChat(false);
        socket.emit("leave-room", roomId);
    };


    if (!userData) {
        return <LoadingPage />;
    }


    return (
    <main className="main-page">
        <div className="sidebar">
            <div className="chat-rooms">
                <button 
                    className="chat-btn" 
                    data-chatid={userData.globalChat.id}
                    onClick={showChat}
                >
                    <div className="img-wrapper">
                        <img src={logoImg} alt="bird" className="global-img" />
                    </div>
                    <p>{userData.globalChat.name}</p>
                </button>
            </div>
        </div>
        <div className="main-pane">
            {!showingChat ||
            <ChatRoom 
                roomId={roomId} 
                handleClose={handleClose}
                userId={userData.user.id}
                socket={socket}
            />
            }
        </div>
    </main>
    );
};



export default MainPage;