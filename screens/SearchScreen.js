import i18n from "i18n";
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
import React, { useEffect, useRef, useState } from "react";
import { Animated, Keyboard, RefreshControl, StyleSheet } from "react-native";
import Toast from "react-native-toast-message";
import ArtistItem from "../components/ArtistItem";
import ItemSkeleton from "../components/ItemSkeleton";
import MovieItem from "../components/MovieItem";
import {
  ANIMATION_DURATION,
  MAX_ARTISTS,
  MAX_MOVIES,
  MAX_RESULTS_TO_SHOW,
  POPULAR_ARTISTS_TO_SHOW,
  POPULAR_MOVIES_TO_SHOW,
  TMDB_POPULAR_ARTISTS_URL,
  TMDB_POPULAR_MOVIES_URL,
  TMDB_SEARCH_ARTISTS_URL,
  TMDB_SEARCH_MOVIES_URL,
} from "../modules/constants";
import {
  extractArtistInfo,
  extractMovieInfo,
  fetchFromTmdb,
  platformAndroid,
} from "../modules/utils";

/**
 * On this screen the user selects up to 10 artists or movies,
 * depending on the selected mode on the welcome screen and makes
 * a search request which sends him/her to the results screen.
 * Initially, the 20 most popular artists/movies are shown, ready
 * to be selected.
 */
const SearchScreen = ({ navigation, route }) => {
  // storing the names and IDs of all the selected artists or movies
  const [selectedItems, setSelectedItems] = useState([]);
  // list of fetched popular artists to show initially on search screen
  const [popularArtists, setPopularArtists] = useState([]);
  // list of fetched popular movies to show initially on search screen
  const [popularMovies, setPopularMovies] = useState([]);
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
  const [resultsTruncated, setResultsTruncated] = useState(false);
  // a reference to the scroll view
  const scrollView = useRef(null);
  // a reference to the text input
  const nameInput = useRef(null);
  // animate the opacity of the scroll view
  const animatedOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (route.params.findMovies) {
      fetchPopularArtists();
    } else {
      fetchPopularMovies();
    }
  }, []);

  // --- FUNCTIONS ---

  /**
   * Fetches most popular artists on TMDb
   */
  const fetchPopularArtists = () => {
    setLoading(true);

    fetchFromTmdb(TMDB_POPULAR_ARTISTS_URL)
      .then((result) => {
        setLoading(false);
        return result.json();
      })
      .then((json) => parseArtistResults(json.results, true))
      .catch(() => {
        Toast.show({
          text2: i18n.t("errors.fetch_popular_artists"),
          bottomOffset: selectedItems.length > 0 && 80,
        });
        setLoading(false);
        setPopularVisible(true);
      });
  };

  /**
   * Fetches most popular movies on TMDb
   */
  const fetchPopularMovies = () => {
    setLoading(true);

    fetchFromTmdb(TMDB_POPULAR_MOVIES_URL)
      .then((result) => {
        setLoading(false);
        return result.json();
      })
      .then((json) => parseMovieResults(json.results, true))
      .catch(() => {
        Toast.show({
          text2: i18n.t("errors.fetch_popular_movies"),
          bottomOffset: selectedItems.length > 0 && 80,
        });
        setLoading(false);
        setPopularVisible(true);
      });
  };

  /**
   * Fetch artist or movie results for search term
   */
  const fetchResultsForSearchTerm = (term) => {
    fetchFromTmdb(
      (route.params.findMovies
        ? TMDB_SEARCH_ARTISTS_URL
        : TMDB_SEARCH_MOVIES_URL) + encodeURI(term)
    )
      .then((result) => {
        setTimeout(() => {
          setResultsFetched(true);
        }, 500);
        return result.json();
      })
      .then((json) => {
        setResultsTruncated(json.total_results > MAX_RESULTS_TO_SHOW);
        if (route.params.findMovies) {
          parseArtistResults(json.results);
        } else {
          parseMovieResults(json.results);
        }
        setLoading(false);
      })
      .catch(() => {
        Toast.show({
          text2: i18n.t("errors.fetch_search_results"),
          bottomOffset: selectedItems.length > 0 && 80,
        });
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
  const parseArtistResults = (resultsJSON, isPopular = false) => {
    const results = extractArtistInfo(
      resultsJSON.slice(
        0,
        isPopular ? POPULAR_ARTISTS_TO_SHOW : MAX_RESULTS_TO_SHOW
      )
    );

    if (isPopular) {
      setPopularArtists(results);
    } else {
      setSearchResults(results);
    }

    scrollResultsToTop();
  };

  /**
   * Extracts relevant information from the results
   * @param isPopular: whether popular movie results are
   *    parsed; if false -> then search results are parsed
   */
  const parseMovieResults = (resultsJSON, isPopular = false) => {
    const results = extractMovieInfo(
      resultsJSON.slice(
        0,
        isPopular ? POPULAR_MOVIES_TO_SHOW : MAX_RESULTS_TO_SHOW
      )
    );

    if (isPopular) {
      setPopularMovies(results);
    } else {
      setSearchResults(results);
    }

    scrollResultsToTop();
  };

  /**
   * Called on artist/movie item press
   */
  const selectItem = (id, name, selected) => {
    if (selected) {
      if (
        selectedItems.length < route.params.findMovies
          ? MAX_ARTISTS
          : MAX_MOVIES
      ) {
        setSelectedItems((current) => [...current, { id, name }]);
      } else {
        Toast.show({
          text2: route.params.findMovies
            ? i18n.t("errors.too_many_artists")
            : i18n.t("errors.too_many_movies"),
          bottomOffset: 80,
        });
      }
    } else {
      setSelectedItems((current) => current.filter((item) => item.id !== id));
    }
  };

  /**
   * Called on "back" button press.
   * -> If in "search" mode, exits it and shows
   * initial screen with popular artists. Fades artist items out
   * and in to make the transition smooth.
   * -> If not, navigates back to Welcome screen.
   */
  const backHandler = () => {
    Keyboard.dismiss();

    if (!searching) {
      navigation.pop();
      return;
    }

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
    if (selectedItems.length < 2) {
      Toast.show({
        text2: route.params.findMovies
          ? i18n.t("errors.too_few_artists")
          : i18n.t("errors.too_few_movies"),
        bottomOffset: 80,
      });
    } else {
      navigation.navigate("ResultsScreen", {
        ids: getSelectedItemIds(),
        names: getSelectedItemNames(),
        findMovies: route.params.findMovies,
      });
    }
  };

  /**
   * Called on keyboard "return" key press
   */
  const searchHandler = () => {
    if (!intermediateSearchValue.trim()) {
      Toast.show({
        text2: i18n.t("errors.empty_search"),
        bottomOffset: selectedItems.length > 0 && 80,
      });
      setIntermediateSearchValue("");
      return;
    }

    setSearching(true);
    setLoading(true);
    setPopularVisible(false);
    setSearchTerm(intermediateSearchValue);
    setSearchResults([]);
    setResultsFetched(false);
    setResultsTruncated(false);

    fetchResultsForSearchTerm(intermediateSearchValue);
  };

  const getSelectedItemIds = () => {
    const ids = [];
    for (const artist of selectedItems) ids.push(artist.id);
    return ids.join(",");
  };

  const getSelectedItemNames = () => {
    const names = [];
    for (const item of selectedItems) {
      names.push(item.name);
    }
    return names.join(",");
  };

  const scrollResultsToTop = () => {
    scrollView.current?.scrollTo({ y: 0 });
  };

  // --- COMPONENTS ---

  function Title() {
    let text;
    if (loading) {
      if (searching) {
        text = i18n.t("search_screen.title_loading_results");
      } else {
        if (route.params.findMovies) {
          text = i18n.t("search_screen.title_loading_popular_artists");
        } else {
          text = i18n.t("search_screen.title_loading_popular_movies");
        }
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
        if (route.params.findMovies) {
          text = i18n.t("search_screen.title_showing_popular_artists");
        } else {
          text = i18n.t("search_screen.title_showing_popular_movies");
        }
      }
    }
    return <Heading my="4">{text}</Heading>;
  }

  function NoResults() {
    return (
      <Center>
        <Image
          resizeMode="contain"
          source={require("assets/images/no_results.png")}
          alt="No results"
          height={300}
          mt={15}
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
        placeholder={i18n.t(
          route.params.findMovies
            ? "search_screen.input_placeholder_artists"
            : "search_screen.input_placeholder_movies"
        )}
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
        // Next two attributes: so the items can go behind the input and the rounded corners are not white
        mb={-1}
        zIndex={1}
        bg="light.100"
        _focus={{
          bg: "light.100",
        }}
        InputLeftElement={
          <IconButton
            icon={<ArrowBackIcon color="grey" />}
            rounded="md"
            onPress={backHandler}
            mr={-1}
            p={1.5}
            ml={1}
          />
        }
      />

      <Animated.ScrollView
        ref={scrollView}
        opacity={animatedOpacity}
        contentContainerStyle={styles.resultsContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshingPopular}
            onRefresh={
              route.params.findMovies ? fetchPopularArtists : fetchPopularMovies
            }
            enabled={!searching}
          />
        }
      >
        <Title />

        {popularVisible &&
          !loading &&
          route.params.findMovies &&
          popularArtists.map((item) => (
            <ArtistItem
              {...item}
              onPress={() =>
                selectItem(
                  item.id,
                  item.name,
                  !selectedItems.map((artist) => artist.id).includes(item.id)
                )
              }
              selected={selectedItems
                .map((artist) => artist.id)
                .includes(item.id)}
              key={item.id}
            />
          ))}

        {!popularVisible &&
          !loading &&
          route.params.findMovies &&
          searchResults.map((item) => (
            <ArtistItem
              {...item}
              onPress={() =>
                selectItem(
                  item.id,
                  item.name,
                  !selectedItems.map((artist) => artist.id).includes(item.id)
                )
              }
              selected={selectedItems
                .map((artist) => artist.id)
                .includes(item.id)}
              key={item.id}
            />
          ))}

        {popularVisible &&
          !loading &&
          !route.params.findMovies &&
          popularMovies.map((item) => (
            <MovieItem
              {...item}
              onPress={() =>
                selectItem(
                  item.id,
                  item.name,
                  !selectedItems.map((movie) => movie.id).includes(item.id)
                )
              }
              selected={selectedItems
                .map((movie) => movie.id)
                .includes(item.id)}
              key={item.id}
            />
          ))}

        {!popularVisible &&
          !loading &&
          !route.params.findMovies &&
          searchResults.map((item) => (
            <MovieItem
              {...item}
              onPress={() =>
                selectItem(
                  item.id,
                  item.name,
                  !selectedItems.map((movie) => movie.id).includes(item.id)
                )
              }
              selected={selectedItems
                .map((movie) => movie.id)
                .includes(item.id)}
              key={item.id}
            />
          ))}

        {loading &&
          route.params.findMovies &&
          Array.from(Array(10)).map((_, index) => <ItemSkeleton key={index} />)}

        {loading &&
          !route.params.findMovies &&
          Array.from(Array(10)).map((_, index) => <ItemSkeleton key={index} />)}

        {resultsTruncated && (
          <Text
            mt={-3}
            mb={selectedItems.length > 0 ? 20 : platformAndroid ? 1 : 4}
          >
            {i18n.t("search_screen.truncated_results")}
          </Text>
        )}

        {searching && resultsFetched && searchResults.length === 0 && (
          <NoResults />
        )}
      </Animated.ScrollView>

      <PresenceTransition
        visible={selectedItems.length > 0}
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
          onPress={() => setSelectedItems([])}
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
