export type Plan = "Free" | "Premium" | "Family";

export interface User {
  id: string;
  name: string;
  plan: Plan;
  favorites: string[];
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  mood: string;
  duration: string;
  audioFile: string;
  mimeType: string;
  playCount: number;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  theme: string;
  songs: string[];
}

export interface ActivityEvent {
  id: string;
  type: "song_played" | "favorite_added" | "favorite_removed" | "playlist_updated";
  songId?: string;
  playlistId?: string;
  playedAt?: string;
  occurredAt?: string;
}

export interface Store {
  user: User;
  songs: Song[];
  playlists: Playlist[];
  activity: ActivityEvent[];
}
