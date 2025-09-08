import "../styles/chatRoomBtn.css";
import { useRef, useState } from "react";
import logoImg from "../assets/logo.png";
import profileImg from "../assets/profile.svg";
import deleteImg from "../assets/delete.svg";
import closeImg from "../assets/close.svg";
import apiManager from "../utils/apiManager.js";



function ChatRoomBtn(
    {roomId, users, userId, showChat, deleteCb}) {
    const info = useRef(getInfo(users));
    const [showDel, setShowDel] = useState(false);


    function getInfo(users) {
        const info = {};

        if (users.length === 2) {
            for (let user of users) {
                if (user.id === userId) {
                    continue;
                }
                info.name = user.username;
                info.placeholder = user.username;
                info.img = (user.profileImgUrl)
                ? user.profileImgUrl : profileImg;
                break;
            }
            return info;
        }

        info.img = logoImg;
        info.placeholder = "Group";
        const chatName = [];
        for (let i = 0; i < users.length; i += 1) {
            const user = users[i];
            chatName.push(user.username);
            if (i < users.length - 1) {
                chatName.push(", ");
            }
        };
        info.name = chatName.join("");
        return info;
    };


    function toggleShowDel() {
        setShowDel(!showDel);
    };


    async function leaveChat() {
        let reqBody = {
            roomId: roomId
        };
        reqBody = JSON.stringify(reqBody);

        const res = apiManager.leaveChat(reqBody);
        if (res.errors) {
            return;
        }

        deleteCb(roomId);
    };


    return (
        <div 
            className="chat-btn" 
            data-chatid={roomId}
            data-chatname={info.current.placeholder}
            onClick={showChat}
        >
            <div className="img-wrapper">
                <img 
                    src={info.current.img} alt="bird" 
                    className="global-img" 
                />
            </div>
            <div className="chat-info-wrapper">
                <p>{info.current.name}</p>
                <div className="chat-btn-options">
                    {(showDel) ?
                    <>
                    <button onClick={leaveChat}>
                        <img 
                            src={deleteImg} alt="" 
                            className="chat-opt-btn-img" 
                        />
                    </button>
                    <button onClick={toggleShowDel}>
                        <img 
                            src={closeImg} alt="" 
                            className="chat-opt-btn-img" 
                        />
                    </button>
                    </>
                    :
                    <button onClick={toggleShowDel}>
                        <img 
                            src={deleteImg} alt="" 
                            className="chat-opt-btn-img"
                        />
                    </button>
                    }
                </div>
            </div>
        </div>
    );
};



export default ChatRoomBtn;