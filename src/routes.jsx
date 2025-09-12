import App from "./App.jsx";
import AuthPage from "./components/authPage.jsx";
import MainPage from "./components/mainPage.jsx";
import ProfilePage from "./components/profilePage.jsx";
import { Navigate } from "react-router-dom";



const routes = [
    {
        path: "/signup",
        element: <AuthPage signup={true} />
    },
    {
        path: "/login",
        element: <AuthPage signup={false} />
    },
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "/",
                index: true,
                element: <MainPage />
            },
            {
                path: "/profile",
                element: <ProfilePage />
            },
            {
                path: "/*",
                element: <Navigate to="/" replace={true} />
            }
        ]
    }
];



export default routes;