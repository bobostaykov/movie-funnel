/**
 * File with global constant values
 */

export const colors = {
  cyan: "#99e2c8",
  pageBackground: "#f2f2f2",
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
export const MAX_ARTISTS = 10;
export const MAX_MOVIES_AND_SHOWS = 10;
export const POPULAR_ARTISTS_TO_SHOW = 20;
export const POPULAR_MOVIES_AND_SHOWS_TO_SHOW = 20;
export const MAX_RESULTS_TO_SHOW = 20;
export const DEFAULT_BORDER_RADIUS = 10;
export const OPACITY_ON_PRESS = 0.5;
export const ITEM_HEIGHT = 150;
export const IMAGE_RATIO = 0.66;
export const ITEM_TEXT_LINE_HEIGHT = 16;
export const LOADING_INDICATOR_DIAMETER = 60;
export const TOAST_HIDE_DELAY_LONG = 6000;
export const TOAST_HIDE_DELAY_SHORT = 3000;
export const GENDER_FEMALE = 1;

// --- TMDb URLs ---
export const TMDB_API_BASE_URL = "https://api.themoviedb.org/3";
export const TMDB_ARTIST_BASE_URL = TMDB_API_BASE_URL + "/person";
export const TMDB_POPULAR_ARTISTS_URL = TMDB_ARTIST_BASE_URL + "/popular";
export const TMDB_MOVIE_BASE_URL = TMDB_API_BASE_URL + "/movie";
export const TMDB_POPULAR_MOVIES_URL = TMDB_MOVIE_BASE_URL + "/popular";
export const TMDB_SHOW_BASE_URL = TMDB_API_BASE_URL + "/tv";
export const TMDB_POPULAR_SHOWS_URL = TMDB_SHOW_BASE_URL + "/popular";
export const TMDB_SEARCH_ARTISTS_URL =
  TMDB_API_BASE_URL + "/search/person?query=";
export const TMDB_SEARCH_MOVIES_URL =
  TMDB_API_BASE_URL + "/search/movie?query=";
export const TMDB_SEARCH_SHOWS_URL = TMDB_API_BASE_URL + "/search/tv?query=";
// endpoint to get movies by artist IDs
export const TMDB_API_MOVIES_URL =
  TMDB_API_BASE_URL + "/discover/movie?sort_by=popularity.desc&with_people=";
// URL to get movie or show poster
export const TMDB_IMAGE_URL = "http://image.tmdb.org/t/p/w185";
export const TMDB_ARTIST_PAGE_URL = "https://www.themoviedb.org/person/";
export const TMDB_MOVIE_PAGE_URL = "https://www.themoviedb.org/movie/";
export const TMDB_SHOW_PAGE_URL = "https://www.themoviedb.org/tv/";
