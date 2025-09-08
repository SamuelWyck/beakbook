import "../styles/userChoiceCard.css";
import profileImg from "../assets/profile.svg";
import checkImg from "../assets/check.svg";
import { useState } from "react";



function UserChoiceCard({user, selectCb, unselectCb}) {
    const [selected, setSelected] = useState(false);


    function toggleSelected() {
        if (selected) {
            unselectCb(user.id);
        } else {
            selectCb(user.id);
        }
        setSelected(!selected);
    };


    return (
    <div className="user-choice-card" onClick={toggleSelected}>
        <div className="choice-card-profile-wrapper">
            {(user.profileImg) ?
            <img src={user.profileImg} alt="" />
            :
            <img className="default" src={profileImg} />
            }
        </div>
        <div className="choice-card-info">
            <p className="choice-card-username">
                {user.username}
            </p>
            <div 
                className={
                    `selected${(selected) ? " img-active" : ""}`
                }
            >
                {!selected || <img src={checkImg} />}
            </div>
        </div>
    </div>
    );
};



export default UserChoiceCard;