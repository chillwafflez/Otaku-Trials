import { fetchGameState } from "../utils/GameState.ts";
import { LoadingSpinner } from "../components/LoadingSpinner.tsx";
import { DailyTrackTest, GameState } from "../types/types.ts";
import { useEffect, useState } from "react";


function MobileLayout({ data, status }: { data: DailyTrackTest, status: string }) {

  return (
    <div className="flex flex-col w-4/5 p-5 mx-auto mt-8 bg-[#1C1C1C]">
      {/* user-specific message + song */}
      <span className="text-3xl mx-auto">{status}</span>
      <div className="flex flex-col space-y-[2px] text-xl mt-3">
        <span>Song: {data.track.songName}</span>
        <span>Artist(s): {data.track.artists}</span>
        <span>Type: {data.track.slug}</span>
      </div>

      {/* autoplay the opening */}
      <video
        src={data.track.video_url}
        controls
        autoPlay={false}
        loop
        className="mt-3 mb-5 h-auto mx-auto rounded-lg"
      ></video>

      {/* title + synopsis */}
      <div className="flex flex-col space-y-1">
        <span className="text-2xl">{data.track.anime}</span>
        <span>{data.track.synopsis}</span>
      </div>

      {/* anime poster + info */}
      <div className="flex flex-col my-5 justify-center items-center">
        <img
          src={data.track.image}
          className="w-4/5"
        ></img>  

        <div className="grid grid-cols-3 gap-4 mt-2 text-center">
          <div>
            <div className="font-semibold">Released</div>
            <div>{data.track.year}</div>
          </div>
          <div>
            <div className="font-semibold">Season</div>
            <div>{data.track.season}</div>
          </div>
          <div>
            <div className="font-semibold">Studio(s)</div>
            <div>{data.track.studios?.join(", ")}</div>
          </div>
        </div>
      </div>
    </div>
  )
};

function RegularLayout({ data, status }: { data: DailyTrackTest, status:string }) {

  return (
    <div className="flex flex-col w-1/2 p-5 mx-auto mt-8 bg-[#1C1C1C]">
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">

        {/* left side (user-specific message + song details) */}
        <div>
          <span className="text-4xl mx-auto">{status}</span>
          <div className="flex flex-col space-y-[2px] text-xl mt-3">
            <div className="flex gap-2">
              <span className="opacity-90">Song:</span>
              <span className="font-medium">{data.track.songName}</span>
            </div>
            <div className="flex gap-2">
              <span className="opacity-90">Artist(s):</span>
              <span className="font-medium">{data.track.artists}</span>
            </div>
            <div className="flex gap-2">
              <span className="opacity-90">Type:</span>
              <span className="font-medium">{data.track.slug}</span>
            </div>
          </div>

          {/* autoplay the opening */}
          <video
            src={data.track.video_url}
            controls
            autoPlay={false}
            loop
            className="mt-3 mb-5 h-auto mx-auto rounded"
          ></video>

          {/* title + synopsis */}
          <div className="flex flex-col space-y-2">
            <span className="text-2xl">{data.track.anime}</span>
            <span className="text-sm">{data.track.synopsis}</span>
          </div>
        </div>

        {/* right side */}
        <div>
          {/* anime poster + info */}
          <div className="flex flex-col my-5 justify-center items-center">
            <img
              src={data.track.image}
              className="w-full object-cover"
            ></img>  

            <div className="grid grid-cols-3 gap-4 mt-2 text-center">
              <div>
                <div className="font-semibold">Released</div>
                <div>{data.track.year}</div>
              </div>
              <div>
                <div className="font-semibold">Season</div>
                <div>{data.track.season}</div>
              </div>
              <div>
                <div className="font-semibold">Studio(s)</div>
                <div>{data.track.studios?.join(", ")}</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}




function HeardleResult() {

  const [dailyTrack, setDailyTrack] = useState<DailyTrackTest | null>(null);
  const [userMessage, setUserMessage] = useState("");
  const url = "http://127.0.0.1:5000/heardle/"

  useEffect(() => {
    // get daily track info
    const fetchDailyTrack = async () => {
      try {
        const res = await fetch(url + "tracks/daily/full");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: DailyTrackTest = await res.json();
        setDailyTrack(data);
        // console.log(dailyTrack);
      } catch (error) {
        console.error("Failed to fetch daily track info:", error);
      }
    }
    fetchDailyTrack();    
  }, [])

  // process when daily track arrives
  useEffect(() => {
    if (!dailyTrack) return;

    const savedState: GameState | null = fetchGameState();
    // get game state (user succeeded or failed)
    if (!savedState) {
      return;
    }

    if (savedState.status == "SUCCESS") {
      setUserMessage("Yippee you guessed the song!");
    } else {
      setUserMessage("Better luck next time!");
    }
    }, [dailyTrack]);


  return (
    <div className="flex flex-col justify-center items-center text-white">

      {dailyTrack ? (
        <>
          <div className="lg:hidden w-full">
            <MobileLayout data={dailyTrack} status={userMessage} />
          </div>

          <div className="hidden lg:block w-full">
            <RegularLayout data={dailyTrack} status={userMessage} />
          </div>
        </>
      ) : (
        <LoadingSpinner />
      )}
    </div>
  )
}


export { HeardleResult };