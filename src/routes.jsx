import App from "./App.jsx";
import AuthPage from "./components/authPage.jsx";



const routes = [
    {
        path: "/",
        element: <App />
    },
    {
        path: "/signup",
        element: <AuthPage signup={true} />
    },
    {
        path: "/login",
        element: <AuthPage signup={false} />
    }
];



export default routes;