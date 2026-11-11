
import { extractYouTubeVideoId } from "../utils/youtubeHelper";
const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

// Get YouTube Video Details
export const getYouTubeVideoDetails = async (url) => {
  try {
    const videoId = extractYouTubeVideoId(url);

    if (!videoId) {
      throw new Error("Invalid YouTube URL.");
    }

    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

    if (!apiKey) {
      throw new Error("YouTube API Key is missing in .env");
    }

    const apiUrl = new URL(
      "https://www.googleapis.com/youtube/v3/videos"
    );

    apiUrl.searchParams.set("part", "snippet");
    apiUrl.searchParams.set("id", videoId);
    apiUrl.searchParams.set("key", apiKey);

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error("Failed to connect to YouTube API.");
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      throw new Error("YouTube video not found.");
    }

    const video = data.items[0];
    const snippet = video.snippet;

    return {
      videoId: videoId,
      title: snippet.title,
      artist: snippet.channelTitle,
      channelTitle: snippet.channelTitle,
      thumbnail:
        snippet.thumbnails.maxres?.url ||
        snippet.thumbnails.high?.url ||
        snippet.thumbnails.medium?.url ||
        snippet.thumbnails.default?.url,
      url: `https://www.youtube.com/watch?v=${videoId}`,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};
