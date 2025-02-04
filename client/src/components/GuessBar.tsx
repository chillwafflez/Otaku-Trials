
function GuessBar(props: { guess: string, order: number, correct: boolean }) {

	interface Dictionary {
	[key: number]: string;
	}
	
	let colors: Dictionary = {
		1: "bg-bar1",
		2: "bg-bar2",
		3: "bg-bar3",
		4: "bg-bar4",
		5: "bg-bar5",
		6: "bg-bar6"
	};

	return (
		<div className={`border rounded-md py-4 px-3 text-white ${colors[props.order]}`}>
			{props.guess}
		</div>
	)
}

export { GuessBar };