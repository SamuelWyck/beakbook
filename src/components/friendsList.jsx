import "../styles/friendsList.css";
import { useState } from "react";
import apiManager from "../utils/apiManager.js";



function FriendsList({socket, friends, friendRequests}) {


    
    return (
    <>
        <div className="incoming-requests">

        </div>
        <div className="friends-list">

        </div>
    </>
    );
};



export default FriendsList;