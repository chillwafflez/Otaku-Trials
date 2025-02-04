import { Link } from "react-router-dom";
import { GoGear } from "react-icons/go";
import { BsBarChart } from "react-icons/bs";
import { IoPersonOutline } from "react-icons/io5";
import { useEffect, useState } from "react";


function NavBar() {

  return (
    <>
			<nav className="bg-navbar text-white border-b border-white">
				<div className="flex justify-evenly items-center py-6 px-6">

					<a href="/" className="flex-1 text-2xl bg-clip-text text-transparent bg-gradient-to-r text-white">
						OtakuTrials
					</a>						

					<div className="flex-grow text-3xl text-center">
							Daily Heardle
					</div>

					<ul className="flex flex-1 space-x-2 justify-end">
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
