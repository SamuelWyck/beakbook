import "../styles/mainPage.css";
import { useState, useEffect, useRef } from "react";
import {FriendsContext} from "../utils/context.js";
import { useNavigate, useOutletContext } from "react-router-dom";
import apiManager from "../utils/apiManager.js";
import { io } from "socket.io-client";
import LoadingPage from "./loadingPage.jsx";
import ChatRoom from "./chatRoom.jsx";
import FriendsList from "./friendsList.jsx";
import eleFromPoint from "../utils/eleFromPoint.js";
import logoImg from "../assets/logo.png";
import ChooseFriendsModal from "./chooseFriendsModal.jsx";
import ChatRoomBtn from "./chatRoomBtn.jsx";



function MainPage() {
    const navigate = useNavigate();
    const headerRef = useOutletContext();
    const friendsRef = useRef(new Set());
    const [userData, setUserData] = useState(null);
    const [roomId, setRoomId] = useState(null);
    const chatName = useRef(null);
    const [showingChat, setShowingChat] = useState(false);
    const [socket, setSocket] = useState(null);
    const [showAddChat, setShowAddChat] = useState(false);
    const [chats, setChats] = useState(null);


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
            friendsRef.current = getFriendsSet(res.userData);
            const socket = io(
                apiManager.getSocketUrl(), {
                    query: {
                        userId: res.userData.user.id
                    }
                }
            );
            setSocket(socket);
            setChats(getChatBtns(
                res.userData.chatRooms, 
                res.userData.user.id,
                socket
            ));
        });
    }, []);


    useEffect(function() {
        if (socket === null) {
            return;
        }

        socket.on("add-chat", function(chat) {
            setChats(chats => {
                const btn = getChatBtns(
                    chat, userData.user.id, socket
                );
                return [btn, ...chats];
            });
        });

        socket.on("left-chat", function(chat) {
            setChats(chats => {
                const btn = getChatBtns(
                    chat, userData.user.id, socket, true
                );
                const savedCards = [];
                for (let chatBtn of chats) {
                    if (chatBtn.props.roomId === chat.id) {
                        savedCards.push(btn);
                        continue;
                    }
                    savedCards.push(chatBtn);
                }
                return savedCards;
            });
        });

        return function() {
            if (socket === null) {
                return;
            }
            socket.off("add-chat");
            socket.off("left-chat");
        };
    }, [socket]);


    useEffect(function() {
        function handleResize() {
            setShowAddChat(false);
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


    function getChatBtns(chatRooms, userId, socket, randKey) {
        if (!Array.isArray(chatRooms)) {
            const btn = <ChatRoomBtn
                users={chatRooms.users}
                userId={userId}
                roomId={chatRooms.id}
                showChat={showChat}
                deleteCb={removeChat}
                socket={socket}
                key={
                    (randKey) ? 
                    chatRooms.id + String(Math.random()) : 
                    chatRooms.id
                }
            />
            return btn;
        }

        const btns = [];
        for (let room of chatRooms) {
            btns.push(
                <ChatRoomBtn
                    users={room.users}
                    roomId={room.id}
                    userId={userId}
                    showChat={showChat}
                    deleteCb={removeChat}
                    socket={socket}
                    key={room.id}
                />
            );
        }
        return btns;
    };


    function removeChat(roomId) {
        setChats(btns => {
            const savedBtns = [];
            for (let btn of btns) {
                if (btn.props.roomId === roomId) {
                    continue;
                }
                savedBtns.push(btn);
            }
            return savedBtns;
        });

        setShowingChat(showingChat => {
            if (showingChat) {
                handleClose();
            }
            return showingChat;
        });
    };


    function getFriendsSet(userData) {
        const friendSet = new Set();

        for (let relation of userData.friends) {
            friendSet.add(relation.friendId);
        }
        for (let relation of userData.friendShips) {
            friendSet.add(relation.userId);
        }
        for (let relation of userData.friendRequests) {
            friendSet.add(relation.requestingUserId);
        }
        for (let relation of userData.sentRequests) {
            friendSet.add(relation.receivingUserId);
        }
        
        return friendSet;
    };


    function showChat(event) {
        if (event.target.matches(".chat-opt-btn-img")) {
            return;
        }
        const target = eleFromPoint(
            event.clientX, event.clientY, ".chat-btn"
        );

        const chatBtns = document.querySelectorAll(
            ".chat-btn"
        );
        for (let btn of chatBtns) {
            btn.classList.remove("active");
        }
        target.classList.add("active");
        
        const roomId = target.dataset.chatid;
        const name = target.dataset.chatname;
        chatName.current = name;
        setRoomId(roomId);
        setShowingChat(true);
        setShowAddChat(false);
        // socket.emit("join-room", roomId);
        setSocket(ws => {
            ws.emit("join-room", roomId);
            return ws;
        });
    };


    function handleClose() {
        setRoomId(null);
        setShowingChat(false);
        const chatBtns = document.querySelectorAll(
            ".chat-btn"
        );
        for (let btn of chatBtns) {
            btn.classList.remove("active");
        }
        setSocket(socket => {
            socket.emit("leave-room", roomId);
            return socket;
        });
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
        } else if (showAddChat) {
            setShowAddChat(false);
        }
        
        
        const hidePane = document.querySelector(hidePaneSelector);
        const showPane = document.querySelector(showPaneSelector);
        const otherBtn = document.querySelector(otherBtnSelector);
    
        hidePane.classList.add("hidden");
        showPane.classList.remove("hidden");
        otherBtn.classList.remove("active");
    };


    function toggleAddModal() {
        setShowAddChat(!showAddChat);
    };



    if (!userData) {
        return <LoadingPage />;
    }


    return (
    <FriendsContext value={friendsRef}>
    <main className="main-page">
        {!showAddChat ||
        <ChooseFriendsModal
            newChat={true}
            closeCb={toggleAddModal}
            roomId={"null"}
            socket={socket}
        />
        }
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
                <div className="add-chat-btn-wrapper">
                    <button onClick={toggleAddModal}
                    >Create chat</button>
                </div>
                <div className="user-chats">
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
                    {chats}
                </div>
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
                    userId={userData.user.id}
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
                key={roomId}
            />
            }
        </div>
    </main>
    </FriendsContext>
    );
};



export default MainPage;