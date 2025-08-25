import "../styles/header.css";
import { Component } from "react";
import logoImg from "../assets/logo-png.png";
import { Link } from "react-router-dom";



class Header extends Component {
    constructor(props) {
        super(props);

        this.state = {
            user: null
        };
    };


    render() {
        return (
        <header>
            <Link to="/">
            <div className="banner">
                <div className="logo-wrapper">
                    <img 
                        src={logoImg} 
                        alt="bird" 
                        className="logo" 
                    />
                </div>
                <p className="banner-title">Beakbook</p>
            </div>
            </Link>
            <nav>
            {
            (this.state.user) ?
            <button className="user-info-btn">
                <img 
                    src={(this.state.user.profileImgUrl) ? this.state.user.profileImgUrl : logoImg} 
                    alt="profile-pic"
                    className="main-user-profile-pic"
                />
                <p className="main-user-username">{this.state.user.username}</p>
            </button> :
            <>
            <Link to="/login">Log in</Link>
            <Link to="/signup">Sign up</Link>
            </>
            }
            </nav>
        </header>
        );
    };
};



export default Header;