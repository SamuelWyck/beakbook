import "../styles/chatRoom.css";
import closeImg from "../assets/close.svg";
import { useEffect, useState, useRef } from "react";
import apiManager from "../utils/apiManager.js";
import MessageCard from "./messageCard.jsx";
import LoadingPage from "./loadingPage.jsx";



function ChatRoom({roomId, handleClose, userId}) {
    const pageNum = useRef(0);
    const fetchingMsgs = useRef(false);
    const moreMsgs = useRef(true);
    const scrollHeight = useRef(null);
    const [messages, setMessages] = useState(null);
    const [webSocket, setWebSocket] = useState(null);


    useEffect(function() {
        if (!messages) {
            return;
        }
        
        const messageEle = document.querySelector(
            ".messages"
        );

        if (scrollHeight.current) {
            const scrollPos = messageEle.scrollHeight - scrollHeight.current;
            scrollHeight.current = null;
            messageEle.scrollBy({top: scrollPos, behavior: "instant"});
            return;
        }

        messageEle.scrollBy({
            top: messageEle.scrollHeight,
            behavior: "instant"
        });
    }, [messages]);
    
    
    useEffect(function() {
        if (!roomId) {
            return;
        }
        
        apiManager.getChatMessages(roomId, 0)
        .then(function(res) {
            if (res.errors) {
                //error popup
            }
            const messages = res.messages.reverse();
            setMessages(getMessageCards(messages));
            moreMsgs.current = res.moreMsgs;

            const url = apiManager.getSocketUrl(roomId);
            const socket = new WebSocket(url);
            socket.onmessage = onMessage;
            setWebSocket(socket);
        });


        document.addEventListener("keydown", triggerSubmit);
    }, [roomId]);

    
    function onMessage(event) {
        const message = JSON.parse(event.data);
        if (message.authorId === userId) {
            cleanForm();
        }

        const msgCard = <MessageCard
            key={message.id}
            msg={message}
            userId={userId}
        />;
        setMessages(messages => [...messages, msgCard]);
    };


    async function handleScroll(event) {
        const target = event.target;
        if (target.scrollTop !== 0) {
            return;
        }
        if (fetchingMsgs.current) {
            return;
        }
        if (!moreMsgs.current) {
            return;
        }

        pageNum.current += 1;
        fetchingMsgs.current = true;
        const res = await apiManager.getChatMessages(
            roomId, pageNum.current
        );
        if (res.errors) {
            //error popup
        }

        const messages = res.messages.reverse();
        moreMsgs.current = res.moreMsgs;
        const msgCards = getMessageCards(messages);
        setMessages(messages => [...msgCards, ...messages]);

        fetchingMsgs.current = false;
        scrollHeight.current = target.scrollHeight;
    };


    function cleanForm() {
        const msgForm = document.querySelector(
            ".chat-messages form"
        );
        msgForm.reset();
    };


    function getMessageCards(messages) {
        const msgCards = [];
        for (let message of messages) {
            msgCards.push(
                <MessageCard
                    key={message.id}
                    msg={message}
                    userId={userId}
                />
            );
        }
        return msgCards;
    };

    
    function triggerSubmit(event) {
        if (event.key !== "Enter" || event.shiftKey) {
            return;
        }
        const textArea = document.querySelector("#message");
        if (document.activeElement !== textArea) {
            return;
        }
        event.preventDefault();
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
    };


    function close() {
        document.removeEventListener("keydown", triggerSubmit);
        webSocket.close();
        handleClose();
    };



    if (!roomId || !webSocket) {
        return (
            <div className="chat-messages">
                <LoadingPage />
            </div>
        );
    }


    return (
        <div className="chat-messages">
            <div className="exit-wrapper">
                <button onClick={close}>
                    <img src={closeImg} alt="close" />
                </button>
            </div>
            <div className="messages" onScrollEnd={handleScroll}>
                {messages}
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