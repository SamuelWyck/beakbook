import "../styles/chatUsersModal.css";
import apiManager from "../utils/apiManager.js";
import { useEffect, useState } from "react";
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


    useEffect(function() {
        apiManager.getChatUsers(roomId).then(function(res) {
            if (res.errors) {
                showStatus("Unable to get users");
                setChatUsers([]);
                return;
            }

            setChatUsers(getUserCards(res.chatUsers));
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


    if (!chatUsers) {
        return (
            <div className="chat-users-modal hidden">
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
        <div className="chat-users-modal hidden">
            <div className="exit-wrapper">
                <button onClick={closeCb}>
                    <img src={closeImg} alt="close" />
                </button>
            </div>
            <div className="chat-users">
                {chatUsers}
            </div>
        </div>
    );
};



export default ChatUsersModal;