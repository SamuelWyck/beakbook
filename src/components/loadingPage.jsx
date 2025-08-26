import "../styles/loadingPage.css";
import logoImg from "../assets/logo.png";



function LoadingPage() {
    return (
    <main className="loading-main">
        <div className="loading-wrapper">
        <img src={logoImg} alt="bird" className="loading-img" />
        <p className="loading">Loading...</p>
        </div>
    </main>
    );
};



export default LoadingPage;