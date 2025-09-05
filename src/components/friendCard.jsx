import "../styles/friendCard.css";
import profileImg from "../assets/profile.svg";
import { useState } from "react";
import closeImg from "../assets/close.svg";
import deleteImg from "../assets/delete.svg";
import apiManager from "../utils/apiManager";



function FriendCard({relationId, friend, deleteCb, statusCb}) {
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
            {/* <button>
                <img src={closeImg} alt="" />
            </button> */}
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