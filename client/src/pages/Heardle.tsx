import { useEffect, useState } from "react";
import { GuessBar } from "../components/GuessBar";
import { SoundBar } from "../components/SoundBar";
import { IoPlayOutline } from "react-icons/io5";
import { FiSkipForward } from "react-icons/fi";


function Heardle() {

  let answer: string = "Attack on Titan"
  const [guess, setGuess] = useState("");
  const [guessCount, setGuessCount] = useState(0);

  const handleGuess = () => {
    if (guess != answer) {
      setGuess(guess + 1);
    }
  }


	return (
		<div className="flex flex-col justify-center items-center">

      {/* guess bars */}
			<div className="flex flex-col flex-grow space-y-5 w-1/3 min-h-[550px] mt-16">
        <GuessBar guess="skibidi" order={1} correct={false}/>
        <GuessBar guess="lebron" order={2} correct={false}/>
        <GuessBar guess="curry" order={3} correct={false}/>
        <GuessBar guess="kd" order={4} correct={false}/>
        <GuessBar guess="mama" order={5}  correct={false}/>
        <GuessBar guess="dada"  order={6}  correct={false}/>
			</div>

      {/* bottom half */}
      <div className="flex flex-col items-center w-full border-t">
        <SoundBar/>
        <IoPlayOutline className="text-white w-10 h-10 mt-6 cursor-pointer"/>
        
        {/* section containing skip button, input box for answer, and submission button */}
        <div className="flex w-full mt-6 items-center justify-center space-x-4">
          <div className="flex flex-1 justify-end">
            <FiSkipForward className="text-white w-8 h-8 cursor-pointer"/>
          </div>
          <input className="w-1/3 rounded-md py-4 px-3 border text-white focus:outline-none bg-zinc-800"></input>
          <div className="flex-1">
            <button className="border w-24 py-4 px-3 text-white">Enter</button>
          </div>
        </div>
      </div>
		</div>
	)
}

export { Heardle };