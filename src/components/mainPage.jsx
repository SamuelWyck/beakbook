import "../styles/mainPage.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import apiManager from "../utils/apiManager.js";
import { io } from "socket.io-client";
import LoadingPage from "./loadingPage.jsx";
import ChatRoom from "./chatRoom.jsx";
import FriendsList from "./friendsList.jsx";
import eleFromPoint from "../utils/eleFromPoint.js";
import logoImg from "../assets/logo.png";



function MainPage() {
    const navigate = useNavigate();
    const headerRef = useOutletContext();
    const [userData, setUserData] = useState(null);
    const [roomId, setRoomId] = useState(null);
    const chatName = useRef(null);
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
            const socket = io(
                apiManager.getSocketUrl(), {
                    query: {
                        userId: res.userData.user.id
                    }
                }
            );
            setSocket(socket);
        });
    }, []);


    useEffect(function() {
        function handleResize() {
            const friendsPane = document.querySelector(
                ".friends-pane"
            );
            if (window.innerWidth > 600) {
                const chatBtn = this.document.querySelector(
                    ".chat-toggle"
                );
                chatBtn.click();
                friendsPane.classList.remove("hidden");
                return;
            }

            const friendBtn = document.querySelector(
                ".friend-toggle"
            );
            if (!friendBtn.matches(".active")) {
                friendsPane.classList.add("hidden");
            }
        };

        window.addEventListener("resize", handleResize);

        return function() {
            window.removeEventListener("resize", handleResize);
        };
    }, []);


    function showChat(event) {
        const target = eleFromPoint(
            event.clientX, event.clientY, ".chat-btn"
        );
        
        const roomId = target.dataset.chatid;
        const name = target.dataset.chatname;
        chatName.current = name;
        setRoomId(roomId);
        setShowingChat(true);
        socket.emit("join-room", roomId);
    };


    function handleClose() {
        setRoomId(null);
        setShowingChat(false);
        socket.emit("leave-room", roomId);
    };


    function getClassName() {
        if (window.innerWidth > 600) {
            return "";
        }
        return " hidden";
    };


    function togglePanes(event) {
        const target = event.target;
        if (target.classList.contains("active")) {
            return;
        }

        target.classList.add("active");

        let showPaneSelector = ".friends-pane";
        let hidePaneSelector = ".chat-rooms";
        let otherBtnSelector = ".chat-toggle";
        if (target.matches(".chat-toggle")) {
            showPaneSelector = ".chat-rooms";
            hidePaneSelector = ".friends-pane";
            otherBtnSelector = ".friend-toggle";
            const status2 = document.querySelector(
                ".status-modal-2"
            );
            status2.classList.add("hidden");
        }

        const hidePane = document.querySelector(hidePaneSelector);
        const showPane = document.querySelector(showPaneSelector);
        const otherBtn = document.querySelector(otherBtnSelector);
    
        hidePane.classList.add("hidden");
        showPane.classList.remove("hidden");
        otherBtn.classList.remove("active");
    };



    if (!userData) {
        return <LoadingPage />;
    }


    return (
    <main className="main-page">
        <div className="sidebar">
            <div className="pane-toggle">
                <button 
                    className="chat-toggle active"
                    onClick={togglePanes}
                >Chats</button>
                <button 
                    className="friend-toggle"
                    onClick={togglePanes}
                >Friends</button>
            </div>
            <div className="chat-rooms">
                <button 
                    className="chat-btn" 
                    data-chatid={userData.globalChat.id}
                    data-chatname={userData.globalChat.name}
                    onClick={showChat}
                >
                    <div className="img-wrapper">
                        <img 
                            src={logoImg} alt="bird" 
                            className="global-img" 
                        />
                    </div>
                    <p>{userData.globalChat.name}</p>
                </button>
            </div>
            <div 
                className={`friends-pane${getClassName()}`}
            >
                <FriendsList 
                    socket={socket} 
                    friends={userData.friends}
                    friendShips={userData.friendShips}
                    friendRequests={userData.friendRequests}
                    sentReqs={userData.sentRequests} 
                />
            </div>
        </div>
        <div className="main-pane">
            {!showingChat ||
            <ChatRoom 
                roomId={roomId} 
                handleClose={handleClose}
                userId={userData.user.id}
                socket={socket}
                name={chatName.current}
            />
            }
        </div>
    </main>
    );
};



export default MainPage;