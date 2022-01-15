/**
 * File with global constant values
 */

export const colors = {
  cyan: "#99e2c8",
};

export const spacing = {
  paddingS: 10,
  defaultPadding: 16,
  paddingL: 20,
  marginS: 10,
  defaultMargin: 16,
  marginL: 20,
};

export const DEFAULT_HIT_SLOP = {
  top: 10,
  end: 10,
  bottom: 10,
  start: 10,
};

// the minimum time (in milliseconds) the splash screen is visible
export const SPLASH_SCREEN_MIN_DELAY = 1000;
export const ANIMATION_DURATION = 250;
export const POPULAR_ARTISTS_NUMBER = 20;
export const MAX_RESULTS_SHOWN = 20;
export const DEFAULT_BORDER_RADIUS = 10;
export const OPACITY_ON_PRESS = 0.5;
export const ITEM_TEXT_LINE_HEIGHT = 16;
export const LOADING_INDICATOR_DIAMETER = 60;

export const MORE_THAN_20_SEARCH_RESULTS = "MORE_THAN_20_SEARCH_RESULTS";

// --- TMDb URLs ---
export const TMDB_API_BASE_URL = "https://api.themoviedb.org/3/";
// endpoint to get most popular artists
export const TMDB_POPULAR_ARTISTS_URL =
  "https://api.themoviedb.org/3/person/popular";
// endpoint to search for artists by name
export const TMDB_API_ARTISTS_URL =
  "https://api.themoviedb.org/3/search/person?query=";
// endpoint to get movies by artist IDs
export const TMDB_API_MOVIES_URL =
  "https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&with_people=";
// URL to get movie poster
export const TMDB_IMAGE_URL = "http://image.tmdb.org/t/p/w185";
// URL to TMDb movie page
export const TMDB_MOVIE_PAGE_URL = "https://www.themoviedb.org/movie/";
// URL to artist TMDb page
export const TMDB_ARTIST_PAGE_URL = "https://www.themoviedb.org/person/";

// custom event names
export const CLEAR_SELECTION_EVENT = "CLEAR_SELECTION_EVENT";
