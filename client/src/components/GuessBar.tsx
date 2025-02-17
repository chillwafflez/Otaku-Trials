
function GuessBar(props: { guess: string, order: number, correct: boolean }) {

	interface Dictionary {
	[key: number]: string;
	}
	
	let colors: Dictionary = {
		0: "bg-bar1",
		1: "bg-bar2",
		2: "bg-bar3",
		3: "bg-bar4",
		4: "bg-bar5",
		5: "bg-bar6"
	};

	return (
		<div className={`border rounded-md py-4 px-3 text-white ${colors[props.order]}`}>
			{props.guess}
		</div>
	)
}

export { GuessBar };