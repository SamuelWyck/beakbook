import "../styles/header.css";
import { Component } from "react";
import logoImg from "../assets/logo.png";
import { Link, Navigate } from "react-router-dom";
import apiManager from "../utils/apiManager.js";
import profileImg from "../assets/profile.svg";
import menuArrowImg from "../assets/menu-arrow.svg";



class Header extends Component {
    constructor(props) {
        super(props);

        this.state = {
            user: null,
            redirect: false
        };

        this.updateUser = this.updateUser.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
    };


    updateUser(user) {
        if (!user && !this.state.user) {
            return;
        }
        if ((user && this.state.user) && user.profileImgUrl === this.state.user.profileImgUrl) {
            return;
        }

        this.setState(function(state) {
            return {...state, user: user};
        });
    };


    handleMenu(event) {
        event.stopPropagation();
        const userMenu = document.querySelector(".user-menu");
        userMenu.classList.toggle("hidden");
        const menuArrow = document.querySelector(".menu-arrow");
        menuArrow.classList.toggle("rotate");
    };


    async handleLogout(event) {
        event.preventDefault();
        const res = await apiManager.logoutUser();
        if (res.errors) {
            return;
        }

        this.setState(function(state) {
            return {...state, redirect: true};
        });
    };


    render() {
        if (this.state.redirect) {
            return <Navigate to={"/login"} replace={true} />;
        }

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
            {(this.state.user) ?
            <nav>
                <button className="user-info-btn" onClick={this.handleMenu}>
                    <img 
                        src={(this.state.user.profileImgUrl) ? this.state.user.profileImgUrl : profileImg} 
                        alt="profile-pic"
                        className={`main-user-profile-pic${(this.state.user.profileImgUrl) ? "" : " default"}`}
                    />
                    <p className="main-user-username">{this.state.user.username}</p>
                    <img 
                        src={menuArrowImg} 
                        alt="arrow" 
                        className="rotate menu-arrow"
                    />
                </button> 
                <div className="user-menu hidden">
                    <Link to="/profile">Profile</Link>
                    <Link onClick={this.handleLogout}>Log out</Link>
                </div>
            </nav> :
            <p></p>
            }
        </header>
        );
    };
};



export default Header;