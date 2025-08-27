import './App.css';
import Header from './components/header.jsx';
import { useRef, useEffect } from 'react';
import { Outlet } from 'react-router-dom';



function App() {
	const headerRef = useRef(null);

	useEffect(function() {
		function handleClick(event) {
			const target = event.target;
			if (target.matches(".user-menu")) {
				return;
			}

			const userMenu = document.querySelector(
				".user-menu"
			);
			const menuArrow = document.querySelector(
				".menu-arrow"
			);
			userMenu.classList.add("hidden");
			menuArrow.classList.add("rotate");
		};

		document.addEventListener("click", handleClick);

		return function() {
			document.removeEventListener("click", handleClick);
		};
	});


	return (
		<>
		<Header ref={headerRef} />
		<Outlet context={headerRef}/>
		</>
	);
};



export default App;