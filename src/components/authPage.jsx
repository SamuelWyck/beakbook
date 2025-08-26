import { Link } from "react-router-dom";
import "../styles/authPage.css";
import logoImg from "../assets/logo.png";
import apiManager from "../utils/apiManager.js";
import {useState, useRef, useEffect} from "react";
import { useNavigate } from "react-router-dom";



function AuthPage({signup}) {
    const [errors, setErrors] = useState(null);
    const navigate = useNavigate();
    const formRef = useRef();


    useEffect(function() {
        apiManager.checkAuthStatus().then(function(res) {
            if (res.errors) {
                setErrors(res.errors);
                return;
            }
            if (res.authenticated) {
                navigate("/", {replace: true});
            }
        });
    }, [navigate]);


    async function handleSubmit(event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        let reqBody = {};
        for (let entry of formData.entries()) {
            const [key, value] = entry;
            reqBody[key] = value;
        }
        reqBody = JSON.stringify(reqBody);

        let res;
        if (signup) {
            res = await apiManager.signupUser(reqBody);
        } else {
            res = await apiManager.loginUser(reqBody);
        }
        
        if (res.errors) {
            setErrors(getErrorCards(res.errors));
            return;
        }

        navigate("/", {replace: true});
    };


    function cleanForm() {
        if (errors) {
            setErrors(null);
        }
        formRef.current.reset();
    };


    function getErrorCards(errors) {
        const errorCards = [];
        for (let error of errors) {
            errorCards.push(
                <li 
                    className="error"
                    key={error.msg}
                >{error.msg}</li>
            );
        }
        return errorCards;
    };



    return (
    <main className="auth-page">
        <div className="auth-modal">
            <div className="auth-banner">
                <p className="auth-title">
                    {(signup) ? "Sign up" : "Log in"}
                </p>
                <img src={logoImg} alt="logo" />
            </div>
            {!errors ||
            <ul className="errors">{errors}</ul>
            }
            <form onSubmit={handleSubmit} ref={formRef}>
                {!signup ||
                <div>
                    <label htmlFor="email">Email</label>
                    <input type="email" name="email" id="email" />
                </div>
                }
                <div>
                    <label htmlFor="username">Username</label>
                    <input type="text" name="username" id="username" />
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input type="password" name="password" id="password" />
                </div>
                {!signup ||
                <div>
                    <label htmlFor="confirm">Confirm password</label>
                    <input type="password" name="confirm" id="confirm"/>
                </div>
                }
                <div>
                    <button>{(signup) ? "Sign up" : "Log in"}</button>
                </div>
            </form>
            <Link to={(signup) ? "/login" : "/signup"} onClick={cleanForm}>
                {`${(signup ? "Already" : "Don't")} have an account?`}
            </Link>
        </div>
    </main>
    );
};



export default AuthPage;