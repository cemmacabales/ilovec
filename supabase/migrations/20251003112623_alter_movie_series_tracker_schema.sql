alter table movie_series_tracker add column tmdb_id integer, add column type text, add column poster_path text, add column created_date timestamp with time zone default now();
