import "../styles/chatUserCard.css";
import profileImg from "../assets/profile.svg";
import { FriendsContext } from "../utils/context.js";
import { useContext, useState } from "react";
import eleFromPoint from "../utils/eleFromPoint.js";
import apiManager from "../utils/apiManager.js";



function ChatUserCard(
    {
        user, 
        userId, 
        chatCloseCb, 
        requestCb, 
        socket, 
        modalCloseCb,
        statusCb
    }) {
    const friendsRef = useContext(FriendsContext);
    const [render, setRender] = useState(false);


    function isFriend() {
        return friendsRef.current.has(user.id);
    };


    function toggleMenu(event) {
        if (userId === user.id) {
            return;
        }
        if (event.target.matches(".options-modal")) {
            return;
        }

        event.stopPropagation();
        const target = eleFromPoint(
            event.clientX, 
            event.clientY, 
            `.chat-user[data-id="${user.id}"]`
        )
        
        const id = target.dataset.id;
        const menu = document.querySelector(
            `.options-modal[data-id="${id}"]`
        );
        const otherMenu = document.querySelector(
            ".options-modal:not(.hidden)"
        );
        if (otherMenu && otherMenu !== menu) {
            otherMenu.classList.add("hidden");
        }
        menu.classList.toggle("hidden");
    };


    function goToFriendList() {
        if (window.innerWidth <= 600) {
            const friendBtn = document.querySelector(
                ".friend-toggle"
            );
            friendBtn.click();
        }
        chatCloseCb();
    };


    async function sendFriendRequest() {
        let reqBody = {
            receivingUserId: user.id
        };
        reqBody = JSON.stringify(reqBody);

        const res = await apiManager.sendFriendRequest(
            reqBody
        );
        if (res.errors) {
            statusCb("Unable to add friend");
            return;
        }
        friendsRef.current.add(user.id);
        setRender(!render);
        requestCb(
            res.friendRequest, 
            res.friendRequest.receivingUserId
        );
    };


    async function findUserDM(event) {
        event.stopPropagation();
        let reqBody = {
            ids: [user.id]
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
                    chatCloseCb();
                    const roomBtn = document.querySelector(
                        `.chat-btn[data-chatid="${res.chat.id}"]`
                    );
                    roomBtn.click();
                }, 1);
            });
        } else {
            modalCloseCb();
            const roomBtn = document.querySelector(
                `.chat-btn[data-chatid="${res.chat.id}"]`
            );
            roomBtn.click();
        }
    };


    return (
        <div 
            className="chat-user" 
            onClick={toggleMenu}
            data-id={user.id}
        >
            <span 
                className="options-modal hidden" 
                data-id={user.id}
            >
                {(!isFriend()) ?
                <button
                    onClick={sendFriendRequest}
                >Add friend</button>
                :
                <button
                    onClick={goToFriendList}
                >Remove friend</button>
                }
                <button onClick={findUserDM}>Message</button>
            </span>
            <div className="chat-user-profile-wrapper">
                {(user.profileImg) ?
                <img src={user.profileImg} alt="" />
                :
                <img className="default" src={profileImg} />
                }
            </div>
            <p className="chat-user-username">
                {user.username}
            </p>
        </div>
    );
};



export default ChatUserCard;