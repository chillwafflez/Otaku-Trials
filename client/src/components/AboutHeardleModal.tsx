import { RxCross2  } from "react-icons/rx";


function AboutHeardleModal(props: { onClose: () => void }) {
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
            Anime Heardle
          </h2>
          <p className="text-white mb-4">
            Guess the anime opening in 6 tries. Each skip/guess reveals a longer clip.
            Type to search, pick a result, and hit Enter. Good luck!
          </p>

          <p className="text-white">
            Each Heardle song is randomly selected from a pool of openings from
            <a href="https://animethemes.moe/" target="_blank" className="text-bar1"> AnimeThemes.moe</a>, 
            and is refreshed daily, with the pool refreshed at the end of each month
          </p>
        </div>
      </div>
      
    </div>
  );
}

export { AboutHeardleModal };