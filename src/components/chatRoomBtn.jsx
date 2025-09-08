import "../styles/chatRoomBtn.css";
import logoImg from "../assets/logo.png";
import profileImg from "../assets/profile.svg";
import { useState } from "react";



function ChatRoomBtn({roomId, users, userId, showChat}) {
    const [info, setInfo] = useState(getInfo(users));


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


    return (
        <button 
            className="chat-btn" 
            data-chatid={roomId}
            data-chatname={info.placeholder}
            onClick={showChat}
        >
            <div className="img-wrapper">
                <img 
                    src={info.img} alt="bird" 
                    className="global-img" 
                />
            </div>
            <p>{info.name}</p>
        </button>
    );
};



export default ChatRoomBtn;