

function Game(props: {game: string, logo: string, bgColor: string}) {

  return (
    <div className="flex flex-col h-64 border rounded">
      <div className={`flex-[3] ${props.bgColor} flex items-center justify-center rounded-t`}>
        <img src={props.logo} className="w-20" />
      </div>
      <div className="flex-[1] flex items-center justify-center bg-neutral-800 rounded-b">
        <span className="text-white text-lg md:text-2xl lg:text-3xl">
          {props.game}
        </span>
      </div>
    </div>


    // <div className={`flex flex-col items-center justify-center border rounded-md bg-neutral-800`}>
    //   <div className={`${props.bgColor} p-14 md:p-16 lg:p-20`}>
    //     <img src={props.logo} className="w-16 border-pink-700 border"></img>
    //   </div>
    //   <div className="flex flex-col justify-center items-center p-2">
    //     <a className="px-3 py-2 border rounded-md text-white text-xl md:text-2xl lg:text-3xl">
    //       {props.game}
    //     </a>
    //   </div>
    // </div>
  );
}

export { Game };