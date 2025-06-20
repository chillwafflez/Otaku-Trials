// import { RxCross1 } from "react-icons/rx";

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

	let textColors: Dictionary = {
		0: "text-bar1Text",
		1: "text-bar2Text",
		2: "text-bar3Text",
		3: "text-bar4Text",
		4: "text-bar5Text",
		5: "text-bar6Text"
	};

	return (
		<div className={`border rounded-md py-[0.9rem] lg:py-4 px-3 ${textColors[props.order]} ${colors[props.order]}`}>
			{props.guess}
		</div>

		// <div className={`flex space-x-3 items-center border rounded-md py-[0.3rem] lg:py-2 px-3 ${textColors[props.order]} ${colors[props.order]}`}>
		// 	<RxCross1 className={`w-7 h-7 ${colors[props.order]}`}/>
		// 	<span className="my-2">{props.guess}</span>
		// </div>

	)
}

export { GuessBar };