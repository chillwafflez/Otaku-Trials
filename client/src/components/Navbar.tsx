import { Link, useNavigate } from "react-router-dom";
import { GoGear } from "react-icons/go";
import { BsBarChart } from "react-icons/bs";
import { IoPersonOutline } from "react-icons/io5";
import { useEffect, useState } from "react";


function NavBar() {

//   const [foundUser, setFoundUser] = useState<string | undefined>();
//   const [userProfileURL, setUserProfileURL] = useState<string>("/Profile/");

  return (
    <>
			<nav className="bg-navbar text-white border-b border-white">
				<div className="flex justify-between items-center py-6 px-6">
					<a href="/" className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r text-white">
						Weab Wisdom
					</a>
					<div className="text-3xl">
							Daily Heardle
					</div>
					<ul className="flex space-x-2">
						<li>
							<Link to="/Account">
								<IoPersonOutline className="w-8 h-7 hover:bg-gray-600"/>
							</Link>
						</li>
						<li>
							<Link to="/Leaderboard">
								<BsBarChart className="w-8 h-7 hover:bg-gray-600"/>
							</Link>
						</li>
						<li>
							<Link to="/Settings">
								<GoGear className="w-8 h-7 hover:bg-gray-600" />
							</Link>
						</li>
					</ul>
				</div>
			</nav>
    </>
  );
}

export { NavBar };
