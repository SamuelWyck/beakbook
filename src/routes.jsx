import App from "./App.jsx";
import AuthPage from "./components/authPage.jsx";
import MainPage from "./components/mainPage.jsx";



const routes = [
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "/",
                index: true,
                element: <MainPage />
            }
        ]
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