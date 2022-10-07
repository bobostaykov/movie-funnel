/**
 * On this screen the resulting list of movies is shown with
 * information and a link to the corresponding TMDB page
 */

import React, { useEffect, useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

import MovieItem from "components/MovieItem.js";
import i18n from "i18n";
import tmdbAccessToken from "assets/tmdb_access_token.json";
import {
  colors,
  spacing,
  TMDB_API_MOVIES_URL,
  TOAST_HIDE_DELAY_LONG,
} from "modules/constants.js";
import { autoAnimate } from "modules/utils.js";
import { globalStyles } from "modules/globalStyles.js";
import Toast from "react-native-toast-message";
import AwesomeAlert from "react-native-awesome-alerts";
import MainButton from "../components/MainButton";
// import {Icon} from "react-native-vector-icons/index";

const statusBarHeight = StatusBar.currentHeight;

const ResultsScreen = ({ navigation, route }) => {
  // a list of fetched movies
  const [movieResults, setMovieResults] = useState([]);
  // a list of selected artists' names to show above results
  const [artistNames, setArtistNames] = useState([]);
  // whether fetching is in progress
  const [loading, setLoading] = useState(false);
  // whether all artist names are shown (when more than 2)
  const [artistNamesExpanded, setArtistNamesExpanded] = useState(false);
  // whether individual movies of selected artists are shown, due to the absence of common movies
  const [showingIndividualMovies, setShowingIndividualMovies] = useState(false);
  const [noResultsAlertVisible, setNoResultsAlertVisible] = useState(false);

  useEffect(() => {
    getMovies();
  }, []);

  // --- FUNCTIONS ---

  /**
   * Fetch movies from TMDb API, using their IDs
   */
  const getMovies = () => {
    setLoading(true);

    fetch(TMDB_API_MOVIES_URL + route.params.artistIds, {
      headers: {
        Authorization: "Bearer " + tmdbAccessToken,
      },
    })
      .then((result) => result.json())
      .then((json) => {
        autoAnimate();
        setLoading(false);
        return parseMovies(json.results);
      })
      .catch(() => {
        setLoading(false);
        navigation.pop();
        Toast.show({
          text2: i18n.t("errors.fetch_results"),
          visibilityTime: TOAST_HIDE_DELAY_LONG,
        });
      });
  };

  /**
   * Called when no common movies for selected artists are found.
   * Informs the user with an alert and fetches movies starring
   * the selected artists.
   */
  const getAllIndividualMovies = async () => {
    setNoResultsAlertVisible(true);
    autoAnimate();
    setShowingIndividualMovies(true);
    setLoading(true);
    const movies = [];

    // fetching individual movies for max three of the selected artists only
    for (const id of route.params.artistIds.split(",").slice(0, 3)) {
      movies.push(...(await getIndividualMoviesForArtist(id)));
    }

    autoAnimate();
    setLoading(false);
    setMovieResults(movies);
  };

  const getIndividualMoviesForArtist = async (id) => {
    try {
      const result = await fetch(TMDB_API_MOVIES_URL + id, {
        headers: {
          Authorization: "Bearer " + tmdbAccessToken,
        },
      });
      const json = await result.json();
      return await parseMovies(json.results, true);
    } catch (error) {
      setLoading(false);
      navigation.pop();
      Toast.show({ text2: i18n.t("errors.fetch_results") });
    }
  };

  /**
   * Extracts the relevant information from the movie results
   * @param areIndividual: are the individual artist movies
   *    being parsed or the common
   */
  const parseMovies = async (resultsJSON, areIndividual = false) => {
    const results = [];
    let resultData;

    for (const [index, result] of resultsJSON.entries()) {
      resultData = {};
      resultData.title = result.title;
      resultData.overview = result.overview;
      resultData.posterPath = result.poster_path;
      resultData.id = result.id;
      resultData.rating = result.vote_average;

      results.push(resultData);

      // fetching max three individual movies per selected artist
      if (areIndividual && index === 2) break;
    }

    if (areIndividual) return results;

    parseArtistNames();

    if (results.length > 0) {
      setMovieResults(results);
    } else {
      await getAllIndividualMovies();
    }
  };

  const parseArtistNames = () => {
    const artists = [];
    for (const name of route.params.artistNames.split(",")) {
      artists.push(name);
    }
    setArtistNames(artists);
    // also returning result to use before the next render
    return artists;
  };

  /**
   * Toggles the expanded/collapsed view of the artist names
   */
  const toggleArtistNamesExpanded = () => {
    autoAnimate();
    setArtistNamesExpanded((current) => !current);
  };

  /**
   * Returns a string of all artists' names joined with commas
   */
  const getAllArtistsNames = () => {
    // deliberately not using string templates as in this case it is much less readable
    return artistNames.length === 2
      ? artistNames[0] + " " + i18n.t("helpers.and") + " " + artistNames[1]
      : artistNames.slice(0, -1).join(", ") +
          " " +
          i18n.t("helpers.and") +
          " " +
          artistNames[artistNames.length - 1];
  };

  /**
   * Returns a string of the first two artists' names
   * and an indicator of how many are hidden
   */
  const getArtistsNamesShortened = (artistsArray) => {
    let artists;

    if (artistsArray) artists = artistsArray;
    else artists = artistNames;

    // deliberately not using string templates as in this case it is much less readable
    return (
      artists[0] +
      ", " +
      artists[1] +
      " " +
      i18n.t("helpers.and") +
      " " +
      (artists.length - 2) +
      " " +
      (artists.length === 3
        ? i18n.t("helpers.other")
        : i18n.t("helpers.others"))
    );
  };

  // --- COMPONENTS ---

  const ExpandedArtistNames = () => (
    <View>
      <Text style={styles.subtitle}>{getAllArtistsNames()}</Text>
      {artistNames.length > 2 && <ToggleButton />}
    </View>
  );

  const CollapsedArtistNames = () => (
    <View>
      <Text style={styles.subtitle}>{getArtistsNamesShortened()}</Text>
      {artistNames.length > 2 && <ToggleButton />}
    </View>
  );

  const ToggleButton = () => (
    <Text style={styles.toggleButton} onPress={toggleArtistNamesExpanded}>
      {artistNamesExpanded
        ? i18n.t("results_screen.collapse_names")
        : i18n.t("results_screen.expand_names")}
    </Text>
  );

  const TitleResults = () => (
    <View style={styles.titleResults}>
      <Text style={styles.title}>
        {showingIndividualMovies
          ? i18n.t("results_screen.title_individual_movies")
          : i18n.t("results_screen.title_common_movies")}
      </Text>
      {artistNamesExpanded || artistNames.length === 2 ? (
        <ExpandedArtistNames />
      ) : (
        <CollapsedArtistNames />
      )}
    </View>
  );

  const TitleSearching = () => (
    <Text style={styles.title}>{i18n.t("results_screen.title_searching")}</Text>
  );

  return (
    <SafeAreaView style={styles.pageContainer}>
      <ScrollView contentContainerStyle={styles.resultsContainer}>
        <View style={styles.header}>
          {!loading && (
            <MainButton
              // icon={<Icon name="arrow-back" size={20} color="black" />}
              style={styles.backButton}
              onPress={() => navigation.pop()}
            />
          )}

          {loading ? (
            <TitleSearching />
          ) : (
            movieResults.length > 0 && <TitleResults />
          )}
        </View>

        {movieResults.map((item, index) => (
          <MovieItem
            title={item.title}
            overview={item.overview}
            posterPath={item.posterPath}
            id={item.id}
            rating={item.rating}
            key={index}
          />
        ))}
      </ScrollView>

      {loading && (
        <Image
          source={require("assets/loading_indicator.gif")}
          style={globalStyles.loadingIndicator}
        />
      )}

      <AwesomeAlert
        show={noResultsAlertVisible}
        title={i18n.t("results_screen.alert_title")}
        message={
          getAllArtistsNames() + " " + i18n.t("results_screen.no_common_movies")
        }
        closeOnTouchOutside
        showConfirmButton
        confirmText="OK"
        onConfirmPressed={()=>setNoResultsAlertVisible(false)}
        titleStyle={styles.noResultsAlertText}
        messageStyle={styles.noResultsAlertText}
        confirmButtonColor={null}
        confirmButtonTextStyle={styles.noResultsAlertButtonText}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    paddingTop: statusBarHeight,
    paddingHorizontal: spacing.defaultPadding,
  },

  header: {
    flexDirection: "row",
    marginBottom: spacing.defaultMargin,
  },

  backButton: {
    backgroundColor: colors.cyan,
    marginTop: "auto",
    marginBottom: "auto",
  },

  titleResults: {
    alignItems: "center",
    flex: 1,
  },

  title: {
    fontWeight: "bold",
    fontSize: 30,
  },

  subtitle: {
    width: "auto",
    height: "auto",
    marginHorizontal: "15%",
    fontSize: 15,
    textAlign: "center",
  },

  toggleButton: {
    alignSelf: "center",
    color: "blue",
    marginBottom: spacing.defaultMargin,
  },

  resultsContainer: {
    alignItems: "center",
    width: "100%",
  },

  noResultsAlertText:{
    color: "grey",
  },

  noResultsAlertButtonText:{
    color: "grey",
    opacity:1
  },
});

export default ResultsScreen;
