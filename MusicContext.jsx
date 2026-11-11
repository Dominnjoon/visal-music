import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";
import {
  addMusicToLibrary,
  createPlaylistInLibrary,
  deleteMusicFromLibrary,
  deletePlaylistFromLibrary,
  saveMusicOrder,
  savePlaylistSongs,
  subscribeToUserMusic,
  subscribeToUserPlaylists,
  toggleFavoriteInLibrary,
} from "../services/musicService";
import { getYouTubeVideoDetails } from "../services/youtubeService";
import { extractYouTubeVideoId } from "../utils/youtubeHelper";

const MusicContext = createContext(null);

const getCreatedTime = (song) => {
	const createdAt = song.createdAt;
	if (typeof createdAt?.toMillis === "function") return createdAt.toMillis();
	if (createdAt instanceof Date) return createdAt.getTime();
	return typeof createdAt === "string" ? Date.parse(createdAt) || 0 : 0;
};

const sortLibrary = (songs) => [...songs].sort((a, b) => {
	const aHasOrder = Number.isFinite(a.sortOrder);
	const bHasOrder = Number.isFinite(b.sortOrder);

	if (aHasOrder && bHasOrder) return a.sortOrder - b.sortOrder;
	if (aHasOrder !== bHasOrder) return aHasOrder ? 1 : -1;
	return getCreatedTime(b) - getCreatedTime(a);
});

const getVideoId = (song) => {
	if (/^[A-Za-z0-9_-]{11}$/.test(song?.videoId || "")) return song.videoId;
	return extractYouTubeVideoId(song?.url || "");
};

export function MusicProvider({ children }) {
	const [music, setMusic] = useState([]);
	const [playlists, setPlaylists] = useState([]);
	const [currentSong, setCurrentSong] = useState(null);
	const [queue, setQueue] = useState([]);
	const [currentIndex, setCurrentIndex] = useState(-1);
	const [isPlaying, setIsPlaying] = useState(false);
	const [volume, setVolume] = useState(80);
	const [progress, setProgress] = useState(0);
	const [duration, setDuration] = useState(0);
	const [repeatMode, setRepeatMode] = useState("off");
	const [shuffleMode, setShuffleMode] = useState(false);
	const [queueSource, setQueueSource] = useState("library");
	const [playbackError, setPlaybackError] = useState("");
	const [libraryOrderError, setLibraryOrderError] = useState("");

	useEffect(() => {
		let stopMusicSubscription = () => {};
		let stopPlaylistSubscription = () => {};

		const stopAuthSubscription = onAuthStateChanged(auth, (user) => {
			stopMusicSubscription();
			stopPlaylistSubscription();

			if (!user) {
				setMusic([]);
				setPlaylists([]);
				setCurrentSong(null);
				setQueue([]);
				setCurrentIndex(-1);
				setIsPlaying(false);
				return;
			}

			stopMusicSubscription = subscribeToUserMusic(user.uid, (songs) => {
				setMusic(sortLibrary(songs));
			});
			stopPlaylistSubscription = subscribeToUserPlaylists(user.uid, setPlaylists);
		});

		return () => {
			stopAuthSubscription();
			stopMusicSubscription();
			stopPlaylistSubscription();
		};
	}, []);

	const addMusic = async (url) => {
		const user = auth.currentUser;
		if (!user) throw new Error("Please sign in to add music.");

		const musicDetails = await getYouTubeVideoDetails(url);
		await addMusicToLibrary(user.uid, musicDetails);
	};

	const deleteMusic = async (song) => {
		const user = auth.currentUser;
		if (!user) throw new Error("Please sign in to delete music.");
		await deleteMusicFromLibrary(user.uid, song.id);

		const nextQueue = queue.filter((item) => item.id !== song.id);
		setQueue(nextQueue);
		setCurrentIndex(nextQueue.findIndex((item) => item.id === currentSong?.id));
		if (currentSong?.id === song.id) {
			setCurrentSong(null);
			setIsPlaying(false);
		}
	};

	const toggleFavorite = async (song) => {
		const user = auth.currentUser;
		if (!user) throw new Error("Please sign in to update favorites.");
		await toggleFavoriteInLibrary(user.uid, song.id, song.isFavorite);
	};

	const createPlaylist = async (name) => {
		const user = auth.currentUser;
		if (!user) throw new Error("Please sign in to create a playlist.");
		return createPlaylistInLibrary(user.uid, name);
	};

	const deletePlaylist = async (playlistId) => {
		const user = auth.currentUser;
		if (!user) throw new Error("Please sign in to delete a playlist.");
		await deletePlaylistFromLibrary(user.uid, playlistId);
		
	};
	const updatePlaylistSongs = async (playlistId, songs) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please sign in to update playlist.");
  }

  await savePlaylistSongs(user.uid, playlistId, songs);
};
	

	const playMusic = (song, songs = music, source = "library") => {
		if (!song) return;

		const nextQueue = [...songs];
		let index = nextQueue.findIndex((item) => item.id === song.id);
		if (index < 0) {
			nextQueue.push(song);
			index = nextQueue.length - 1;
		}
		if (shuffleMode && nextQueue.length > 1) {
			const rest = nextQueue.filter((item) => item.id !== song.id);
			for (let position = rest.length - 1; position > 0; position -= 1) {
				const randomIndex = Math.floor(Math.random() * (position + 1));
				[rest[position], rest[randomIndex]] = [rest[randomIndex], rest[position]];
			}
			nextQueue.splice(0, nextQueue.length, song, ...rest);
			index = 0;
		}

		setQueue(nextQueue);
		setCurrentIndex(index);
		setCurrentSong(nextQueue[index]);
		setQueueSource(source);
		setProgress(0);
		setDuration(0);
		setPlaybackError(getVideoId(song) ? "" : "This song does not have a valid YouTube video ID.");
		setIsPlaying(Boolean(getVideoId(song)));
	};

	const playQueueItem = (index) => {
		const song = queue[index];
		if (!song) return;
		setCurrentIndex(index);
		setCurrentSong(song);
		setProgress(0);
		setDuration(0);
		setPlaybackError(getVideoId(song) ? "" : "This song does not have a valid YouTube video ID.");
		setIsPlaying(Boolean(getVideoId(song)));
	};

	const togglePlayPause = () => {
		if (!currentSong) return;
		if (!getVideoId(currentSong)) {
			setPlaybackError("This song does not have a valid YouTube video ID.");
			setIsPlaying(false);
			return;
		}
		setPlaybackError("");
		setIsPlaying((playing) => !playing);
	};

	const syncPlaybackState = (playing) => {
		setIsPlaying(playing);
	};

	const playNext = () => {
		if (!queue.length || currentIndex < 0) return;
		if (currentIndex === queue.length - 1 && repeatMode === "off") {
			setIsPlaying(false);
			setProgress(0);
			return;
		}

		playQueueItem((currentIndex + 1) % queue.length);
	};

	const playPrevious = () => {
		if (!queue.length || currentIndex < 0) return;
		playQueueItem((currentIndex - 1 + queue.length) % queue.length);
	};

	const handleTrackEnded = () => {
		if (repeatMode === "one" && currentSong) {
			setProgress(0);
			setIsPlaying(true);
			return;
		}
		playNext();
	};

	const cycleRepeatMode = () => {
		setRepeatMode((mode) => (
			mode === "off" ? "all" : mode === "all" ? "one" : "off"
		));
	};

	const toggleShuffleMode = (enabled) => {
		if (enabled && currentSong && queue.length > 1) {
			const rest = queue.filter((song) => song.id !== currentSong.id);
			for (let position = rest.length - 1; position > 0; position -= 1) {
				const randomIndex = Math.floor(Math.random() * (position + 1));
				[rest[position], rest[randomIndex]] = [rest[randomIndex], rest[position]];
			}
			setQueue([currentSong, ...rest]);
			setCurrentIndex(0);
		}
		setShuffleMode(enabled);
	};

	const reorderQueue = (fromIndex, toIndex) => {
		if (
			fromIndex < 0 || toIndex < 0 ||
			fromIndex >= queue.length || toIndex >= queue.length ||
			fromIndex === toIndex
		) return;

		const nextQueue = [...queue];
		const [movedSong] = nextQueue.splice(fromIndex, 1);
		nextQueue.splice(toIndex, 0, movedSong);
		setQueue(nextQueue);
		setCurrentIndex(nextQueue.findIndex((song) => song.id === currentSong?.id));
	};

	const removeFromQueue = (songId) => {
		const nextQueue = queue.filter((song) => song.id !== songId);
		setQueue(nextQueue);
		if (currentSong?.id === songId) {
			setCurrentSong(null);
			setCurrentIndex(-1);
			setIsPlaying(false);
			setProgress(0);
			setDuration(0);
		} else {
			setCurrentIndex(nextQueue.findIndex((song) => song.id === currentSong?.id));
		}
	};

	const clearQueue = () => {
		setQueue([]);
		setCurrentSong(null);
		setCurrentIndex(-1);
		setIsPlaying(false);
		setProgress(0);
		setDuration(0);
		setPlaybackError("");
	};

	const reorderLibrary = async (orderedSongs) => {
		const user = auth.currentUser;
		if (!user) throw new Error("Please sign in to save your library order.");

		const sortedSongs = [...orderedSongs];
		setMusic(sortedSongs);
		if (queueSource === "library") {
			setQueue(sortedSongs);
			setCurrentIndex(sortedSongs.findIndex((song) => song.id === currentSong?.id));
		}
		setLibraryOrderError("");

		try {
			await saveMusicOrder(user.uid, sortedSongs.map((song) => song.id));
		} catch (error) {
			setLibraryOrderError("Your new order is shown, but could not be saved. Please try again.");
			throw error;
		}
	};

	const favorites = music.filter((song) => song.isFavorite);

	return (
		<MusicContext.Provider
			value={{
				music,
				playlists,
				favorites,
				currentSong,
				currentMusic: currentSong,
				queue,
				currentIndex,
				isPlaying,
				volume,
				progress,
				duration,
				repeatMode,
				shuffleMode,
				playbackError,
				libraryOrderError,
				addMusic,
				deleteMusic,
				toggleFavorite,
				createPlaylist,
				deletePlaylist,
				playMusic,
				playQueueItem,
				togglePlayPause,
				playNext,
				playPrevious,
				handleTrackEnded,
				setVolume,
				setProgress,
				setDuration,
				setPlaybackError,
				syncPlaybackState,
				cycleRepeatMode,
				setShuffleMode: toggleShuffleMode,
				reorderQueue,
				removeFromQueue,
				clearQueue,
				reorderLibrary,
				updatePlaylistSongs,
			}}
		>
			{children}
		</MusicContext.Provider>
	);
}

export function useMusic() {
	const context = useContext(MusicContext);
	if (!context) throw new Error("useMusic must be used within a MusicProvider.");
	return context;
}
