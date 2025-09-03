import "../styles/chatRoom.css";
import closeImg from "../assets/close.svg";
import { useEffect, useState, useRef } from "react";
import apiManager from "../utils/apiManager.js";
import MessageCard from "./messageCard.jsx";
import LoadingPage from "./loadingPage.jsx";



function ChatRoom({roomId, handleClose, userId, socket, name}) {
    const pageNum = useRef(0);
    const fetchingMsgs = useRef(false);
    const moreMsgs = useRef(true);
    const scrollHeight = useRef(null);
    const cancelScroll = useRef(false);
    const [messages, setMessages] = useState(null);


    useEffect(function() {
        if (!messages) {
            return;
        }
        if (cancelScroll.current) {
            cancelScroll.current = false;
            return;
        }
        
        const messageEle = document.querySelector(
            ".messages"
        );

        let scrollPos = messageEle.scrollHeight;
        if (scrollHeight.current) {
            scrollPos -= scrollHeight.current;
            scrollHeight.current = null;
        }

        messageEle.scrollBy({
            top: scrollPos,
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
                setTimeout(function() {
                    showStatus("Cannot load messages");
                }, 0);
                setMessages([]);
                return;
            }
            const messages = res.messages.reverse();
            setMessages(getMessageCards(messages));
            moreMsgs.current = res.moreMsgs;
        });


        document.addEventListener("keydown", triggerSubmit);

        return function() {
            document.removeEventListener(
                "keydown", triggerSubmit
            ); 
        };
    }, [roomId]);


    useEffect(function() {
        socket.on("message", function(message) {
            if (message.authorId == userId) {
                cleanForm();
            }

            const msgCard = getMessageCards(message);
            setMessages(messages => [...messages, msgCard]);
        });

        socket.on("edit-msg", function(msg) {
            if (msg.authorId === userId) {
                return;
            }

            const msgCard = getMessageCards(msg);
            setMessages((messages) => {
                for (let i = 0; i < messages.length; i += 1) {
                    const message = messages[i];
                    if (message.props.msg.id === msg.id) {
                        messages[i] = msgCard;
                        break;
                    }
                }
                return [...messages];
            });
            cancelScroll.current = true;
        });

        socket.on("delete-msg", function(msgInfo) {
            if (msgInfo.authorId === userId) {
                return;
            }

            setMessages((messages) => {
                const savedMsgs = [];
                for (let message of messages) {
                    if (message.props.msg.id === msgInfo.id) {
                        continue;
                    }
                    savedMsgs.push(message);
                }
                return savedMsgs;
            });
            cancelScroll.current = true;
        });

        return function() {
            socket.off("message");
            socket.off("edit-msg");
            socket.off("delete-msg");
        };
    }, [socket, userId]);


    function broadcastEdit(message) {
        socket.emit("edit-msg", message);
    };


    function broadcastDelete(messageId) {
        socket.emit("delete-msg", messageId);
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

        showStatus("Loading messages...");
        pageNum.current += 1;
        fetchingMsgs.current = true;
        const res = await apiManager.getChatMessages(
            roomId, pageNum.current
        );
        if (res.errors) {
            showStatus("Cannot get messages");
            return;
        }

        const messages = res.messages.reverse();
        moreMsgs.current = res.moreMsgs;
        const msgCards = getMessageCards(messages);
        setMessages(messages => [...msgCards, ...messages]);

        hideStatus();
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
        if (!Array.isArray(messages)) {
            const msgCard = <MessageCard
                key={messages.id}
                msg={messages}
                userId={userId}
                editCb={broadcastEdit}
                deleteCb={broadcastDelete}
                statusCb={showStatus}
            />;
            return msgCard;
        }

        const msgCards = [];
        for (let message of messages) {
            msgCards.push(
                <MessageCard
                    key={message.id}
                    msg={message}
                    userId={userId}
                    editCb={broadcastEdit}
                    deleteCb={broadcastDelete}
                    statusCb={showStatus}
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

        const reqBody = {};
        for (let entry of formData.entries()) {
            const [key, value] = entry;
            reqBody[key] = value;
        }
        reqBody.userId = userId;
        
        socket.emit("message", reqBody, roomId);
    };


    function close() {
        handleClose();
    };


    function showStatus(msg) {
        const statusModal = document.querySelector(
            ".status-modal"
        );
        const para = statusModal.firstChild;
        para.textContent = msg;
        statusModal.classList.remove("hidden");
    };


    function hideStatus() {
        const statusModal = document.querySelector(
            ".status-modal"
        );
        statusModal.classList.add("hidden");
    };



    if (!messages) {
        return (
            <div className="chat-messages">
                <LoadingPage />
            </div>
        );
    }


    return (
        <div className="chat-messages">
            <div className="status-modal hidden">
                <p className="status-msg">Loading messages...</p>
                <button onClick={hideStatus}>
                    <img src={closeImg} alt="" />
                </button>
            </div>
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
                    maxLength={10000}
                    placeholder={`Message @${name}`}
                ></textarea>
            </form>
        </div>
    );
};



export default ChatRoom;