import { useEffect, useState } from "react";
import "../index.css"

function MusicBar(props: {play: boolean}) {

    const [bars, setBars] = useState<number[]>(Array(59).fill(0))
    const pinkShades = ["#F955A0", "#F782B4", "#F9A6C5", "#FFC8EE", "#FBCADD","#FCE2EB",
  ];
    
    useEffect(() => {

      if (props.play) {
        const interval = setInterval(() => {
          setBars(bars.map(() => Math.random() * 100));
        }, 300);
    
        return () => clearInterval(interval);
      } else {
        setBars(Array(59).fill(0));
      }
      }, [props.play]);

      return (
        <>
          {props.play ? (
          <div className="w-1/3 h-20 mb-2 flex gap-1 items-end justify-center">
            {bars.map((height, index) => {
              const randomPink = pinkShades[Math.floor(Math.random() * pinkShades.length)];
              return (
                <div
                  key={index}
                  className="w-2 transition-all duration-500 ease-in-out"
                  style={{ height: `${height}%`, backgroundColor: randomPink }}
                ></div>
              );
            })}
          </div>
          ) : (
            <div className="w-1/3 h-20 mb-2 flex gap-1 items-end"></div>
          )}
        </>
      );
}

export { MusicBar };