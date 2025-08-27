import "../styles/chatRoom.css";
import closeImg from "../assets/close.svg";
import { useEffect, useState } from "react";
import apiManager from "../utils/apiManager.js";



function ChatRoom({roomId, handleClose}) {
    const [webSocket, setWebSocket] = useState(null);

    useEffect(function() {
        if (!roomId) {
            return;
        }

        const url = apiManager.getSocketUrl(roomId);
        const socket = new WebSocket(url);
        console.log(socket)
        socket.onmessage = function(event) {
            const data = JSON.parse(event.data);
            console.log(data);
        };
        setWebSocket(socket);


        document.addEventListener("keydown", triggerSubmit);
    }, [roomId]);

    
    function triggerSubmit(event) {
        if (event.key !== "Enter" || event.shiftKey) {
            return;
        }
        event.preventDefault();
        const textArea = document.querySelector("#message");
        if (document.activeElement !== textArea) {
            return;
        }
        if (textArea.value.trim() === "") {
            return;
        }
        
        const form = document.querySelector(
            ".chat-messages form"
        );
        form.requestSubmit();
    };
    
    
    function submitMsg(event) {
        event.preventDefault();
        const formData = new FormData(event.target);

        let reqBody = {};
        for (let entry of formData.entries()) {
            const [key, value] = entry;
            reqBody[key] = value;
        }
        reqBody = JSON.stringify(reqBody);
        webSocket.send(reqBody);

        event.target.reset();
    };


    function close() {
        document.removeEventListener("keydown", triggerSubmit);
        webSocket.close();
        handleClose();
    };



    if (!roomId || !webSocket) {
        return null;
    }


    return (
        <div className="chat-messages">
            <div className="exit-wrapper">
                <button onClick={close}>
                    <img src={closeImg} alt="close" />
                </button>
            </div>
            <div className="messages">

            </div>
            <form onSubmit={submitMsg}>
                <textarea 
                    name="message" 
                    id="message"
                ></textarea>
            </form>
        </div>
    );
};



export default ChatRoom;