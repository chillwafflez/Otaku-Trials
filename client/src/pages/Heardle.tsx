import { useEffect, useState, useRef } from "react";
import { GuessBar } from "../components/GuessBar";
import { SoundBar } from "../components/SoundBar";
import { MusicBar } from "../components/MusicBar";
import { IoPlayOutline } from "react-icons/io5";
import { FiSkipForward } from "react-icons/fi";
import { CiPause1 } from "react-icons/ci";
import { useNavigate } from 'react-router-dom';
import "../styles/SearchBar.css"
import { SearchResult, DailyTrack } from "../types/types.ts";

function Heardle() {

  const navigate = useNavigate();
  const [dailyTrack, setDailyTrack] = useState<DailyTrack | null>(null);
  const [allSuggestions, setAllSuggestions] = useState<string[]>([]);   // full list
  const [searchResults, setSearchResults] = useState<string[]>([]);     // filtered list that renders upon user input
  const [guess, setGuess] = useState("");
  const [guessCount, setGuessCount] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const url = "http://127.0.0.1:5000/heardle/"
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playTimes = [1, 2, 4, 8, 12, 16];
  const stopTimes = [6.25, 12.5, 25, 43.75, 68.75, 100];
  const [animation, setAnimation] = useState(false);

  const [guess1, setGuess1] = useState("\u00A0");
  const [guess2, setGuess2] = useState("\u00A0");
  const [guess3, setGuess3] = useState("\u00A0");
  const [guess4, setGuess4] = useState("\u00A0");
  const [guess5, setGuess5] = useState("\u00A0");
  const [guess6, setGuess6] = useState("\u00A0");

  // fetch daily track once on mount
  useEffect(() => {
    const fetchDaily = async () => {
      try {
        const res = await fetch(url + "tracks/daily");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: DailyTrack = await res.json();
        setDailyTrack(data);

      } catch (error) {
        console.error("Failed to fetch daily track:", error);
      }
    };
    fetchDaily();
  }, []);

  // format daily track answer
  const formatSuggestion = (track: DailyTrack["track"]) => {
    let firstArtist: string = "";
    if (track["artists"]?.length > 0) {
      firstArtist = track["artists"][0]
    }
    return `${track["songName"]} | ${firstArtist} (${track["anime"]})`;
  };

  // set answer var
  const answer = dailyTrack ? formatSuggestion(dailyTrack.track) : "";

  // set audio tag to use daily track's ogg 
  useEffect(() => {
    if (audioRef.current && dailyTrack?.track.audio.ogg) {
      audioRef.current.load();
    }
  }, [dailyTrack]);

  // fetch all current heardle tracks once on mount
  useEffect(() => {
    const fetchTracks = async() => {
      try {
        const response = await fetch(url + "tracks");
        const json = await response.json();
        const tracks: SearchResult[] = [];
        
        json.forEach((res: any) => {
          const Result: SearchResult  = {
            trackID: res[0],
            anime: res[1],
            songName: res[2],
            artists: res[3]
          };
          tracks.push(Result);
        });

        // process each track resource into string for search bar/results
        let searchResultStrings: string[] = [];
        tracks.forEach((track: SearchResult) => {
          let firstArtist: string = "";
          if (track["artists"]?.length > 0) {
            firstArtist = track["artists"][0]
          }
          const resultString: string = `${track["songName"].trim()} | ${firstArtist.trim()} (${track["anime"].trim()})`;
          searchResultStrings.push(resultString);
        });

        setAllSuggestions(searchResultStrings);
        setSearchResults([]);
        console.log("Fetched all current heardle tracks!");
      } catch (error) {
        console.error(error);
      }
    }

    fetchTracks();
  }, []);

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

  // displays results based on what user types into search bar
  const handleGuessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const guessContent = e.target.value;
    setGuess(guessContent);

    if (guessContent.trim() === "") {
      setSearchResults([]);
    } else {
      setSearchResults(allSuggestions.filter((s) => s.toLowerCase().includes(guessContent.toLowerCase())));
    }
  }

  const handleResultSelection = (result: string) => {
    setGuess(result);
    setSearchResults([]);
  }
  

  // handles guess submission
  const handleGuessSubmit = (skip: boolean) => {
    
    let text = "";
    if (skip) {
      setGuessCount((prev) => Math.min(prev + 1, 6));
      console.log("user skipped");
      console.log("guess number: " + guessCount);
      text = "SKIPPED"
    } else {
      if (guess == "") {
        return;
      }

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

    setGuess("");
  }

  const playTrack = () => {
    if (audioRef.current) {
      setProgress(0);

      if (audioRef.current.paused) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
        setAnimation(true);
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
      setAnimation(false);
    }
  }


	return (
		<div className="flex flex-col justify-center items-center">

      {/* guess bars */}
			{/* <div className="flex flex-col flex-grow space-y-5 w-1/3 min-h-[550px] mt-16"> */}
			<div className="flex flex-col flex-grow space-y-5 w-4/5 lg:w-1/3 lg:min-h-[500px] mt-10 lg:mt-16">
        <GuessBar guess={guess1} order={0} correct={false}/>
        <GuessBar guess={guess2} order={1} correct={false}/>
        <GuessBar guess={guess3} order={2} correct={false}/>
        <GuessBar guess={guess4} order={3} correct={false}/>
        <GuessBar guess={guess5} order={4}  correct={false}/>
        <GuessBar guess={guess6}  order={5}  correct={false}/>
			</div>

      <audio ref={audioRef} controls className="hidden">  
        <source src={dailyTrack?.track.audio.ogg ?? ""}>
        </source>
      </audio>

      <MusicBar play={animation}/>

      {/* bottom half */}
      <div className="flex flex-col items-center w-full border-t">
        <SoundBar progress={progress} duration={playTimes[guessCount]} guessCount={guessCount}/>
        {playing ? <CiPause1 className="text-white w-10 h-10 mt-3 lg:mt-6 cursor-pointer" onClick={playTrack}/> : 
                    <IoPlayOutline className="text-white w-10 h-10 mt-3 lg:mt-6 cursor-pointer" onClick={playTrack}/>}
        
        {/* section containing skip button, input box for answer, and submission button */}
        <div className="hidden sm:flex w-full mt-3 lg:mt-6 items-center justify-center space-x-4">
          <div className="flex flex-1 justify-end">
            <FiSkipForward className="text-white w-8 h-8 cursor-pointer" onClick={() => handleGuessSubmit(true)}/>
          </div>

          <div className="w-4/5 lg:w-1/3 h-full relative">
            {searchResults.length > 0 && (
              <ul className="w-full absolute translate-y-[-100%] max-h-90vh overflow-y-auto overflow-x-hidden scrollbar-hide">
                {searchResults.map((result, index) => (
                  <li key={index} className="bg-customBackground text-white p-3 border-t-[0.01rem] border-l-[0.01rem] border-r-[0.01rem]" 
                                  onClick={() => handleResultSelection(result)}>{result}</li>
                ))}
            </ul>
            )}
            <input className="w-full rounded-md py-[0.9rem] lg:py-4 px-3 border text-white focus:outline-none bg-zinc-800" 
                   value={guess}
                   onChange={handleGuessChange}></input>
          </div>

          <div className="flex-1">
            <button className="border w-11 lg:w-24 py-4 px-1 lg:px-3 text-white" onClick={() => handleGuessSubmit(false)}>Enter</button>
          </div>
        </div>

        {/* MOBILE LAYOUT: section containing skip button, input box for answer, and submission button */}
        <div className="flex flex-col sm:hidden w-full mt-3 items-center justify-center">
          <div className="w-4/5 h-full relative">
            {searchResults.length > 0 && (
              <ul className="w-full absolute translate-y-[-100%] max-h-screen overflow-y-auto overflow-x-hidden scrollbar-hide">
                {searchResults.map((result, index) => (
                  <li key={index} className="bg-customBackground text-white p-3 border-t-[0.01rem] border-l-[0.01rem] border-r-[0.01rem]" 
                                  onClick={() => handleResultSelection(result)}>{result}</li>
                ))}
            </ul>
            )}
            <input className="w-full rounded-md py-[0.9rem] px-3 border text-white focus:outline-none bg-zinc-800" 
                   value={guess}
                   onChange={handleGuessChange}></input>
          </div>

          <div className="flex w-4/5 mt-3 items-center justify-between">
              <FiSkipForward className="text-white w-8 h-8 cursor-pointer" onClick={() => handleGuessSubmit(true)}/>
              <button className="border text-white py-2 px-3 text-lg" onClick={() => handleGuessSubmit(false)}>Enter</button>
          </div>
        </div>

      </div>
		</div>
	)
}

export { Heardle };