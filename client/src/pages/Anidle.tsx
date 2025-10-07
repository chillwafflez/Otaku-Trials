import { useEffect, useState } from "react";
import { FaRegQuestionCircle } from "react-icons/fa";
import { AnidleAnime, DailyAnidle, AnidleGameState } from "../types/types.ts";
import { initState, saveAnidleGameState, fetchAnidleGameState, clearAnidleGameState, addGuess, markCompleted } from "../utils/AnidleGameState.ts";
import { FaArrowUpLong } from "react-icons/fa6";
import { FaArrowDownLong } from "react-icons/fa6";
// import { AnidleResult } from "../components/Anidle/AnidleResult.tsx";
import { ClueBox } from "../components/Anidle/ClueBox.tsx";

function Anidle() {
  const url = "http://127.0.0.1:5000/"
  const [dailyAnidle, setDailyAnidle] = useState<DailyAnidle | null>(null);
  const [allAnimes, setAllAnimes] = useState<AnidleAnime[]>([]);   // full list
  const [searchResults, setSearchResults] = useState<AnidleAnime[]>([]);     // filtered list that renders upon user input

  const [gameState, setGameState] = useState<AnidleGameState | null>(null);

  const [query, setQuery] = useState(""); 
  const [guess, setGuess] = useState<AnidleAnime | null>(null);
  const [guesses, setGuesses] = useState<AnidleAnime[]>([]);
  const [text, setText] = useState("Guess an Anime!");
  const [solved, setSolved] = useState(false);

  // ---- functions ---- //

  // fetch daily mystery anime
  const fetchDailyAnidle = async () => {
    try {
      const res = await fetch(url + "anidle/daily");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: DailyAnidle = await res.json();
      setDailyAnidle(data);
      // console.log(data);
    } catch (error) {
      console.error("Failed to fetch daily anidle anime:", error);
    }
  };

  // fetch all animes and their info from database (for fast lookup)
  const fetchAnimes = async() => {
    try {
      const response = await fetch(url + "anime");
      const json = await response.json();
      const animes: AnidleAnime[] = [];
      
      json.forEach((res: any) => {
        animes.push(res);
      });

      setAllAnimes(animes);
      setSearchResults([]);
      // console.log("Fetched all animes!");
    } catch (error) {
      console.error(error);
    }
  }

  // fetch an anime's AniList score (bcuz they may change over time)
  const fetchAnimeScore = async(id: number) => {
    try {
      const response = await fetch(url + `anime/score?id=${id}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const json = await response.json();
      const score = json?.data?.Media?.averageScore;

      return typeof score === "number" ? score : null;
    } catch (error) {
      console.error(error);
      return null
    }
  }

  // compare two arrays and returns an array specifying matching values (for comparing genres, tags, etc.)
  const overlap = (mystery: string[] = [], guess: string[] = []) => {
    if (!mystery?.length || !guess?.length) {
      return [];
    }
    const correctItems = new Set(mystery.map(x => x.toLowerCase()));

    const hits: [string, boolean][] = [];
    guess.map(item => {
      if (correctItems.has(item.toLowerCase())) {
        hits.push([item, true]);
      } else {
        hits.push([item, false]);
      }
    })
    return hits;
  };

  // ---- effects ---- //

  // fetch daily anidle anime once on mount
  useEffect(() => {
    fetchDailyAnidle();
    fetchAnimes();
  }, []);

  // when the daily anidle arrives, load/init game state
  useEffect(() => {
    if (!dailyAnidle) return;

    const savedState = fetchAnidleGameState(dailyAnidle.anilist_id);
    // if there is already a saved state and it matches the current daily song, fetch it (continue where we left off)
    if (savedState) {
      setGameState(savedState);
    } else {
      // new day or no save: start fresh
      const newState: AnidleGameState = initState(dailyAnidle.anilist_id);
      clearAnidleGameState();             // clears old day’s state if there is any
      saveAnidleGameState(newState);      // save new game state into LS
      setGameState(newState);
    }
  }, [dailyAnidle]);

  // when allAnimes or game state changes repopulate UI to display guesses
  useEffect(() => {
    if (!gameState || allAnimes.length === 0) return;

    // map each anime to its anilist id
    const byId = new Map(allAnimes.map(a => [a.anilist_id, { ...a }]));

    // create map for each cached guess in ls
    const cacheById = new Map(
      (gameState.guessCache ?? []).map(c => [c.id, c])
    );

    // merge cached data with allAnimes data
    const visible = gameState.guessesIDs.map((id) => {
      const base = byId.get(id);
      if (!base) {
        return null;
      }
      const cachedGuess = cacheById.get(id);

      // fetch scores from cached data and insert into the animes the user guessed (so we dont gotta call anilist api again)
      if (cachedGuess && cachedGuess.score != null) {
        base.score = cachedGuess.score as number;
      }
      return base;
    }).filter(Boolean) as AnidleAnime[];

    setGuesses(visible);

    if (visible.length > 0) {
      setText(`Guess ${guesses.length + 1}`);
    }
  }, [gameState, allAnimes]);


  // ---- handlers ---- //

  // displays results based on what user types into search bar
  const handleGuessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (solved) return; 

    const guessContent = e.target.value;
    setQuery(guessContent);

    if (guessContent.trim() === "") {
      setSearchResults([]);
    } else {
      // setSearchResults(allAnimes.filter((s) => s.english_title.toLowerCase().includes(guessContent.toLowerCase())));
      setSearchResults(
        allAnimes.filter((s) =>
          ((s.english_title || s.user_preferred_title) ?? "")
            .toLowerCase()
            .includes(guessContent.toLowerCase())
          )
      )
    }
  }

  // when user selects an item from the search results
  const handleResultSelection = (result: AnidleAnime) => {
    const title = result.english_title ? result.english_title : result.user_preferred_title;
    setQuery(title);
    setGuess(result);
    setSearchResults([]);
  }

  const handleGuessSubmit = async () => {
    if (solved || !guess || !gameState || !dailyAnidle) return;

    // fetch anime's score from AniList API
    const score = await fetchAnimeScore(guess.anilist_id);
    guess.score = score ?? -1;

    // dont allow user to choose the same anime multiple times (prevents dupes)
    if (!guesses.some(g => g.anilist_id === guess.anilist_id)) {
      setGuesses(prev => [...prev, guess]);
    }

    // build next state
    const cache = {
      id: guess.anilist_id,
      title: guess.english_title || guess.user_preferred_title,
      cover_image: guess.cover_image,
      score: guess.score
    };
    let nextState = addGuess(gameState, guess.anilist_id, cache);

    if (guess.anilist_id === dailyAnidle.anilist_id) {
      console.log("user guessed correctly!");

      nextState = markCompleted(nextState)
      setText("Yippee, you got it!");
      setSolved(true);
    } else {
      setText(`Guess ${guesses.length + 1}`);
    }   

    saveAnidleGameState(nextState);
    setGameState(nextState);

    // reset input
    setQuery("");
    setGuess(null);
  }


  const ItemsDiv = ({ matches }: { matches: [string, boolean][] }) => {
    return (
      <div className="flex flex-col text-center justify-center py-3">
        {matches.map(([item, match]) => (
          <span
            key={`${item}-${match}`}
            className={`rounded px-2 py-0.5  ${match ? " text-emerald-400" : "text-rose-500"}`}>
            {item}
          </span>
        ))}
      </div>
    );
  };

  
  return (
    <div className="flex flex-col justify-center items-center">
      <h1 className="mt-20 text-white text-4xl lg: 3xl">{text}</h1>

      <div className="hidden sm:flex w-full mt-10 items-center justify-center space-x-4">
        <div className="flex flex-1 justify-end space-x-2">
          <FaRegQuestionCircle className="text-white hover:text-bar1 w-8 h-8 cursor-pointer" />
        </div>

        <div className="w-4/5 lg:w-1/3 h-full relative">
          {searchResults.length > 0 && (
            // <ul className="w-full absolute translate-y-[-100%] max-h-90vh overflow-y-auto overflow-x-hidden scrollbar-hide">
            <ul className="absolute top-full left-0 right-0 mt-2 z-20 max-h-[50vh] overflow-y-auto scrollbar-hide border-b">
              {searchResults.map((result) => (
                <li key={result.anilist_id} className="bg-customBackground text-white p-3 border-t-[0.01rem] border-l-[0.01rem] border-r-[0.01rem]" 
                                onClick={() => handleResultSelection(result)}>{result.english_title ? result.english_title : result.user_preferred_title}</li>
              ))}
          </ul>
          )}
          <input className="w-full rounded-md py-[0.9rem] lg:py-4 px-3 border text-white focus:outline-none bg-zinc-800" 
                  value={query}
                  onChange={handleGuessChange}></input>
        </div>

        <div className="flex-1">
          <button className="border w-11 lg:w-24 py-4 px-1 lg:px-3 text-white hover:bg-bar1" onClick={handleGuessSubmit}>Enter</button>
        </div>
      </div>

      {/* mobile layout for search bar */}
      <div className="flex flex-col sm:hidden w-full mt-8 items-center justify-center">
        <div className="w-4/5 h-full relative">
          {searchResults.length > 0 && (
            <ul className="absolute top-full left-0 right-0 mt-2 z-20 max-h-[50vh] overflow-y-auto scrollbar-hide border-b">
              {searchResults.map((result) => (
                <li key={result.anilist_id} className="bg-customBackground text-white p-3 border-t-[0.01rem] border-l-[0.01rem] border-r-[0.01rem]" 
                                onClick={() => handleResultSelection(result)}>{result.english_title ? result.english_title : result.user_preferred_title}</li>
              ))}
          </ul>
          )}
          <input className="w-full rounded-md py-[0.9rem] px-3 border text-white focus:outline-none bg-zinc-800" 
                 value={query}
                 onChange={handleGuessChange}></input>
        </div>
        <div className="flex w-4/5 mt-3 items-center justify-between">
            <div className="flex space-x-1">
              <FaRegQuestionCircle className="text-white hover:text-bar1 w-8 h-8 cursor-pointer"
                                    />
            </div>
            <button className="border text-white py-2 px-3 text-lg"
                    onClick={handleGuessSubmit}>Enter</button>
        </div>
      </div>

      {/* {guesses.length >= 3 && <ClueBox anidle={dailyAnidle} guesses={guesses.length}/>} */}
      <ClueBox anidle={dailyAnidle} guesses={guesses.length}/>

      <div className="mt-3 w-full px-4"> 
        <div className="overflow-x-auto">
          <table className="w-4/5 my-8 mx-auto bg-[#1C1C1C]">
            <thead>
              <tr>
                <th className="px-16 py-3 w-16 lg:w-20 text-center text-white font-normal"></th>
                <th className="pr-6 pl-3 w-48 text-left text-white font-normal">Title</th>
                <th className="px-6 py-3 text-center text-white font-normal">Year</th>
                <th className="px-6 py-3 text-center text-white font-normal">Season</th>
                <th className="px-6 py-3 text-center text-white font-normal">Episodes</th>
                <th className="p-6 py-3 text-center text-white font-normal">Genres</th>
                <th className="p-12 py-3 text-center text-white font-normal">Tags</th>
                <th className="p-6 py-3 text-center text-white font-normal">Studios</th>
                <th className="px-6 py-3 text-center text-white font-normal">Source</th>
                <th className="px-6 py-3 text-center text-white font-normal">Score</th>
              </tr>
            </thead>
            <tbody>
              {guesses.map((g) => {
                const mystery = dailyAnidle;
                const titleMatch = mystery ? mystery.anilist_id === g.anilist_id : false;
                const yearMatch = mystery ? mystery.season_year === g.season_year : false;
                const seasonMatch  = mystery ? mystery.season === g.season : false;
                const epsMatch  = mystery ? mystery.num_of_episodes === g.num_of_episodes : false;
                const sourceMatch  = mystery ? mystery.source === g.source : false;
                const scoreMatch = mystery ? mystery.score === g.score : false;
                const genreMatches = mystery ? overlap(mystery.genres, g.genres) : [];
                const tagHits = mystery ? overlap(mystery.tags, g.tags) : [];
                const studioHits = mystery ? overlap(mystery.studios, g.studios) : [];

                return (
                  <tr key={g.anilist_id} className="border-b-black py-32">
                    <td className={`px-6 text-center justify-center`}> 
                      <img src={g.cover_image}
                           alt="test cover"
                           className="object-cover bg-neutral-800"/>
                    </td>
                    <td className={`pr-6 pl-3 ${titleMatch ? " text-emerald-400" : "text-rose-500"}`}>{g.english_title ? g.english_title : g.user_preferred_title}</td>
                    <td className={`relative px-6 text-center ${yearMatch ? " text-emerald-400" : "text-rose-500"}`}>
                      <span className="relative z-10">{g.season_year}</span>
                      {mystery && g.season_year < mystery.season_year && (
                        <FaArrowUpLong className={`absolute inset-0 m-auto w-11 h-11 opacity-15 z-0 ${yearMatch ? " text-emerald-400" : "text-rose-500"}`} />
                      )}
                      {mystery && g.season_year > mystery.season_year && (
                        <FaArrowDownLong className={`absolute inset-0 m-auto w-11 h-11 opacity-15 z-0 ${yearMatch ? " text-emerald-400" : "text-rose-500"}`} />
                      )}
                    </td>
                    <td className={`px-6 text-center ${seasonMatch ? " text-emerald-400" : "text-rose-500"}`}>{g.season}</td>
                    <td className={`relative px-6 text-center ${epsMatch ? " text-emerald-400" : "text-rose-500"}`}>
                      <span className="relative z-10">{g.num_of_episodes}</span>
                      {mystery && g.num_of_episodes < mystery.num_of_episodes && (
                        <FaArrowUpLong className={`absolute inset-0 m-auto w-11 h-11 opacity-15 z-0 ${epsMatch ? " text-emerald-400" : "text-rose-500"}`} />
                      )}
                      {mystery && g.num_of_episodes > mystery.num_of_episodes && (
                        <FaArrowDownLong className={`absolute inset-0 m-auto w-11 h-11 opacity-15 z-0 ${epsMatch ? " text-emerald-400" : "text-rose-500"}`} />
                      )}
                    </td>
                    <td><ItemsDiv matches={genreMatches}/></td>
                    <td><ItemsDiv matches={tagHits}/></td>
                    <td><ItemsDiv matches={studioHits}/></td>
                    <td className={`px-6 text-center ${sourceMatch ? " text-emerald-400" : "text-rose-500"}`}>{g.source.replace("_", " ")}</td>
                    <td className={`relative px-6 text-center ${scoreMatch ? " text-emerald-400" : "text-rose-500"}`}>
                      <span className="relative z-10">{g.score}</span>
                      {mystery && g.score < mystery.score && (
                        <FaArrowUpLong className={`absolute inset-0 m-auto w-11 h-11 opacity-15 z-0 ${scoreMatch ? " text-emerald-400" : "text-rose-500"}`} />
                      )}
                      {mystery && g.score > mystery.score && (
                        <FaArrowDownLong className={`absolute inset-0 m-auto w-11 h-11 opacity-15 z-0 ${scoreMatch ? " text-emerald-400" : "text-rose-500"}`} />
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>


      {/* {solved && <AnidleResult success=/>} */}

    </div>
  )
}

export { Anidle };