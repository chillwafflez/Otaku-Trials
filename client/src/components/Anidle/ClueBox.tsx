import { DailyAnidle } from "../../types/types";
import { IoMdPeople } from "react-icons/io";
import { RiScreenshot2Line } from "react-icons/ri";
import { LuNotepadText } from "react-icons/lu";
import { useState } from "react";

type ClueKey = 'clue1' | 'clue2' | 'clue3';

function ClueBox(props: {anidle: DailyAnidle | null, guesses: number }) {
  
  const [currentClue, setCurrentClue] = useState<ClueKey | null>(null);
  const [showClue, setShowClue] = useState<boolean>(false);

  const handleClueChange = (clue: ClueKey) => {
    if (clue === currentClue) {
      setShowClue(!showClue);
    } else {
      setCurrentClue(clue);
      setShowClue(true);
    }
  }

  if (props === null) {
    return
  }

  if (props.guesses < 3) {
    return (
      <div className="flex w-4/5 lg:w-1/5 p-5 mt-4 justify-center text-center text-white">
        <span>First clue unlocks after {6 - props.guesses} tries</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-4/5 lg:w-1/5 p-5 mt-8 bg-[#1C1C1C] justify-center text-center">
      <h1 className="text-white text-lg">Clues</h1>
      <hr className="mt-3 bg-blue-600"></hr>

      {/* displaying clue icons */}
      <div className="mt-4 grid grid-cols-3 gap-6 justify-items-center">
        <button
          type="button"
          onClick={() => handleClueChange('clue1')}
          className={`flex flex-col items-center gap-1 text-center cursor-pointer
                      ${props.guesses >= 6 ? "hover:text-bar1" : "text-gray-500"}
                      ${currentClue === 'clue1' && showClue ? "text-bar1" : "text-white"}`}>
          <RiScreenshot2Line className="w-12 h-12" />
          <div className="text-xs">
            Image Clue
            <br />
            <span className={props.guesses >= 6 ? "opacity-0" : ""}>
              in {6 - props.guesses} tries
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleClueChange('clue2')}
          className={`flex flex-col items-center gap-1 text-center cursor-pointer
                      ${props.guesses >= 12 ? "hover:text-bar1" : "text-gray-500"}
                      ${currentClue === 'clue2' && showClue ? "text-bar1" : "text-white"}`}>
          <IoMdPeople className="w-12 h-12" />
          <div className="text-xs">
            Character Clue
            <br />
            <span className={props.guesses >= 12 ? "opacity-0" : ""}>
              in {12 - props.guesses} tries
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleClueChange('clue3')}
          className={`flex flex-col items-center gap-1 text-center cursor-pointer
                      ${props.guesses >= 18 ? "hover:text-bar1" : "text-gray-500"}
                      ${currentClue === 'clue3' && showClue ? "text-bar1" : "text-white"}`}>
          <LuNotepadText className="w-12 h-12" />
          <div className="text-xs ">
            Summary Clue
            <br />
            <span className={props.guesses >= 18 ? "opacity-0" : ""}>
              in {18 - props.guesses} tries
            </span>
          </div>
        </button>
      </div>


      {/* display clue */}
      {currentClue === 'clue1' && showClue && props.guesses > 5 && (
        <div className="w-3/5 mt-8 mx-auto shadow-md overflow-hidden">
          <img src={props.anidle?.cover_image} className="  blur-[6px] border"/>
        </div>
      )}

      {currentClue === 'clue2' && showClue && props.guesses > 11 && (
        <div className="flex w-full mt-8 justify-between items-center">
          <img src="https://s4.anilist.co/file/anilistcdn/character/large/b281109-SRUQVkT7DYyg.jpg" className="w-24"></img>
          <img src="https://s4.anilist.co/file/anilistcdn/character/large/b281110-WxqeTYKB8XdD.jpg" className="w-24"></img>
          <img src="https://s4.anilist.co/file/anilistcdn/character/large/b359202-syrbw7pLHUB7.jpg" className="w-24"></img>
        </div>
      )}

      {currentClue === 'clue3' && showClue && props.guesses > 17 && (
        <p className="text-white mt-5 text-sm">
          {props.anidle?.summary}
        </p>
      )}
    </div>
  );
}

export { ClueBox };