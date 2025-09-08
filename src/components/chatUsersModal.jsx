import "../styles/chatUsersModal.css";
import apiManager from "../utils/apiManager.js";
import { useEffect, useState, useRef } from "react";
import ChatUserCard from "./chatUserCard.jsx";
import closeImg from "../assets/close.svg";
import LoadingPage from "./loadingPage.jsx";



function ChatUsersModal(
    {
        roomId, 
        userId, 
        socket, 
        closeCb, 
        showStatus, 
        hideStatus, 
        chatCloseCb
    }) {
    const [chatUsers, setChatUsers] = useState(null);
    const moreUsers = useRef(null);
    const pageNum = useRef(0);
    const fetchingUsers = useRef(false);


    useEffect(function() {
        apiManager.getChatUsers(roomId, 0).then(function(res) {
            if (res.errors) {
                showStatus("Unable to get users");
                setChatUsers([]);
                return;
            }

            setChatUsers(getUserCards(res.chatUsers));
            moreUsers.current = res.moreUsers;
        });
    }, []);


    function getUserCards(users) {
        const cards = [];
        for (let user of users) {
            cards.push(
                <ChatUserCard
                    closeCb={chatCloseCb}
                    user={user}
                    userId={userId}
                    key={user.id}
                    requestCb={broadcastFriendRequst}
                />
            );
        }
        return cards;
    };


    function broadcastFriendRequst(request, roomId) {
        socket.emit("friend-request", request, roomId);
        socket.emit("sent-request", request, userId);
    };


    async function handleScroll(event) {
        const target = event.target;
        const scrollPos = target.scrollTop + target.clientHeight;
        if (scrollPos !== target.scrollHeight) {
            return;
        }
        if (fetchingUsers.current) {
            return;
        }
        if (!moreUsers.current) {
            return;
        }

        fetchingUsers.current = true;
        pageNum.current += 1;
        showStatus("Loading users...");
        const res = await apiManager.getChatUsers(
            roomId, pageNum.current
        );
        if (res.errors) {
            showStatus("Unable to load users");
            return;
        }

        setChatUsers(users => {
            const newUsers = getUserCards(res.chatUsers);
            return [...users, ...newUsers];
        });
        hideStatus();
        fetchingUsers.current = false;
        moreUsers.current = res.moreUsers;
    };


    if (!chatUsers) {
        return (
            <div className="chat-users-modal">
                <div className="exit-wrapper">
                    <button onClick={closeCb}>
                        <img src={closeImg} alt="close" />
                    </button>
                </div>
                <LoadingPage />
            </div>
        )
    }


    return (
        <div className="chat-users-modal">
            <div className="exit-wrapper">
                <button onClick={closeCb}>
                    <img src={closeImg} alt="close" />
                </button>
            </div>
            <p className="chat-users-title">
                Users
            </p>
            <div 
                className="chat-users" 
                onScroll={(handleScroll)}
            >
                {chatUsers}
            </div>
        </div>
    );
};



export default ChatUsersModal;