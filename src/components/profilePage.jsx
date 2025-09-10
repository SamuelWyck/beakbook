import "../styles/profilePage.css";
import profileImg from "../assets/profile.svg";
import { useEffect, useState } from "react";
import LoadingPage from "./loadingPage.jsx";
import apiManager from "../utils/apiManager.js";



function ProfilePage() {
    const [user, setUser] = useState(null);
    const [showDel, setShowDel] = useState(false);


    useEffect(function() {
        apiManager.getProfileData().then(function(res) {
            if (res.errors) {
                return;
            }

            setUser(res.user);
        });
    }, []);


    function toggleDel() {
        setShowDel(!showDel);
    };


    if (!user) {
        return <LoadingPage />;
    }


    return (
    <main className="profile-page">
        <p className="profile-username">
            {user.username}
        </p>
        <div className="profile-info">
            <div className="profile-img">
                <div className="profile-img-wrapper">
                    {(user.profileImgUrl) ?
                    <img src={user.profileImgUrl} alt="" />
                    :
                    <img src={profileImg} className="default"/>
                    }
                </div>
                <form encType="multipart/form-data">
                    <div>
                        <label 
                            htmlFor="image"
                        >Upload image</label>
                        <input 
                            type="file" 
                            id="image" 
                            name="image" 
                        />
                    </div>
                </form>
                {(!showDel) ?
                <button onClick={toggleDel}>Remove Image</button>
                :
                <>
                <button>Remove</button>
                <button onClick={toggleDel}>Cancel</button>
                </>
                }
            </div>
            <form>
                <p className="change-pwd-title">
                    Change password
                </p>
                <div>
                    <label htmlFor="old-password">
                        Old password
                    </label>
                    <input 
                        type="password"
                        id="old-password"
                        name="old-password"
                    />
                </div>
                <div>
                    <label htmlFor="new-password">
                        New password
                    </label>
                    <input 
                        type="password" 
                        id="new-password" 
                        name="new-password" 
                    />
                </div>
                <div>
                    <label htmlFor="confirm">
                        Confirm
                    </label>
                    <input 
                        type="password" 
                        name="confirm" 
                        id="confirm" 
                    />
                </div>
                <div>
                    <button>Change password</button>
                </div>
            </form>
        </div>
    </main>
    );
};



export default ProfilePage;