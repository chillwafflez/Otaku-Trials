import { useState } from "react";

function OpeningVideo({videoUrl, audioUrl,}: {videoUrl?: string | null; audioUrl?: string | null;}) {
  const [videoFailed, setVideoFailed] = useState(false);

  const hasVideo = videoUrl && videoUrl.trim().length > 0 && !videoFailed;
  const hasAudio = audioUrl && audioUrl.trim().length > 0;

  if (hasVideo) {
    return (
      <video
        src={videoUrl!}
        controls
        autoPlay={true}
        loop
        className="mt-3 mb-5 h-auto mx-auto rounded"
        onError={() => setVideoFailed(true)}
      />
    );
  }

  if (hasAudio) {
    return (
      <audio
        src={audioUrl!}
        controls
        autoPlay={true}
        className="mt-3 mb-5 w-full"
      >
        Your browser does not support the audio element.
      </audio>
    );
  }

  // no video url or audio url or both failed to load
  return (
    <div className="mt-3 mb-5 h-48 w-full flex items-center justify-center bg-customBackground rounded-lg text-white">
      No Video Available
    </div>
  );
}

export { OpeningVideo };
