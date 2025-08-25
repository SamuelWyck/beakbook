import { Link } from "react-router-dom";
import "../styles/authPage.css";
import logoImg from "../assets/logo.png";
import apiManager from "../utils/apiManager.js";



function AuthPage({signup}) {

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
        console.log(res)
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
            <form onSubmit={handleSubmit}>
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
            <Link to={(signup) ? "/login" : "/signup"}>
                {`${(signup ? "Already" : "Don't")} have an account?`}
            </Link>
        </div>
    </main>
    );
};



export default AuthPage;