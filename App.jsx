
import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./services/firebase";

import { MusicProvider } from "./context/MusicContext";
import { useMusic } from "./context/MusicContext";
import MusicPlayer from "./components/MusicPlayer";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MyLibrary from "./pages/MyLibrary";
import Favorites from "./pages/Favorites";
import Playlists from "./pages/Playlists";
import Settings from "./pages/Settings";

// Loading Screen
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-dark-main flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>

        <p className="text-gray-400 text-sm">
          Loading Music Library...
        </p>
      </div>
    </div>
  );
}

function ProtectedLayout() {
  const {
    currentSong,
    isPlaying,
    queue,
    currentIndex,
    volume,
    progress,
    duration,
    repeatMode,
    shuffleMode,
    playbackError,
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
    setShuffleMode,
    playQueueItem,
    reorderQueue,
    removeFromQueue,
    clearQueue,
  } = useMusic();

  return (
    <>
      <Outlet />
      <MusicPlayer
        currentMusic={currentSong}
        isPlaying={isPlaying}
        queue={queue}
        currentIndex={currentIndex}
        volume={volume}
        progress={progress}
        duration={duration}
        repeatMode={repeatMode}
        shuffleMode={shuffleMode}
        playbackError={playbackError}
        onPlayPause={togglePlayPause}
        onNext={playNext}
        onPrevious={playPrevious}
        onEnded={handleTrackEnded}
        onVolumeChange={setVolume}
        onSeek={setProgress}
        onDurationChange={setDuration}
        onError={setPlaybackError}
        onPlaybackStateChange={syncPlaybackState}
        onRepeatModeChange={cycleRepeatMode}
        onShuffleChange={setShuffleMode}
        onPlayQueueItem={playQueueItem}
        onReorderQueue={reorderQueue}
        onRemoveFromQueue={removeFromQueue}
        onClearQueue={clearQueue}
      />
    </>
  );
}

// Protected Route
function ProtectedRoute() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <MusicProvider>
      <ProtectedLayout />
    </MusicProvider>
  );
}

// Main App
function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/library" element={<MyLibrary />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/playlists" element={<Playlists />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Unknown Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
