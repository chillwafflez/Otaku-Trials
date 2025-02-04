import { useEffect, useState, useRef } from "react";
import { GuessBar } from "../components/GuessBar";
import { SoundBar } from "../components/SoundBar";
import { IoPlayOutline } from "react-icons/io5";
import { FiSkipForward } from "react-icons/fi";
import { CiPause1 } from "react-icons/ci";


function Heardle() {

  let answer: string = "Attack on Titan"
  const [guess, setGuess] = useState("");
  const [guessCount, setGuessCount] = useState(0);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);


  useEffect(() => {

    const printPenis = () => {
      console.log("penis");
    }

    if (audioRef.current) {
      audioRef.current.addEventListener("timeupdate", printPenis);
    }
  }, []);

  const handleGuess = () => {
    if (guess != answer) {
      setGuess(guess + 1);
    }
  }

  const playTrack = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
        setPlaying(true);
      } else {
        audioRef.current.pause();
        audioRef.current.load();
        setPlaying(false);
      }
    }
  }

  const stopTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
      setPlaying(false);
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

      <audio ref={audioRef} controls className="hidden">  
        <source src="https://a.animethemes.moe/RenaiFlops-OP1.ogg">
        </source>
      </audio>

      {/* bottom half */}
      <div className="flex flex-col items-center w-full border-t">
        <SoundBar/>
        {playing ? <CiPause1 className="text-white w-9 h-10 mt-6 cursor-pointer" onClick={playTrack}/> : 
                    <IoPlayOutline className="text-white w-10 h-10 mt-6 cursor-pointer" onClick={playTrack}/>}
        
        {/* section containing skip button, input box for answer, and submission button */}
        <div className="flex w-full mt-6 items-center justify-center space-x-4">
          <div className="flex flex-1 justify-end">
            <FiSkipForward className="text-white w-8 h-8 cursor-pointer"/>
          </div>
          <input className="w-1/3 rounded-md py-4 px-3 border text-white focus:outline-none bg-zinc-800"></input>
          <div className="flex-1">
            <button className="border w-24 py-4 px-3 text-white" onClick={stopTrack}>Enter</button>
          </div>
        </div>
      </div>
		</div>
	)
}

export { Heardle };