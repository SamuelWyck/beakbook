import "../styles/chooseFriendsModal.css";
import apiManager from "../utils/apiManager.js";
import { useEffect, useState, useRef } from "react";
import closeImg from "../assets/close.svg";
import UserChoiceCard from "./userChoiceCard.jsx";
import LoadingPage from "./loadingPage.jsx";



function ChooseFriendsModal({closeCb, roomId, newChat, socket}) {
    const [userCards, setUserCards] = useState(null);
    const selectedUsers = useRef(new Set());


    useEffect(function() {
        apiManager.getFriends(roomId).then(function(res) {
            if (res.errors) {
                return;
            }

            setUserCards(getUserCards(
                res.friends, res.friendShips
            ));
        });
    }, [roomId]);


    function getUserCards(friends, friendShips) {
        const cards = [];
        for (let friend of friends) {
            cards.push(
                <UserChoiceCard
                    user={friend.friend}
                    key={friend.friendId}
                    selectCb={selectUser}
                    unselectCb={unSelectUser}
                />
            );
        };

        for (let friend of friendShips) {
            cards.push(
                <UserChoiceCard
                    user={friend.user}
                    key={friend.userId}
                    selectCb={selectUser}
                    unselectCb={unSelectUser}
                />
            );
        }

        return cards;
    };


    function selectUser(userId) {
        selectedUsers.current.add(userId);
    };


    function unSelectUser(userId) {
        selectedUsers.current.delete(userId);
    };


    async function createChat() {
        let reqBody = {
            ids: Array.from(selectedUsers.current)
        };
        reqBody = JSON.stringify(reqBody);

        const res = await apiManager.createChat(reqBody);
        if (res.errors) {
            return;
        }
        
        const roomIds = [];
        for (let user of res.chat.users) {
            roomIds.push(user.id);
        }
        socket.emit("add-chat", res.chat, roomIds);
        closeCb();
    };


    async function addUser() {
        let reqBody = {
            ids: Array.from(selectedUsers.current),
            roomId: roomId
        }
        reqBody = JSON.stringify(reqBody);

        const res = await apiManager.joinChat(reqBody);
        if (res.errors) {
            return;
        }

        const roomIds = [];
        for (let user of res.chat.users) {
            if (!selectedUsers.current.has(user.id)) {
                continue;
            }
            roomIds.push(user.id);
            socket.emit("message", {
                userId: user.id,
                message: "Has joined the chat"
            }, roomId);
        }
        socket.emit("add-chat", res.chat, roomIds);
        
        closeCb();
    };


    if (!userCards) {
        return (
        <div className="friends-modal">
            <div className="exit-wrapper">
                <button onClick={closeCb}>
                    <img src={closeImg} alt="close" />
                </button>
            </div>
            <LoadingPage />
            <div className="submit-btn-wrapper">
                <button>
                    {(newChat) ? "Create chat" : "Add to chat"}
                </button>
            </div>
        </div>
        );
    }


    return (
    <div className="friends-modal">
        <div className="exit-wrapper">
            <button onClick={closeCb}>
                <img src={closeImg} alt="close" />
            </button>
        </div>
        <p className="friends-modal-title">
            Select friends
        </p>
        <div className="friend-cards">
            {userCards}
        </div>
        <div className="submit-btn-wrapper">
            <button onClick={(newChat) ? createChat : addUser}>
                {(newChat) ? "Create chat" : "Add to chat"}
            </button>
        </div>
    </div>
    );
};



export default ChooseFriendsModal;