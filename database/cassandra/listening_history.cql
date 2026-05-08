CREATE KEYSPACE IF NOT EXISTS merkeb_music
WITH replication = {
  'class': 'SimpleStrategy',
  'replication_factor': 1
};

USE merkeb_music;

CREATE TABLE IF NOT EXISTS listening_history_by_user (
  user_id text,
  played_at timestamp,
  event_id text,
  song_id text,
  artist text,
  album text,
  source text,
  PRIMARY KEY ((user_id), played_at, event_id)
) WITH CLUSTERING ORDER BY (played_at DESC);

CREATE TABLE IF NOT EXISTS song_play_events_by_song (
  song_id text,
  played_at timestamp,
  event_id text,
  user_id text,
  source text,
  PRIMARY KEY ((song_id), played_at, event_id)
) WITH CLUSTERING ORDER BY (played_at DESC);

CREATE TABLE IF NOT EXISTS recommendation_refresh_queue (
  bucket text,
  requested_at timestamp,
  song_id text,
  reason text,
  PRIMARY KEY ((bucket), requested_at, song_id)
) WITH CLUSTERING ORDER BY (requested_at DESC);
