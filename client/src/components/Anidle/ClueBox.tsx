import { DailyAnidle } from "../../types/types";
import { IoMdPeople } from "react-icons/io";
import { RiScreenshot2Line } from "react-icons/ri";
import { LuNotepadText } from "react-icons/lu";
import { ClueButton } from "./ClueButton";
import { useState } from "react";

type ClueKey = 'clue1' | 'clue2' | 'clue3';

function ClueBox({anidle, guesses, unlocked, used, onUse}: {
    anidle: DailyAnidle | null; 
    guesses: number;
    unlocked: Record<ClueKey, boolean>; // which clues have been unlocked
    used: Record<ClueKey, boolean>; // which clues have been used
    onUse: (key: ClueKey) => void;      // mark clue as used
  }) {

  const [openKey, setOpenKey] = useState<ClueKey | null>(null);
  
  const handleIconClick = (key: ClueKey) => {
    if (!unlocked[key]) return;
    // if first time clicking after unlock, mark as used (persist) once
    if (!used[key]) onUse(key);
    setOpenKey(prev => (prev === key ? null : key));
  };

  return (
    <div className="flex flex-col w-4/5 lg:w-1/5 p-5 mt-8 bg-[#1C1C1C] justify-center text-center">
      <h1 className="text-white text-lg">Clues</h1>
      <hr className="mt-3"></hr>

      {/* displaying clue icons */}
      <div className="mt-4 grid grid-cols-3 gap-6 justify-items-center">
        <ClueButton guesses={guesses} keyName="clue1" label="Image Clue" Icon={RiScreenshot2Line} 
                             threshold={6} unlocked={unlocked} used={used} isOpen={openKey === 'clue1'}
                             onClick={handleIconClick}/>

        <ClueButton guesses={guesses} keyName="clue2" label="Character Clue" Icon={IoMdPeople} 
                             threshold={12} unlocked={unlocked} used={used} isOpen={openKey === 'clue2'} 
                             onClick={handleIconClick}/>
                        
        <ClueButton guesses={guesses} keyName="clue3" label="Summary Clue" Icon={LuNotepadText} 
                             threshold={18} unlocked={unlocked} used={used} isOpen={openKey === 'clue3'}
                             onClick={handleIconClick}/>
      </div>


      {/* display clue */}
      {openKey === 'clue1' && unlocked.clue1 && (
        <div className="w-3/5 mt-8 mx-auto shadow-md overflow-hidden">
          <img src={anidle?.cover_image} className="blur-[7px] border"/>
        </div>
      )}

      {openKey === 'clue2' && unlocked.clue2 && (
        <div className="flex w-full mt-8 justify-between items-center">
          {anidle?.top_three_characters.map((result) => (
            <img key={result} src={result} className="w-24 lg:w-[6.5rem]"></img>
          ))}
        </div>
      )}

      {openKey === 'clue3' && unlocked.clue3 && (
        <p className="text-white mt-5 text-sm">
          {anidle?.shortened_summary ? anidle?.shortened_summary : anidle?.summary}
        </p>
      )}
    </div>
  );
}

export { ClueBox };