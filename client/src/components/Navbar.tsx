import { Link, useLocation  } from "react-router-dom";
import { GoGear } from "react-icons/go";
import { BsBarChart } from "react-icons/bs";
import { IoPersonOutline } from "react-icons/io5";


function NavBar() {
	const location = useLocation();
	 
	const setNavBarText = () => {
		switch (location.pathname) {
			case "/":
				return "Home";
			case "/Heardle":
				return "Daily Heardle";
			default:
				return "Welcome";
		}
	};

  return (
    <>
			<nav className="bg-navbar text-white border-b border-white">
				<div className="flex justify-evenly items-center py-6 px-3  lg:px-6">

					<a href="/" className="flex-1 invisible lg:visible text-lg lg:text-2xl bg-clip-text text-transparent bg-gradient-to-r text-white">
						OtakuTrials
					</a>						

					<div className="flex-grow text-2xl lg:text-3xl text-center">
						{setNavBarText()}
					</div>

					<ul className="flex flex-1 space-x-1 justify-end">
						<li>
							<Link to="/Account">
								<IoPersonOutline className="w-6 h-6 lg:w-8 lg:h-7 hover:bg-gray-600"/>
							</Link>
						</li>
						<li>
							<Link to="/Leaderboard">
								<BsBarChart className="w-6 h-6 lg:w-8 lg:h-7 hover:bg-gray-600"/>
							</Link>
						</li>
						<li>
							<Link to="/Settings">
								<GoGear className="w-6 h-6 lg:w-8 lg:h-7 hover:bg-gray-600" />
							</Link>
						</li>
					</ul>
				</div>
			</nav>
    </>
  );
}

export { NavBar };
