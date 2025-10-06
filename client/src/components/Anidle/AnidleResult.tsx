import { DailyAnidle } from "../../types/types";

function AnidleResult(props: {success: boolean, gameData: string, clues: string }) {

  if (props === null) {
    return
  }

  return (
    <div className="flex flex-col w-1/3 p-5 mx-auto mt-8 bg-[#1C1C1C]">

      <h1>{props.success ? "Yippee you got it!" : "Better luck next time!"}</h1>

  </div>
  );
}

export { AnidleResult };