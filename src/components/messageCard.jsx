import "../styles/messageCard.css";
import formatDate from "../utils/formatDate.js";
import profileImg from "../assets/profile.svg";
import deleteImg from "../assets/delete.svg";
import editImg from "../assets/edit.svg";
import closeImg from "../assets/close.svg";
import saveImg from "../assets/save.svg";
import { useState } from "react";
import apiManager from "../utils/apiManager.js";



function MessageCard({msg, userId}) {
    const [editing, setEditing] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleted, setDeleted] = useState(false);
    const [textValue, setTextValue] = useState(msg.text);


    function toggleEdit() {
        setEditing(!editing);
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

        const res = await apiManager.editMessage(reqBody, msg.id);
        if (res.errors) {
            console.log(res.errors);
            return;
        }

        msg.text = text;
        toggleEdit();
    };


    async function handleDelete() {
        const res = await apiManager.deleteMessage(msg.id);
        if (res.errors) {
            console.log(res.errors);
            return;
        }

        setDeleted(true);
    };


    if (deleted) {
        return null;
    }


    return (
    <div className="msg-card">
        <div className="msg-profile-wrapper">
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
                <div className="msg-author">
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