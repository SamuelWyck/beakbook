import "../styles/mainPage.css";
import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import apiManager from "../utils/apiManager.js";
import LoadingPage from "./loadingPage.jsx";



function MainPage() {
    const navigate = useNavigate();
    const headerRef = useOutletContext();
    const [userData, setUserData] = useState(null);


    useEffect(function() {
        apiManager.getUserData().then(function(res) {
            if (res.errors) {
                const firstErrMsg = res.errors[0].msg;
                if (firstErrMsg === "Client not authenticated") {
                    navigate("/signup", {replace: true});
                    return;
                }
            }
            setUserData(res.userData);
            headerRef.current.updateUser(res.userData.user);
        });
    }, []);


    if (!userData) {
        return <LoadingPage />;
    }


    return (
        <main>

        </main>
    );
};



export default MainPage;