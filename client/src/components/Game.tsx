

function Game(props: {game: string, logo: string, bgColor: string}) {

  return (
    <div className="flex flex-col h-64 border rounded transform hover:scale-105">
      <div className={`flex-[3] ${props.bgColor} flex items-center justify-center rounded-t`}>
        <img src={props.logo} className="w-20" />
      </div>
      <div className="flex-[1] flex items-center justify-center bg-neutral-800 rounded-b">
        <span className="text-white text-lg md:text-2xl lg:text-3xl">
          {props.game}
        </span>
      </div>
    </div>
  );
}

export { Game };