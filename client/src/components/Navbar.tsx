import { useLocation  } from "react-router-dom";
import { GoGear } from "react-icons/go";
import { BsBarChart } from "react-icons/bs";
import { IoPersonOutline } from "react-icons/io5";


function NavBar() {
	const location = useLocation();
	 
	const setNavBarText = () => {
		switch (location.pathname) {
			case "/":
				return "Home";
			case "/heardle":
				return "Daily Heardle";
			case "/heardleresult":
				return "Daily Heardle";
			default:
				return "Welcome";
		}
	};

  return (
    <>
			<nav className="bg-navbar text-white border-b border-white">
				<div className="flex justify-evenly items-center py-6 px-3  lg:px-6">

					<div className="flex-1">
						<a href="/" className="invisible lg:visible text-lg lg:text-2xl bg-clip-text text-transparent bg-gradient-to-r text-white">
							OtakuTrials
						</a>	
					</div>					

					<div className="flex-grow text-2xl lg:text-3xl text-center">
						{setNavBarText()}
					</div>

					<ul className="flex flex-1 space-x-1 justify-end">
						<li>
							<IoPersonOutline className="w-6 h-6 lg:w-8 lg:h-7 hover:text-gray-400 cursor-pointer"/>
						</li>
						<li>
							<BsBarChart className="w-6 h-6 lg:w-8 lg:h-7 hover:text-gray-400 cursor-pointer"/>
						</li>
						<li>
							<GoGear className="w-6 h-6 lg:w-8 lg:h-7 hover:text-gray-400 cursor-pointer"/>
						</li>
					</ul>
				</div>
			</nav>
    </>
  );
}

export { NavBar };
