import { Game } from "../components/Game";
import { Link } from "react-router-dom";
import gachaIcon from "../assets/icons/gacha-icon.png";
import versusIcon from "../assets/icons/versus-icon.png";
import headsetIcon from "../assets/icons/headset-icon.png";
import screenshotIcon from "../assets/icons/screenshot-icon.png";
import characterIcon from "../assets/icons/character-icon.png";
import animedleIcon from "../assets/icons/animedle-icon.png";

function Home() {

  const wipAlert = () => {
    alert("Sorry! This is a WIP");
  }

  return (
    <div className="flex flex-col justify-center items-center mx-4 mt-14 mb-10 lg:mt-20">
      <div className="w-full lg:max-w-[720px] grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8 lg:gap-x-6 lg:gap-y-10">
        <Link to="/Heardle"> 
          <Game game="Heardle" logo={headsetIcon} bgColor="bg-pink-300"/>
        </Link> 
        <div onClick={wipAlert} className="cursor-pointer"><Game game="OP/ED Versus" logo={versusIcon} bgColor="bg-[#DC7FFE]"/></div>
        <div onClick={wipAlert} className="cursor-pointer"><Game game="Character" logo={characterIcon} bgColor="bg-blue-400"/></div>
        <div onClick={wipAlert} className="cursor-pointer"><Game game="Screenshot" logo={screenshotIcon} bgColor="bg-white"/></div>
        <div onClick={wipAlert} className="cursor-pointer"><Game game="Animedle" logo={animedleIcon} bgColor="bg-[#FF6F6F]"/></div>
        <div onClick={wipAlert} className="cursor-pointer"><Game game="Gacha" logo={gachaIcon} bgColor="bg-green-400"/></div>
      </div>
    </div>
  )
}


export { Home };