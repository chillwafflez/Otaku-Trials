import { RxCross2  } from "react-icons/rx";


function AboutAnidleModal(props: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop*/}
      <div className="absolute inset-0 bg-black/50"
           onClick={props.onClose}
      />

      {/* dialog box (higher z-index so it's clickable) */}
      <div className="relative z-10 lg:max-w-md mx-4 bg-customBackground border">
        <button onClick={props.onClose}
                className="absolute right-2 top-2 rounded-md p-1 text-white hover:text-bar1">
          <RxCross2 className="h-6 w-6" />
        </button>

        <div className="px-6 py-8">
          <h2 className="mb-8 text-lg font-semibold text-white text-center">
            Anidle
          </h2>
          <p className="text-white mb-2">
            Guess the anime by using clues based on your previous guesses! After each guess, certain attributes are revealed. 
          </p>
          <p className="text-white mb-4">
            If it's <span className="text-green-500">green</span>, that means
            it was a matching attribute between that guess and the mystery anime. If it's <span className="text-red-500">red</span> that means there was no match for those attributes. 
            The <span className="text-blue-300">arrows</span> indicate whether the mystery anime's attribute is higher or lower than your guess'.
          </p>

          <p className="text-white mb-4">
            Each anime and their corresponding data is fetched from the official
            <a href="https://docs.anilist.co/" target="_blank" className="text-bar1"> AniList API</a>, 
            and is refreshed daily.
          </p>

          <div className="w-full border py-3">
            <h2 className="text-bar1 text-center mb-3">Indicators</h2>
            <div className="flex w-full justify-center text-center gap-x-6 ">
              <div className="flex flex-col text-white justify-center text-center">
                <span>🟩</span>
                <span>Match</span>
              </div>

              <div className="flex flex-col text-white justify-center text-center">
                <span>🟥</span>
                <span>No Match</span>
              </div>

              <div className="flex flex-col text-white justify-center text-center">
                <span>⬆️</span>
                <span>Higher</span>
              </div>

              <div className="flex flex-col text-white justify-center text-center">
                <span>⬇️</span>
                <span>Lower</span>
              </div>

            </div>
          </div>
        </div>


      </div>
      
    </div>
  );
}

export { AboutAnidleModal };