
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
  writeBatch,
  
} from "firebase/firestore";

import { db } from "./firebase";

// ===============================
// MUSIC FUNCTIONS
// ===============================

// Add Music
export const addMusicToLibrary = async (uid, musicData) => {
  try {
    const musicRef = collection(db, "users", uid, "music");

    const docRef = await addDoc(musicRef, {
      ...musicData,
      isFavorite: false,
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get All Music
export const getUserMusic = async (uid) => {
  try {
    const musicRef = collection(db, "users", uid, "music");
    const musicQuery = query(musicRef, orderBy("createdAt", "desc"));

    const snapshot = await getDocs(musicQuery);

    return snapshot.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    }));
  } catch (error) {
    throw new Error(error.message);
  }
};

// Real-time Music Listener
export const subscribeToUserMusic = (uid, callback) => {
  const musicRef = collection(db, "users", uid, "music");
  const musicQuery = query(musicRef, orderBy("createdAt", "desc"));

  return onSnapshot(
    musicQuery,
    (snapshot) => {
      const musicList = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      callback(musicList);
    },
    (error) => {
      console.error("Music Listener Error:", error);
    }
  );
};

// Delete Music
export const deleteMusicFromLibrary = async (uid, musicId) => {
  try {
    const musicRef = doc(db, "users", uid, "music", musicId);
    await deleteDoc(musicRef);
  } catch (error) {
    throw new Error(error.message);
  }
};

// Toggle Favorite
export const toggleFavoriteInLibrary = async (
  uid,
  musicId,
  currentStatus
) => {
  try {
    const musicRef = doc(db, "users", uid, "music", musicId);

    await updateDoc(musicRef, {
      isFavorite: !currentStatus,
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

export const saveMusicOrder = async (uid, musicIds) => {
  try {
    const batch = writeBatch(db);

    musicIds.forEach((musicId, index) => {
      batch.update(doc(db, "users", uid, "music", musicId), {
        sortOrder: index,
      });
    });

    await batch.commit();
  } catch (error) {
    throw new Error(error.message);
  }
};

// ===============================
// PLAYLIST FUNCTIONS
// ===============================

// Create Playlist
// Save selected songs to a playlist
export const savePlaylistSongs = async (uid, playlistId, songs) => {
  try {
    const playlistRef = doc(db, "users", uid, "playlists", playlistId);

    await updateDoc(playlistRef, {
      songs: songs,
    });
  } catch (error) {
    throw new Error(error.message);
  }
};
export const createPlaylistInLibrary = async (uid, playlistName) => {
  try {
    const playlistRef = collection(db, "users", uid, "playlists");

    const docRef = await addDoc(playlistRef, {
      name: playlistName,
      songs: [],
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get Playlists
export const getUserPlaylists = async (uid) => {
  try {
    const playlistRef = collection(db, "users", uid, "playlists");
    const playlistQuery = query(
      playlistRef,
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(playlistQuery);

    return snapshot.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    }));
  } catch (error) {
    throw new Error(error.message);
  }
};

// Real-time Playlist Listener
export const subscribeToUserPlaylists = (uid, callback) => {
  const playlistRef = collection(db, "users", uid, "playlists");
  const playlistQuery = query(
    playlistRef,
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    playlistQuery,
    (snapshot) => {
      const playlistList = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      callback(playlistList);
    },
    (error) => {
      console.error("Playlist Listener Error:", error);
    }
  );
};

// Delete Playlist
export const deletePlaylistFromLibrary = async (uid, playlistId) => {
  try {
    const playlistRef = doc(
      db,
      "users",
      uid,
      "playlists",
      playlistId
    );

    await deleteDoc(playlistRef);
  } catch (error) {
    throw new Error(error.message);
  }
  
};
