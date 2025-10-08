type ClueKey = 'clue1' | 'clue2' | 'clue3';

function ClueButton({guesses, keyName, label, Icon, threshold, unlocked, used, isOpen, onClick }: {
    guesses: number;
    keyName: ClueKey;
    label: string;
    Icon: React.ComponentType<any>;
    threshold: number;
    unlocked: Record<ClueKey, boolean>;
    used: Record<ClueKey, boolean>;
    isOpen: boolean;
    onClick: (key: ClueKey) => void;
  }) {

  const isUnlocked = unlocked[keyName];
  const isUsed = used[keyName];
  const triesLeft = Math.max(threshold - guesses, 0);

  const text = isUnlocked ? (isUsed ? `View ${label}` : `Use ${label}?`) : `${label} unlocks in ${triesLeft} ${triesLeft === 1 ? "try" : "tries"}`;
  
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => isUnlocked && onClick(keyName)}
        disabled={!isUnlocked}
        aria-disabled={!isUnlocked}
        className={`flex flex-col items-center gap-1 text-center 
                    ${isOpen ? "text-bar1" : isUnlocked ? "text-white hover:text-bar1" : "text-gray-500"}
                    ${!isUnlocked ? "cursor-not-allowed" : "cursor-pointer"}`}>
        <Icon className="w-12 h-12" />
        <div className="text-xs leading-snug">
          {text}
        </div>
      </button>
    </div>    
  );
}

export { ClueButton };