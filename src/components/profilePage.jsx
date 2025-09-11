import "../styles/profilePage.css";
import profileImg from "../assets/profile.svg";
import { useEffect, useState, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import LoadingPage from "./loadingPage.jsx";
import apiManager from "../utils/apiManager.js";



function ProfilePage() {
    const [user, setUser] = useState(null);
    const [showDel, setShowDel] = useState(false);
    const [errors, setErrors] = useState(null);
    const headerRef = useOutletContext();
    const uploading = useRef(false);


    useEffect(function() {
        apiManager.getProfileData().then(function(res) {
            if (res.errors) {
                return;
            }

            setUser(res.user);
            headerRef.current.updateUser(res.user);
        });
    }, [headerRef]);


    function toggleDel() {
        setShowDel(!showDel);
    };


    async function changePassword(event) {
        event.preventDefault();
        const formData = new FormData(event.target);

        let reqBody = {};
        for (let entry of formData.entries()) {
            const [key, value] = entry;
            reqBody[key] = value;
        }
        reqBody = JSON.stringify(reqBody);

        const res = await apiManager.changePassword(reqBody);
        if (res.errors) {
            console.log(res.errors)
            setErrors(getErrorCards(res.errors));
            return;
        }

        if (errors) {
            setErrors(null);
        }
        event.target.reset();
    };


    function getErrorCards(errors) {
        const cards = [];
        for (let error of errors) {
            cards.push(
                <li key={error.msg} className="error">
                    {error.msg}
                </li>
            );
        }
        return cards;
    };


    function requestSubmit() {
        if (uploading.current) {
            return;
        }

        const imgForm = document.querySelector(
            ".profile-img > form"
        );
        imgForm.requestSubmit();
    };


    async function uploadImg(event) {
        event.preventDefault();
        if (uploading.current) {
            return;
        }
        uploading.current = true;

        const formData = new FormData(event.target);
        const res = await apiManager.uploadImage(formData);
        if (res.errors) {
            return;
        }

        setUser(res.user);
        uploading.current = false;
        event.target.reset();
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
                <form 
                    encType="multipart/form-data" 
                    onSubmit={uploadImg}
                >
                    <div>
                        <label htmlFor="image" tabIndex={0}>
                            Upload image
                        </label>
                        <input 
                            type="file" 
                            id="image" 
                            name="image"
                            onChange={requestSubmit} 
                        />
                    </div>
                </form>
                {(!showDel) ?
                <button onClick={toggleDel}>Remove Image</button>
                :
                <div className="del-options">
                <button onClick={toggleDel}>Cancel</button>
                <button>Remove</button>
                </div>
                }
            </div>
            <form onSubmit={changePassword}>
                <p className="change-pwd-title">
                    Change password
                </p>
                {!errors ||
                <ul className="errors">{errors}</ul>
                }
                <div>
                    <label htmlFor="old-password">
                        Old password
                    </label>
                    <input 
                        type="password"
                        id="old-password"
                        name="oldPassword"
                    />
                </div>
                <div>
                    <label htmlFor="new-password">
                        New password
                    </label>
                    <input 
                        type="password" 
                        id="new-password" 
                        name="newPassword" 
                    />
                </div>
                <div>
                    <label htmlFor="confirm">
                        Confirm new password
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