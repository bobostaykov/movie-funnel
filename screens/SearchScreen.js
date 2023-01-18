/**
 * On this screen the user searches for and chooses up to 10
 * actors/directors and makes a search request which sends them
 * to the results screen. Initially, the 20 most popular actors
 * are shown, ready to be selected.
 */

import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Keyboard,
  RefreshControl,
  StyleSheet,
} from "react-native";

import tmdbAccessToken from "assets/tmdb_access_token.json";
import ArtistItem, { ArtistItemSkeleton } from "components/ArtistItem.js";
import i18n from "i18n";
import {
  ANIMATION_DURATION,
  MAX_RESULTS_SHOWN,
  MORE_THAN_20_SEARCH_RESULTS,
  POPULAR_ARTISTS_NUMBER,
  TMDB_API_ARTISTS_URL,
  TMDB_POPULAR_ARTISTS_URL,
} from "modules/constants.js";
import { platformAndroid } from "modules/utils.js";
import {
  ArrowBackIcon,
  ArrowForwardIcon,
  Box,
  Center,
  CloseIcon,
  Fab,
  Heading,
  IconButton,
  Image,
  Input,
  PresenceTransition,
  Text,
} from "native-base";
import Toast from "react-native-toast-message";

const windowWidth = Dimensions.get("window").width;

const SearchScreen = ({ navigation }) => {
  // storing the names and IDs of all the selected actors/directors
  const [selectedArtists, setSelectedArtists] = useState([]);
  // list of fetched popular artists to show initially on search screen
  const [popularArtists, setPopularArtists] = useState([]);
  // search term, value changing as user types
  const [intermediateSearchValue, setIntermediateSearchValue] = useState("");
  // value of search field after pressing search button
  const [searchTerm, setSearchTerm] = useState("");
  // whether the user is in "search" mode
  const [searching, setSearching] = useState(false);
  /*
    whether popular artists are on screen, separate from "searching"
    variable to make the exit from "search" mode smooth
   */
  const [popularVisible, setPopularVisible] = useState(true);
  const [refreshingPopular] = useState(false);
  // list of fetched artist results
  const [searchResults, setSearchResults] = useState([]);
  // whether fetching is in progress
  const [loading, setLoading] = useState(false);
  /*
    whether results are fully fetched, used to show "no results"
    text with a delay, otherwise it shows for a moment before the
    results appear
   */
  const [resultsFetched, setResultsFetched] = useState(false);
  // a reference to the scroll view
  const scrollView = useRef(null);
  // a reference to the text input
  const nameInput = useRef(null);
  // animate the opacity of the scroll view
  const animatedOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchPopularArtists();
  }, []);

  // --- FUNCTIONS ---

  /**
   * Fetches most popular artists on TMDb
   */
  const fetchPopularArtists = () => {
    setLoading(true);

    fetch(TMDB_POPULAR_ARTISTS_URL, {
      headers: {
        Authorization: "Bearer " + tmdbAccessToken,
      },
    })
      .then((result) => {
        setLoading(false);
        return result.json();
      })
      .then((json) =>
        parseArtistResults(json.results, json.total_results, true)
      )
      .catch(() => {
        Toast.show({ text2: i18n.t("errors.fetch_popular") });
        setLoading(false);
        setSearching(false);
        setPopularVisible(true);
      });
  };

  /**
   * Fetch actor and director results for search term
   */
  const fetchResultsForSearchTerm = (term) => {
    setLoading(true);

    fetch(TMDB_API_ARTISTS_URL + encodeURI(term), {
      headers: {
        Authorization: "Bearer " + tmdbAccessToken,
      },
    })
      .then((result) => {
        setLoading(false);
        setTimeout(() => {
          setResultsFetched(true);
        }, 500);
        return result.json();
      })
      .then((json) => parseArtistResults(json.results, json.total_results))
      .catch(() => {
        Toast.show({ text2: i18n.t("errors.fetch_search_results") });
        setLoading(false);
        setSearching(false);
        setPopularVisible(true);
      });
  };

  /**
   * Extracts relevant information from the results
   * @param isPopular: whether popular artists results are
   *    parsed; if false -> then search results are parsed
   */
  const parseArtistResults = (resultsJSON, resultCount, isPopular = false) => {
    const results = [];
    let data;

    for (const result of resultsJSON.slice(
      0,
      isPopular ? POPULAR_ARTISTS_NUMBER : MAX_RESULTS_SHOWN
    )) {
      data = {};
      data.name = result.name;
      data.id = result.id;
      data.photoPath = result.profile_path;
      data.knownFor = parseKnownFor(result.known_for);

      results.push(data);
    }

    if (isPopular) {
      setPopularArtists(results);
    } else {
      if (resultCount > 20) results.push({ name: MORE_THAN_20_SEARCH_RESULTS });
      setSearchResults(results);
    }

    scrollResultsToTop();
  };

  /**
   * Gets the titles of the 'known for' movies
   */
  const parseKnownFor = (knownForJSON) => {
    const movies = [];

    for (const movie of knownForJSON) {
      movie.media_type === "movie"
        ? movies.push(movie.title)
        : movies.push(movie.original_name);
    }

    return movies;
  };

  /**
   * Called on artist item press
   */
  const selectArtist = (id, name, selected) => {
    if (selected) {
      if (selectedArtists.length < 10) {
        // add to list
        setSelectedArtists((current) => [...current, { id, name }]);
      } else {
        Toast.show({ text2: i18n.t("errors.too_many_artists") });
      }
    } else {
      // remove from list
      setSelectedArtists((current) => current.filter((item) => item.id !== id));
    }
  };

  /**
   * Called on "back" button press. Exits "search" mode and shows
   * initial screen with popular artists. Fades artist items out
   * and in to make the transition smooth.
   */
  const backHandler = () => {
    Keyboard.dismiss();
    setSearching(false);
    setIntermediateSearchValue("");

    setTimeout(() => {
      setPopularVisible(true);
      scrollResultsToTop();
    }, 0);

    Animated.sequence([
      Animated.timing(animatedOpacity, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(animatedOpacity, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  /**
   * Called on "apply" button press
   */
  const applySelection = () => {
    if (selectedArtists.length >= 2 && selectedArtists.length <= 10) {
      navigation.navigate("ResultsScreen", {
        artistIds: getSelectedArtistIds(),
        artistNames: getSelectedArtistNames(),
      });
    }
  };

  /**
   * Called on keyboard "return" key press
   */
  const searchHandler = () => {
    if (!intermediateSearchValue.trim()) {
      Toast.show({ text2: i18n.t("errors.empty_search") });
      setIntermediateSearchValue("");
      return;
    }

    setSearching(true);
    setPopularVisible(false);
    setSearchTerm(intermediateSearchValue);

    fetchResultsForSearchTerm(intermediateSearchValue);
  };

  const getSelectedArtistIds = () => {
    const ids = [];
    for (const artist of selectedArtists) ids.push(artist.id);
    return ids.join(",");
  };

  const getSelectedArtistNames = () => {
    const names = [];
    for (const artist of selectedArtists) names.push(artist.name);
    return names.join(",");
  };

  const scrollResultsToTop = () => {
    scrollView.current?.scrollTo({ y: 0 });
  };

  const isNoResultsVisible = () =>
    searching && resultsFetched && searchResults.length === 0;

  const isHintShowing20Visible = () =>
    searching &&
    !loading &&
    searchResults[searchResults.length - 1] &&
    searchResults[searchResults.length - 1].name ===
      MORE_THAN_20_SEARCH_RESULTS;

  // --- COMPONENTS ---

  function Title() {
    let text;
    if (loading) {
      if (searching) {
        text = i18n.t("search_screen.title_loading_results");
      } else {
        text = i18n.t("search_screen.title_loading_popular");
      }
    } else {
      if (searching) {
        text =
          searchResults.length > 0 &&
          i18n.t("search_screen.title_showing_results") +
            ' "' +
            searchTerm +
            '":';
      } else {
        text = i18n.t("search_screen.title_showing_popular");
      }
    }
    return <Heading my="4">{text}</Heading>;
  }

  function NoResults() {
    return (
      <Center mt={10}>
        <Image
          resizeMode="contain"
          source={require("assets/no_results.png")}
          w={windowWidth}
          alt="No results"
        />
        <Text fontSize="xl" fontWeight="bold">
          {`${i18n.t("errors.no_results")} "${searchTerm}"`}
        </Text>
      </Center>
    );
  }

  return (
    <Box flex={1} safeAreaTop={platformAndroid && 4} px={4}>
      <Input
        ref={nameInput}
        value={intermediateSearchValue}
        onChangeText={setIntermediateSearchValue}
        placeholder={i18n.t("search_screen.input_placeholder")}
        placeholderTextColor="light.500"
        fontSize="sm"
        returnKeyType="search"
        onSubmitEditing={searchHandler}
        blurOnSubmit
        selectTextOnFocus
        // Workaround for selectTextOnFocus not working on iOS
        multiline
        rounded="md"
        py={platformAndroid ? 1.5 : 3}
        // Next two attributes: so the artist items can go behind the input and the rounded corners are not white
        mb={-1}
        zIndex={1}
        bg="light.100"
        _focus={{
          bg: "light.100",
        }}
        InputLeftElement={
          searching && (
            <IconButton
              icon={<ArrowBackIcon color="grey" />}
              colorScheme="grey"
              rounded="full"
              onPress={backHandler}
              mr={-1}
            />
          )
        }
      />

      <Animated.ScrollView
        ref={scrollView}
        opacity={animatedOpacity}
        contentContainerStyle={styles.resultsContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshingPopular}
            onRefresh={fetchPopularArtists}
            enabled={!searching}
          />
        }
      >
        <Title />

        {popularVisible &&
          !loading &&
          popularArtists.map((item, index) => (
            <ArtistItem
              name={item.name}
              id={item.id}
              photoPath={item.photoPath}
              knownFor={item.knownFor}
              onPress={selectArtist}
              selected={selectedArtists
                .map((artist) => artist.id)
                .includes(item.id)}
              key={index}
            />
          ))}

        {!popularVisible &&
          !loading &&
          searchResults.map((item, index) => (
            <ArtistItem
              name={item.name}
              id={item.id}
              photoPath={item.photoPath}
              knownFor={item.knownFor}
              onPress={selectArtist}
              selected={selectedArtists
                .map((artist) => artist.id)
                .includes(item.id)}
              key={index}
            />
          ))}

        {loading &&
          Array.from(Array(10)).map((_, index) => (
            <ArtistItemSkeleton key={index} />
          ))}

        {isHintShowing20Visible() && (
          <Text mt={-3} mb={platformAndroid ? 1 : 4}>
            {i18n.t("search_screen.hint_showing_20_results")}
          </Text>
        )}

        {isNoResultsVisible() && <NoResults />}
      </Animated.ScrollView>

      <PresenceTransition
        visible={selectedArtists.length > 1}
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          transition: { duration: 120 },
        }}
        exit={{
          opacity: 0,
          transition: { duration: 80 },
        }}
      >
        <Fab
          onPress={() => setSelectedArtists([])}
          icon={<CloseIcon />}
          size="xs"
          renderInPortal={false}
          bg="red.500"
          placement="bottom-left"
          _pressed={{
            bg: "red.500",
            transform: [{ scale: 0.9 }],
          }}
        />
        <Fab
          onPress={applySelection}
          icon={<ArrowForwardIcon />}
          size="lg"
          renderInPortal={false}
          bg="green.500"
          _pressed={{
            bg: "green.500",
            transform: [{ scale: 0.9 }],
          }}
        />
      </PresenceTransition>
    </Box>
  );
};

const styles = StyleSheet.create({
  resultsContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default SearchScreen;
