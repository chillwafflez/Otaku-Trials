import { useEffect, useState } from "react";
import "../index.css"

function MusicBar(props: {play: boolean}) {

    const [bars, setBars] = useState<number[]>([]);
    const [barCount, setBarCount] = useState<number>(getBarCount());

    const pinkShades = ["#F955A0", "#F782B4", "#F9A6C5", "#FFC8EE", "#FBCADD","#FCE2EB",
  ];

  function getBarCount() {
    if (window.innerWidth < 640) return 30;     // mobile
    if (window.innerWidth < 1024) return 40;    // tablet
    return 59;                                  // desktop
  }

    // set the number of bars based on screen size
    useEffect(() => {
      const handleResize = () => {
        const newCount = getBarCount();
        setBarCount(newCount);
        setBars(Array(newCount).fill(0));
      };

      window.addEventListener("resize", handleResize);
      handleResize(); // initialize

      return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {

      if (props.play) {
        const interval = setInterval(() => {
          setBars(bars.map(() => Math.random() * 100));
        }, 300);
    
        return () => clearInterval(interval);
      } else {
        setBars(Array(barCount).fill(0));
      }
      }, [props.play]);

      return (
        <>
          {props.play ? (
          <div className="w-4/5 lg:w-1/3 h-[4.5rem] lg:h-20 mb-2 flex gap-1 items-end justify-center">
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
            <div className="flex w-4/5 lg:w-1/3 h-[4.5rem] lg:h-20 mb-2 gap-1 items-end"></div>
          )}
        </>
      );
}

export { MusicBar };