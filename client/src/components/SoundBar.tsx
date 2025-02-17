import "../styles/SoundBar.css";

function SoundBar(props: {progress: number, duration: number, guessCount: number}) {

	return (
		<div className="flex relative w-1/3 h-5 border-b border-l border-r">
			<div className="flex w-full h-full">
				<div id="first_segment" className="border-r bg-zinc-600"></div>
				<div id="second_segment" className={`${(props.guessCount > 0) ? 'bg-zinc-600' : 'bg-zinc-800'} border-r`}></div>
				<div id="third_segment" className={`${(props.guessCount > 1) ? 'bg-zinc-600' : 'bg-zinc-800'} border-r`}></div>
				<div id="fourth_segment" className={`${(props.guessCount > 2) ? 'bg-zinc-600' : 'bg-zinc-800'} border-r`}></div>
				<div id="fifth_segment" className={`${(props.guessCount > 3) ? 'bg-zinc-600' : 'bg-zinc-800'} border-r`}></div>
				<div id="sixth_segment" className={`${(props.guessCount > 4) ? 'bg-zinc-600' : 'bg-zinc-800'} border-r`}></div>
			</div>

      <div
        className="absolute h-full bg-guessbox transition-all"
        style={{
			width: `${props.progress}%`,
			// transition:`width ${props.progress / 6.25}s linear`,
			transition:`width 0.05s linear`,
		  }}
      ></div>
		</div>
	)
}

export { SoundBar };