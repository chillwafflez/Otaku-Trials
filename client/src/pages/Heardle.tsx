import { useEffect, useState, useRef } from "react";
import { GuessBar } from "../components/GuessBar";
import { SoundBar } from "../components/SoundBar";
import { IoPlayOutline } from "react-icons/io5";
import { FiSkipForward } from "react-icons/fi";
import { CiPause1 } from "react-icons/ci";
import { useNavigate } from 'react-router-dom';

function Heardle() {

  const navigate = useNavigate();
  let answer: string = "Attack on Titan"
  const [guess, setGuess] = useState("");
  const [guessCount, setGuessCount] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playTimes = [1, 2, 4, 8, 12, 16]
  const stopTimes = [6.25, 12.5, 25, 43.75, 68.75, 100]

  const [guess1, setGuess1] = useState("\u00A0");
  const [guess2, setGuess2] = useState("\u00A0");
  const [guess3, setGuess3] = useState("\u00A0");
  const [guess4, setGuess4] = useState("\u00A0");
  const [guess5, setGuess5] = useState("\u00A0");
  const [guess6, setGuess6] = useState("\u00A0");

  useEffect(() => {
    const updateProgress = () => {
      if (audioRef.current && !audioRef.current.paused) {
        const currentTime = audioRef.current.currentTime;
        const duration = playTimes[guessCount];
        const progressPercentage = (currentTime / duration) * stopTimes[guessCount];
  
        setProgress(progressPercentage);
  
        if (currentTime >= duration) {
          stopTrack();
        }
      }
    };
  
    const interval = setInterval(updateProgress, 50); // update every 50ms for smooth progress bar
  
    return () => clearInterval(interval);
  }, [guessCount, playing]);

  useEffect(() => {
    if (guessCount == 6) {
      console.log("number of guesses used up");
      navigate('/heardleresult');    
    }
  }, [guessCount])
  

  const handleGuess = (skip: boolean) => {
    
    let text = "";
    if (skip) {
      setGuessCount((prev) => Math.min(prev + 1, 6));
      console.log("user skipped");
      console.log("guess number: " + guessCount);
      text = "SKIPPED"
    } else {

      if (guess == answer) {
        console.log("user guessed correctly!");
        navigate('/heardleresult');   
      } else {
        setGuessCount((prev) => Math.min(prev + 1, 6));
        console.log("guess number: " + guessCount);
        console.log("actual guess: " + guess);
        text = guess;
      }
    }

    switch (guessCount) {
      case 0:
        setGuess1(text);
        break;
      case 1:
        setGuess2(text);
        break;
      case 2:
        setGuess3(text);
        break;
      case 3:
        setGuess4(text);
        break;
      case 4:
        setGuess5(text);
        break;
      case 5:
        setGuess6(text);
        break;
    }
  }

  const playTrack = () => {
    if (audioRef.current) {
      setProgress(0);

      if (audioRef.current.paused) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
        setPlaying(true);
      } else {
        stopTrack();
      }
    }
  }

  const stopTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
    }
  }


	return (
		<div className="flex flex-col justify-center items-center">

      {/* guess bars */}
			<div className="flex flex-col flex-grow space-y-5 w-1/3 min-h-[550px] mt-16">
        <GuessBar guess={guess1} order={0} correct={false}/>
        <GuessBar guess={guess2} order={1} correct={false}/>
        <GuessBar guess={guess3} order={2} correct={false}/>
        <GuessBar guess={guess4} order={3} correct={false}/>
        <GuessBar guess={guess5} order={4}  correct={false}/>
        <GuessBar guess={guess6}  order={5}  correct={false}/>
			</div>

      <audio ref={audioRef} controls className="hidden">  
        <source src="https://a.animethemes.moe/RenaiFlops-OP1.ogg">
        </source>
      </audio>

      {/* bottom half */}
      <div className="flex flex-col items-center w-full border-t">
        <SoundBar progress={progress} duration={playTimes[guessCount]} guessCount={guessCount}/>
        {playing ? <CiPause1 className="text-white w-9 h-10 mt-6 cursor-pointer" onClick={playTrack}/> : 
                    <IoPlayOutline className="text-white w-10 h-10 mt-6 cursor-pointer" onClick={playTrack}/>}
        
        {/* section containing skip button, input box for answer, and submission button */}
        <div className="flex w-full mt-6 items-center justify-center space-x-4">
          <div className="flex flex-1 justify-end">
            <FiSkipForward className="text-white w-8 h-8 cursor-pointer" onClick={() => handleGuess(true)}/>
          </div>
          <input className="w-1/3 rounded-md py-4 px-3 border text-white focus:outline-none bg-zinc-800"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}></input>
          <div className="flex-1">
            <button className="border w-24 py-4 px-3 text-white" onClick={() => handleGuess(false)}>Enter</button>
          </div>
        </div>
      </div>
		</div>
	)
}

export { Heardle };