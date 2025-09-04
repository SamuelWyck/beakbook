import "../styles/requestCard.css";
import profileImg from "../assets/profile.svg";
import yesImg from "../assets/check.svg";
import closeImg from "../assets/close.svg";
import deleteImg from "../assets/delete.svg";
import { useState } from "react";
import apiManager from "../utils/apiManager.js";



function RequestCard({request, deleteCb, sent}) {
    const [showIgnore, setShowIgnore] = useState(false);


    function toggleIgnore() {
        setShowIgnore(!showIgnore);
    };


    async function ignoreRequest() {
        const res = await apiManager.deleteFriendRequest(
            request.id
        );
        if (res.errors) {
            return;
        }

        deleteCb(request, sent);
    };


    const user = (sent) ? request.receivingUser : 
    request.requestingUser;

    return (
        <div className="friend-request">
            <div className="request-user">
                <div className="request-profile-wrapper">
                    {(user.profileImgUrl) ?
                    <img 
                        src={user.profileImgUrl} 
                        alt="" 
                    /> :
                    <img src={profileImg} className="default" />
                    }
                </div>
                <p className="request-username">
                    {user.username}
                </p>
            </div>
            <div className="request-options">
                {(showIgnore) ?
                <>
                <button onClick={toggleIgnore}>
                    <img src={closeImg} alt="" />
                </button>
                <button onClick={ignoreRequest}>
                    <img src={deleteImg} alt="" />
                </button>
                </> :
                <>
                <button onClick={toggleIgnore}>
                    <img src={closeImg} alt="" />
                </button>
                {sent ||
                <button>
                    <img src={yesImg} alt="" />
                </button>
                }
                </>
                }
            </div>
        </div>
    );
};



export default RequestCard;