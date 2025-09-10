import "../styles/friendCard.css";
import profileImg from "../assets/profile.svg";
import chatImg from "../assets/chat.svg";
import { useState } from "react";
import closeImg from "../assets/close.svg";
import deleteImg from "../assets/delete.svg";
import apiManager from "../utils/apiManager";



function FriendCard(
    {relationId, friend, deleteCb, statusCb, socket}) {
    const [showDel, setShowDel] = useState(false);


    function toggleDel() {
        setShowDel(!showDel);
    };


    async function removeFriend() {
        const res = await apiManager.removeFriend(relationId);
        if (res.errors) {
            statusCb("Error removing friend");
            return;
        }

        deleteCb(relationId, friend.id);
    };


    async function findUserDM() {
        let reqBody = {
            ids: [friend.id]
        };
        reqBody = JSON.stringify(reqBody);

        const res = await apiManager.findUserDM(reqBody);
        if (res.errors) {
            statusCb("Unable to open chat");
            return;
        }

        if (!res.found) {
            const roomIds = [];
            for (let user of res.chat.users) {
                roomIds.push(user.id);
            }
            socket.emit("add-chat", res.chat, roomIds);
            socket.once("add-chat", function() {
                setTimeout(function() {
                    if (window.innerWidth <= 600) {
                        const chatsBtn = document.querySelector(
                            ".chat-toggle"
                        );
                        chatsBtn.click();
                    }
                    const roomBtn = document.querySelector(
                        `.chat-btn[data-chatid="${res.chat.id}"]`
                    );
                    roomBtn.click();
                }, 1);
            });
        } else {
            if (window.innerWidth <= 600) {
                const chatsBtn = document.querySelector(
                    ".chat-toggle"
                );
                chatsBtn.click();
            }
            const roomBtn = document.querySelector(
                `.chat-btn[data-chatid="${res.chat.id}"]`
            );
            roomBtn.click();
        }
    };



    return (
    <div className="friend">
        <div className="friend-user">
            <div className="friend-profile-wrapper">
                {(friend.profileImgUrl) ?
                <img 
                    src={friend.profileImgUrl} 
                    alt="" 
                /> :
                <img src={profileImg} className="default" />
                }
            </div>
            <p className="friend-username">
                {friend.username}
            </p>
        </div>
        <div className="friend-options">
            {(showDel) ?
            <>
            <button onClick={removeFriend}>
                <img src={deleteImg} alt="" />
            </button>
            <button onClick={toggleDel}>
                <img src={closeImg} alt="" />
            </button>
            </> :
            <>
            <button onClick={findUserDM}>
                <img src={chatImg} alt="" />
            </button>
            <button onClick={toggleDel}>
                <img src={deleteImg} alt="" />
            </button>
            </>
            }
        </div>
    </div>
    );
};



export default FriendCard;