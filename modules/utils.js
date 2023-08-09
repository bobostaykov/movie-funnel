/**
 * File with global helper functions
 */

import i18n from "i18n";
import { LayoutAnimation, Platform, UIManager } from "react-native";
import { InAppBrowser } from "react-native-inappbrowser-reborn";
import Toast from "react-native-toast-message";
import tmdbAccessToken from "../assets/tmdb_access_token.json";
import {
  ANIMATION_DURATION,
  TMDB_ARTIST_PAGE_URL,
  TMDB_MOVIE_PAGE_URL,
  TMDB_SHOW_PAGE_URL,
} from "./constants";

export const platformAndroid = Platform.OS === "android";
export const platformIOS = Platform.OS === "ios";

/**
 * LayoutAnimation automatically animates a transformation on screen
 */
let experimentalSet = false;
export function autoAnimate(duration = ANIMATION_DURATION) {
  // in order for LayoutAnimation to work on Android
  if (
    platformAndroid &&
    UIManager.setLayoutAnimationEnabledExperimental &&
    !experimentalSet
  ) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
    experimentalSet = true;
  }

  LayoutAnimation.configureNext({
    ...LayoutAnimation.Presets.easeInEaseOut,
    duration,
  });
}

/**
 * Opens the TMDB profile page of the given movie, show or artist
 */
export async function openMovieShowOrArtistPage(
  id,
  isArtist = false,
  isShow = false
) {
  if (await InAppBrowser.isAvailable()) {
    InAppBrowser.open(
      (isArtist
        ? TMDB_ARTIST_PAGE_URL
        : isShow
        ? TMDB_SHOW_PAGE_URL
        : TMDB_MOVIE_PAGE_URL) + id
    )
      .then((result) => {
        if (!result) {
          Toast.show({ text2: i18n.t("errors.web_page") });
        }
      })
      .catch(() => Toast.show({ text2: i18n.t("errors.web_page") }));
  }
}

/**
 * Gets the titles of the 'known for' movies and shows
 */
function parseKnownFor(knownForJSON) {
  if (knownForJSON === undefined) return undefined;

  const moviesAndShows = [];

  for (const item of knownForJSON) {
    moviesAndShows.push({
      title: item.media_type === "movie" ? item.title : item.name,
      id: item.id,
    });
  }

  return moviesAndShows;
}

/**
 * Gets relevant artist info from TMDB API results
 * and sorts it by popularity
 */
export function extractArtistInfo(results) {
  return results
    .map((result) => ({
      name: result.name,
      id: result.id,
      photoPath: result.profile_path,
      knownFor: parseKnownFor(result.known_for),
      as: result.character ? result.character : result.job,
      isActor: !!result.character,
      popularity: result.popularity,
      gender: result.gender,
    }))
    .sort((a, b) => b.popularity - a.popularity);
}

/**
 * Gets relevant movie or show info from TMDB API results
 */
export function extractMovieOrShowInfo(results) {
  return results.map((result) => ({
    name: result.title !== undefined ? result.title : result.name,
    overview: result.overview,
    posterPath: result.poster_path,
    id: result.id,
    rating: result.vote_average.toFixed(1),
    isShow: result.name !== undefined,
  }));
}

export function fetchFromTmdb(url) {
  return fetch(url, {
    headers: {
      Authorization: "Bearer " + tmdbAccessToken,
    },
  });
}
