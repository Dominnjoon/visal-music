import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  GripVertical,
  ListMusic,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  X,
} from "lucide-react";
import { extractYouTubeVideoId } from "../utils/youtubeHelper";

let youtubeApiPromise;

function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise((resolve, reject) => {
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      if (window.YT?.Player) resolve(window.YT);
      else reject(new Error("YouTube player could not be initialized."));
    };

    let script = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (!script) {
      script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.onerror = () => reject(new Error("Unable to load the YouTube player."));
      document.head.appendChild(script);
    }
  }).catch((error) => {
    youtubeApiPromise = null;
    throw error;
  });

  return youtubeApiPromise;
}

function getVideoId(song) {
  if (/^[A-Za-z0-9_-]{11}$/.test(song?.videoId || "")) return song.videoId;
  return extractYouTubeVideoId(song?.url || "");
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

function getYouTubeError(code) {
  const messages = {
    2: "YouTube rejected this video ID. Check that the saved link is valid.",
    5: "This video cannot be played in the embedded player.",
    100: "This video was removed or is private.",
    101: "The video owner does not allow playback in embedded players.",
    150: "The video owner does not allow playback in embedded players.",
    153: "YouTube could not verify this app's playback request. Try opening the video on YouTube.",
  };
  return messages[code] || "YouTube could not play this video. Try opening it on YouTube.";
}

export default function MusicPlayer({
  currentMusic = null,
  isPlaying = false,
  queue = [],
  currentIndex = -1,
  volume = 80,
  progress = 0,
  duration = 0,
  repeatMode = "off",
  shuffleMode = false,
  playbackError = "",
  onPlayPause = () => {},
  onNext = () => {},
  onPrevious = () => {},
  onEnded = () => {},
  onVolumeChange = () => {},
  onSeek = () => {},
  onDurationChange = () => {},
  onError = () => {},
  onPlaybackStateChange = () => {},
  onRepeatModeChange = () => {},
  onShuffleChange = () => {},
  onPlayQueueItem = () => {},
  onReorderQueue = () => {},
  onRemoveFromQueue = () => {},
  onClearQueue = () => {},
}) {
  const hostRef = useRef(null);
  const playerRef = useRef(null);
  const callbacksRef = useRef({});
  const loadedVideoRef = useRef("");
  const [playerReady, setPlayerReady] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [draggedQueueIndex, setDraggedQueueIndex] = useState(null);

  callbacksRef.current = {
    onError,
    onPlaybackStateChange,
    onEnded,
    onDurationChange,
    onVolumeChange,
    repeatMode,
    volume,
  };

  useEffect(() => {
    let disposed = false;
    loadYouTubeApi()
      .then((YT) => {
        if (disposed || !hostRef.current) return;

        const player = new YT.Player(hostRef.current, {
          width: "200",
          height: "200",
          playerVars: {
            autoplay: 0,
            controls: 0,
            enablejsapi: 1,
            playsinline: 1,
            rel: 0,
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              if (disposed) {
                event.target.destroy();
                return;
              }
              playerRef.current = event.target;
              setPlayerReady(true);
              event.target.setVolume(callbacksRef.current.volume);
              const iframe = event.target.getIframe();
              iframe.title = "YouTube audio player";
              iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
              iframe.setAttribute("allow", "autoplay; encrypted-media; picture-in-picture");
            },
            onStateChange: (event) => {
              if (event.data === YT.PlayerState.PLAYING) {
                callbacksRef.current.onPlaybackStateChange(true);
                callbacksRef.current.onError("");
              }
              if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.CUED) {
                callbacksRef.current.onPlaybackStateChange(false);
              }
              if (event.data === YT.PlayerState.ENDED) {
                if (callbacksRef.current.repeatMode === "one") {
                  event.target.seekTo(0, true);
                  event.target.playVideo();
                } else {
                  callbacksRef.current.onPlaybackStateChange(false);
                  callbacksRef.current.onEnded();
                }
              }
            },
            onError: (event) => {
              callbacksRef.current.onError(getYouTubeError(event.data));
            },
          },
        });

        playerRef.current = player;
      })
      .catch((error) => {
        if (!disposed) onError(error.message || "Unable to initialize the YouTube player.");
      });

    return () => {
      disposed = true;
      playerRef.current?.destroy();
      playerRef.current = null;
      loadedVideoRef.current = "";
      setPlayerReady(false);
    };
  }, []);

  const videoId = getVideoId(currentMusic);

  useEffect(() => {
    const player = playerRef.current;
    if (!playerReady || !player) return;

    if (!currentMusic || !videoId) {
      if (loadedVideoRef.current) player.stopVideo();
      loadedVideoRef.current = "";
      return;
    }

    onError("");
    if (loadedVideoRef.current !== videoId) {
      loadedVideoRef.current = videoId;
      if (isPlaying) player.loadVideoById({ videoId });
      else player.cueVideoById({ videoId });
      return;
    }

    if (isPlaying) player.playVideo();
    else player.pauseVideo();
  }, [currentMusic?.id, videoId, isPlaying, playerReady]);

  useEffect(() => {
    if (playerReady && playerRef.current) {
      playerRef.current.setVolume(volume);
    }
  }, [volume, playerReady]);

  useEffect(() => {
    if (!playerReady || !currentMusic || !isPlaying) return undefined;
    const timer = window.setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      const currentTime = player.getCurrentTime();
      const videoDuration = player.getDuration();
      if (Number.isFinite(currentTime)) onSeek(currentTime);
      if (Number.isFinite(videoDuration) && videoDuration > 0) {
        onDurationChange(videoDuration);
      }
    }, 500);
    return () => window.clearInterval(timer);
  }, [playerReady, currentMusic?.id, isPlaying, onSeek, onDurationChange]);

  const handleSeek = (event) => {
    const nextProgress = Number(event.target.value);
    onSeek(nextProgress);
    if (playerReady && playerRef.current && duration > 0) {
      playerRef.current.seekTo(nextProgress, true);
    }
  };

  const handleQueueDrop = (event, targetIndex) => {
    event.preventDefault();
    const fromIndex = Number(event.dataTransfer.getData("text/plain"));
    if (Number.isInteger(fromIndex)) {
      const destinationIndex = targetIndex === queue.length
        ? queue.length - 1
        : fromIndex < targetIndex ? targetIndex - 1 : targetIndex;
      onReorderQueue(fromIndex, destinationIndex);
    }
    setDraggedQueueIndex(null);
  };

  const handleQueuePlay = (index) => {
    onPlayQueueItem(index);
    setQueueOpen(false);
  };

  return (
    <>
      {playbackError && (
        <div className="player-error" role="alert">
          <AlertCircle size={16} />
          <span>{playbackError}</span>
          {currentMusic?.videoId && (
            <a href={`https://www.youtube.com/watch?v=${currentMusic.videoId}`} target="_blank" rel="noreferrer">
              Open on YouTube
            </a>
          )}
          <button onClick={() => onError("")} aria-label="Dismiss playback error"><X size={15} /></button>
        </div>
      )}

      {queueOpen && (
        <section className="queue-panel" aria-label="Playback queue">
          <div className="queue-panel-heading">
            <div>
              <span>UP NEXT</span>
              <h2>Queue <small>{queue.length}</small></h2>
            </div>
            <div className="queue-panel-actions">
              <button onClick={onClearQueue} disabled={!queue.length} className="queue-clear-button">Clear queue</button>
              <button onClick={() => setQueueOpen(false)} aria-label="Close queue" className="queue-close-button"><X size={18} /></button>
            </div>
          </div>
          <div className="queue-list">
            {queue.length === 0 ? (
              <p className="queue-empty">Your queue is empty. Play a song to get started.</p>
            ) : queue.map((song, index) => (
              <div
                key={`${song.id}-${index}`}
                className={`queue-item${index === currentIndex ? " is-current" : ""}${draggedQueueIndex === index ? " is-dragging" : ""}`}
                draggable
                onDragStart={(event) => {
                  setDraggedQueueIndex(index);
                  event.dataTransfer.setData("text/plain", String(index));
                  event.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleQueueDrop(event, index)}
                onDragEnd={() => setDraggedQueueIndex(null)}
              >
                <GripVertical size={16} className="queue-drag-handle" />
                <button onClick={() => handleQueuePlay(index)} className="queue-song-button">
                  <img src={song.thumbnail || "https://placehold.co/80x80/15151d/8b5cf6?text=Music"} alt="" />
                  <span><strong>{song.title || "Unknown Title"}</strong><small>{song.artist || "Unknown Artist"}</small></span>
                </button>
                {index === currentIndex && <span className="queue-now-playing">{isPlaying ? "PLAYING" : "PAUSED"}</span>}
                <button onClick={() => onRemoveFromQueue(song.id)} aria-label={`Remove ${song.title || "song"} from queue`} className="queue-remove-button"><X size={16} /></button>
              </div>
            ))}
            {queue.length > 0 && (
              <div
                className="queue-drop-end"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleQueueDrop(event, queue.length)}
              />
            )}
          </div>
        </section>
      )}

      <div className={`music-player${currentMusic ? "" : " music-player-empty"}`}>
        <div className="player-track">
          <div className="player-song">
            {currentMusic ? (
              <img
                src={currentMusic.thumbnail || "https://placehold.co/100x100/15151d/8b5cf6?text=Music"}
                alt={currentMusic.title || "Music"}
              />
            ) : (
              <div className="player-empty-mark"><Volume2 size={18} /></div>
            )}
            {currentMusic ? (
              <div className="player-song-copy">
                <p className="player-song-title">{currentMusic.title || "Unknown Title"}</p>
                <p className="player-song-artist">{currentMusic.artist || "Unknown Artist"}</p>
              </div>
            ) : (
              <p className="player-empty-text">Select a song to start listening</p>
            )}
          </div>

          <div className="player-center">
            <div className="player-controls">
              <button
                onClick={() => onShuffleChange(!shuffleMode)}
                aria-label={shuffleMode ? "Disable shuffle" : "Enable shuffle"}
                aria-pressed={shuffleMode}
                className={`player-mode-button${shuffleMode ? " is-active" : ""}`}
              >
                <Shuffle size={16} />
              </button>
              <button onClick={onPrevious} aria-label="Previous" className="player-skip">
                <SkipBack size={18} />
              </button>
              <button
                onClick={onPlayPause}
                aria-label={isPlaying ? "Pause" : "Play"}
                className="player-toggle"
                disabled={!currentMusic}
              >
                {isPlaying ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}
              </button>
              <button onClick={onNext} aria-label="Next" className="player-skip">
                <SkipForward size={18} />
              </button>
              <button
                onClick={onRepeatModeChange}
                aria-label={`Repeat ${repeatMode}`}
                aria-pressed={repeatMode !== "off"}
                className={`player-mode-button${repeatMode !== "off" ? " is-active" : ""}`}
              >
                {repeatMode === "one" ? <Repeat1 size={16} /> : <Repeat size={16} />}
              </button>
            </div>
            <div className="player-progress-row">
              <span>{formatTime(progress)}</span>
              <input
                type="range"
                min="0"
                max={duration || 1}
                step="0.1"
                value={Math.min(progress, duration || progress)}
                onChange={handleSeek}
                aria-label="Playback position"
                disabled={!duration}
                style={{ "--progress": `${duration ? (progress / duration) * 100 : 0}%` }}
              />
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="player-options">
            <Volume2 size={17} className="volume-icon" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(event) => onVolumeChange(Number(event.target.value))}
              aria-label="Volume"
              style={{ "--progress": `${volume}%` }}
            />
            {videoId && (
              <a
                href={`https://www.youtube.com/watch?v=${videoId}`}
                target="_blank"
                rel="noreferrer"
                aria-label="Open on YouTube"
                className="youtube-link"
              >
                <span>YouTube</span>
                <Play size={15} />
              </a>
            )}
            <button onClick={() => setQueueOpen((open) => !open)} aria-label="Toggle playback queue" aria-pressed={queueOpen} className={`queue-toggle${queueOpen ? " is-active" : ""}`}>
              <ListMusic size={19} />
              <span>{queue.length}</span>
            </button>
          </div>
        </div>

        <div ref={hostRef} className="youtube-player-host" aria-hidden="true" />
      </div>
    </>
  );
}
