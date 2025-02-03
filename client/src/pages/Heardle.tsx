import { GuessBar } from "../components/GuessBar";
import { useEffect, useState } from "react";

function Heardle() {

  let answer: string = "Attack on Titan"
  const [guess, setGuess] = useState("");
  const [guessCount, setGuessCount] = useState(0);

  const handleGuess = () => {
    if (guess != answer) {
      setGuess(guess + 1);
    }
  }


	return (
		<div className="flex flex-col justify-center items-center">

      {/* guess bars */}
			<div className="flex flex-col space-y-5 w-1/3 mt-16">
          <GuessBar guess="skibidi" order={1} correct={false}/>
          <GuessBar guess="lebron" order={2} correct={false}/>
          <GuessBar guess="curry" order={3} correct={false}/>
          <GuessBar guess="kd" order={4} correct={false}/>
          <GuessBar guess="mama" order={5}  correct={false}/>
          <GuessBar guess="dada"  order={6}  correct={false}/>
			</div>


      {/* bottom half */}
      <div className="flex flex-col items-center w-full h-20 border mt-28">
        <div className="w-1/3 border">
          penis
        </div>
      
      </div>
      
		</div>
	)

}


export { Heardle };