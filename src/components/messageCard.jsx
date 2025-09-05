import "../styles/messageCard.css";
import formatDate from "../utils/formatDate.js";
import profileImg from "../assets/profile.svg";
import deleteImg from "../assets/delete.svg";
import editImg from "../assets/edit.svg";
import closeImg from "../assets/close.svg";
import saveImg from "../assets/save.svg";
import { useState, useContext } from "react";
import { FriendsContext } from "../utils/context.js";
import apiManager from "../utils/apiManager.js";



function MessageCard(
    {
        msg, 
        userId, 
        editCb, 
        deleteCb, 
        statusCb, 
        requestCb, 
        closeCb
    }) {
    const [editing, setEditing] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleted, setDeleted] = useState(false);
    const [textValue, setTextValue] = useState(msg.text);
    const [render, setRender] = useState(false);
    const friendsRef = useContext(FriendsContext);


    function toggleEdit() {
        setEditing(!editing);
        if (editing) {
            setTextValue(msg.text);
        }
    };


    function toggleDelete() {
        setDeleting(!deleting);
    };


    function handleChange(event) {
        setTextValue(event.target.value);
    };


    async function handleEdit() {
        const textArea = document.querySelector(
            `.msg-text-editing[data-id="${msg.id}"]`
        );
        const text = textArea.value;
        if (text.trim() === "") {
            return;
        }

        let reqBody = {
            message: text
        };
        reqBody = JSON.stringify(reqBody);

        const res = await apiManager.editMessage(
            reqBody, msg.id
        );
        if (res.errors) {
            statusCb("Unable to edit message");
            return;
        }

        msg.text = text;
        toggleEdit();
        editCb(msg);
    };


    async function handleDelete() {
        const res = await apiManager.deleteMessage(msg.id);
        if (res.errors) {
            statusCb("Unable to delete message");
            return;
        }

        setDeleted(true);
        deleteCb({
            id: msg.id, 
            authorId: userId, 
            roomId: msg.chatRoomId
        });
    };


    function toggleMenu(event) {
        if (userId === msg.authorId) {
            return;
        }
        event.stopPropagation();
        let target = event.target;
        if (target.matches(".options-modal")) {
            return;
        }
        if (
            !target.matches(".msg-author") || 
            !target.matches(".msg-profile-wrapper")
        ) {
            target = target.parentElement;
        }
        
        const msgId = target.dataset.id;
        const menu = document.querySelector(
            `.options-modal[data-id="${msgId}"]`
        );
        const otherMenu = document.querySelector(
            ".options-modal:not(.hidden)"
        );
        if (otherMenu && otherMenu !== menu) {
            otherMenu.classList.add("hidden");
        }
        menu.classList.toggle("hidden");
    };


    async function sendFriendRequest() {
        let reqBody = {
            receivingUserId: msg.authorId
        };
        reqBody = JSON.stringify(reqBody);

        const res = await apiManager.sendFriendRequest(
            reqBody
        );
        if (res.errors) {
            statusCb("Unable to add friend");
            return;
        }
        friendsRef.current.add(msg.authorId);
        setRender(!render);
        requestCb(
            res.friendRequest, 
            res.friendRequest.receivingUserId
        );
    };


    function isFriend() {
        return friendsRef.current.has(msg.authorId);
    };


    function goToFriendList() {
        if (window.innerWidth <= 600) {
            const friendBtn = document.querySelector(
                ".friend-toggle"
            );
            friendBtn.click();
        }
        closeCb();
    };


    if (deleted) {
        return null;
    }


    return (
    <div className="msg-card">
        <div 
            className="msg-profile-wrapper" 
            data-id={msg.id}
            onClick={toggleMenu}
        >
            <img 
                className={
                    (msg.author.profileImgUrl) ? 
                        "msg-profile" : 
                        "msg-profile default"
                }
                src={
                    (msg.author.profileImgUrl) ? 
                        msg.author.profileImgUrl : 
                        profileImg
                } 
                alt="profile" 
            />
        </div>
        <div className="msg-content">
            <div className="msg-info">
                <div 
                    className="msg-author" 
                    data-id={msg.id}
                    onClick={toggleMenu}
                >
                    <span 
                        className="options-modal hidden" 
                        data-id={msg.id}
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
                    </span>
                    <p className="msg-username">
                        {msg.author.username}
                    </p>
                    <p className="msg-date">
                        {formatDate(msg.timeStamp)}
                    </p>
                </div>
                {
                (msg.author.id === userId) ?
                <div className="msg-edit-btns">
                    {(!editing && !deleting) ?
                    <>
                    <button onClick={toggleEdit}>
                        <img src={editImg} alt="edit" />
                    </button>
                    <button onClick={toggleDelete}>
                        <img src={deleteImg} alt="delete" />
                    </button>
                    </> :
                    null
                    }
                    {!editing ||
                    <>
                    <button onClick={toggleEdit}>
                        <img src={closeImg} alt="close" />
                    </button>
                    <button onClick={handleEdit}>
                        <img src={saveImg} alt="save" />
                    </button>
                    </>
                    }
                    {!deleting ||
                    <>
                    <button onClick={handleDelete}>
                        <img src={deleteImg} alt="delete" />
                    </button>
                    <button onClick={toggleDelete}>
                        <img src={closeImg} alt="close" />
                    </button>
                    </>
                    }
                </div> :
                null
                }
            </div>
            {
            (editing) ?
            <>
            <textarea 
                name="" 
                className="msg-text-editing"
                value={textValue}
                onChange={handleChange}
                data-id={msg.id}
                maxLength={10000}
            ></textarea>
            </> :
            <p className="msg-text">
                {msg.text}
            </p>
            }
        </div>
    </div>
    );
};



export default MessageCard;