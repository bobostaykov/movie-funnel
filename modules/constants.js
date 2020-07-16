/**
 * File with global constant values
 */

export const spacing = {
   paddingS: 10,
   defaultPadding: 16,
   paddingL: 20,
   marginS: 10,
   defaultMargin: 16,
   marginL: 20,
};

// the minimum time (in milliseconds) the splash screen is visible
export const SPLASH_SCREEN_MIN_DELAY = 1000;
export const ANIMATION_DURATION = 250;
export const POPULAR_ARTISTS_NUMBER = 20;
export const DEFAULT_BORDER_RADIUS = 10;
export const OPACITY_ON_PRESS = 0.5;
export const ITEM_TEXT_LINE_HEIGHT = 16;
export const LOADING_INDICATOR_DIAMETER = 60;

// --- TMDb URLs ---
export const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3/';
// endpoint to get most popular artists
export const TMDB_POPULAR_ARTISTS_URL = 'https://api.themoviedb.org/3/person/popular';
// endpoint to get artist id by name
export const TMDB_API_ARTIST_URL = 'https://api.themoviedb.org/3/search/person?query=';
// endpoint to get movies by artist IDs
export const TMDB_API_MOVIES_URL = 'https://api.themoviedb.org/3/discover/movie?with_people=';
// URL to get movie poster
export const TMDB_IMAGE_URL = 'http://image.tmdb.org/t/p/w185';
// URL to TMDb movie page
export const TMDB_MOVIE_PAGE_URL = 'https://www.themoviedb.org/movie/';
// URL to artist TMDb page
export const TMDB_ARTIST_PAGE_URL = 'https://www.themoviedb.org/person/';
