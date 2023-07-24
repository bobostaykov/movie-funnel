import i18n from "i18n";
import {
  AlertDialog,
  ArrowBackIcon,
  Box,
  Button,
  Center,
  Heading,
  IconButton,
  Row,
  SectionList,
  Text,
} from "native-base";
import React, { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import ArtistItem from "../components/ArtistItem";
import ItemSkeleton from "../components/ItemSkeleton";
import MovieItem from "../components/MovieItem";
import {
  colors,
  TMDB_API_MOVIES_URL,
  TMDB_MOVIE_BASE_URL,
  TOAST_HIDE_DELAY_LONG,
} from "../modules/constants";
import {
  autoAnimate,
  extractArtistInfo,
  extractMovieInfo,
  fetchFromTmdb,
  platformAndroid,
} from "../modules/utils";

/**
 * On this screen the resulting list of movies is shown with
 * information and a link to the corresponding TMDB page
 */
const ResultsScreen = ({ navigation, route }) => {
  const [movieResults, setMovieResults] = useState([]);
  const [artistResults, setArtistResults] = useState([]);
  // whether all artist names are shown (when more than 2)
  const [searchNamesExpanded, setSearchNamesExpanded] = useState(false);
  // no common movies for selected artists or common artists for selected movies are found
  const [noResults, setNoResults] = useState(false);
  const [noResultsAlertVisible, setNoResultsAlertVisible] = useState(false);
  // whether fetching is in progress
  const [loading, setLoading] = useState(false);
  const ids = route.params.ids.split(",");
  const names = route.params.names.split(",");
  const findMovies = route.params.findMovies;

  useEffect(() => {
    if (findMovies) {
      getCommonMovies();
    } else {
      getCommonArtists();
    }
  }, []);

  // --- FUNCTIONS ---

  /**
   * Finds the movies in common for the selected artists
   */
  const getCommonMovies = () => {
    setLoading(true);
    fetchFromTmdb(TMDB_API_MOVIES_URL + route.params.ids)
      .then((result) => result.json())
      .then((json) => {
        autoAnimate();
        setLoading(false);
        return parseMovies(json.results);
      })
      .catch((e) => {
        console.error("error:", e);
        setLoading(false);
        navigation.pop();
        Toast.show({
          text2: i18n.t("errors.fetch_results"),
          visibilityTime: TOAST_HIDE_DELAY_LONG,
          bottomOffset: 80,
        });
      });
  };

  /**
   * Called when no common movies for the selected artists are found.
   * Informs the user with an alert and fetches movies starring
   * the selected artists.
   */
  const getIndividualMoviesForAllArtists = async () => {
    setNoResultsAlertVisible(true);
    autoAnimate();
    setNoResults(true);
    setLoading(true);

    const movies = [];

    for (let i = 0; i < ids.length; i++) {
      movies.push({
        title: names[i],
        data: await getIndividualMoviesForArtist(ids[i]),
      });
    }

    autoAnimate();
    setLoading(false);
    setMovieResults(movies);
  };

  /**
   * Gets movies the provided artist stars in
   */
  const getIndividualMoviesForArtist = async (artistId) => {
    try {
      const result = await fetchFromTmdb(TMDB_API_MOVIES_URL + artistId);
      const json = await result.json();
      return await parseMovies(json.results, true);
    } catch (error) {
      console.error("error:", error);
      setLoading(false);
      navigation.pop();
      Toast.show({ text2: i18n.t("errors.fetch_results"), bottomOffset: 80 });
    }
  };

  /**
   * Extracts the relevant information from the movie results
   * @param areIndividual: are the individual artist movies
   *    being parsed or the common
   */
  const parseMovies = async (resultsJSON, areIndividual = false) => {
    const results = extractMovieInfo(
      resultsJSON.slice(0, areIndividual ? 3 : undefined)
    );

    if (areIndividual) return results;

    if (results.length > 0) {
      setMovieResults([{ title: "", data: results }]);
    } else {
      await getIndividualMoviesForAllArtists();
    }
  };

  /**
   * Finds the cast and crew part of the selected movies/series
   */
  async function getCommonArtists() {
    setLoading(true);
    if (findMovies) return;

    const artistsForFirstMovie = await getArtistsForMovie(ids[0]);
    let commonCast = artistsForFirstMovie.cast;
    // Store the character for all movies in the 'character' attribute
    for (const actor of commonCast) {
      actor.character = { [names[0]]: actor.character };
    }
    let commonCrew = deduplicateCrew(artistsForFirstMovie.crew);
    // Store the job for all movies in the 'job' attribute
    for (const member of commonCrew) {
      member.job = { [names[0]]: member.job };
    }

    for (let i = 1; i < ids.length; i++) {
      const artistsForMovie = await getArtistsForMovie(ids[i]);
      commonCast = commonCast.filter((artist) =>
        artistsForMovie.cast.map((member) => member.id).includes(artist.id)
      );
      for (const actor of commonCast) {
        actor.character[names[i]] = artistsForMovie.cast.find(
          (a) => a.id === actor.id
        ).character;
      }
      commonCrew = commonCrew.filter((artist) =>
        artistsForMovie.crew.map((member) => member.id).includes(artist.id)
      );
      for (const member of commonCrew) {
        member.job[names[i]] = deduplicateCrew(artistsForMovie.crew).find(
          (a) => a.id === member.id
        ).job;
      }
    }

    if (commonCast.length > 0 || commonCrew.length > 0) {
      setArtistResults([
        {
          title: i18n.t("results_screen.common_cast"),
          data: extractArtistInfo(commonCast),
        },
        {
          title: i18n.t("results_screen.common_crew"),
          data: extractArtistInfo(commonCrew),
        },
      ]);
    } else {
      await getIndividualArtistsForAllMovies();
    }

    setLoading(false);
  }

  /**
   * Combine crew duplicates with different jobs
   */
  function deduplicateCrew(crew) {
    return crew.reduce((result, artist) => {
      const existing = result.find((a) => a.id === artist.id);
      if (existing) {
        existing.job += `, ${artist.job}`;
      } else {
        result.push({ ...artist });
      }
      return result;
    }, []);
  }

  /**
   * Gets artists taking part in the selected movies.
   * Called when no common artists for the selected movies are found.
   * Informs the user with an alert and fetches artists taking
   * part in the selected movies.
   */
  async function getIndividualArtistsForAllMovies() {
    setNoResultsAlertVisible(true);
    autoAnimate();
    setNoResults(true);
    const result = [];
    for (let i = 0; i < ids.length; i++) {
      const artists = await getArtistsForMovie(ids[i]);
      const director = artists.crew.find((member) => member.job === "Director");
      const popularCast = artists.cast.slice(0, director !== undefined ? 2 : 3);
      const data = [];
      if (director !== undefined) {
        data.push(director);
      }
      data.push(...popularCast);
      result.push({ title: names[i], data: extractArtistInfo(data) });
    }
    setArtistResults(result);
  }

  /**
   * Finds the cast and crew part of the movie with the given ID
   */
  async function getArtistsForMovie(movieId) {
    try {
      const url = `${TMDB_MOVIE_BASE_URL}/${movieId}?append_to_response=credits`;
      const result = await fetchFromTmdb(url);
      const json = await result.json();
      return json.credits;
    } catch (error) {
      console.error("error:", error);
      setLoading(false);
    }
  }

  /**
   * Toggles the expanded/collapsed view of the search names
   */
  const toggleSearchNamesExpanded = () => {
    autoAnimate();
    setSearchNamesExpanded((current) => !current);
  };

  /**
   * Returns a string of all artists'/movies' names joined with commas
   */
  const getAllSearchNames = () => {
    return (
      names.slice(0, -1).join(", ") +
      " " +
      i18n.t("helpers.and") +
      " " +
      names[names.length - 1]
    );
  };

  /**
   * Returns a string of the first two artists'/movies' names
   * and an indicator of how many are hidden
   */
  const getSearchNamesShortened = () => {
    return (
      names[0] +
      ", " +
      names[1] +
      " " +
      i18n.t("helpers.and") +
      " " +
      (names.length - 2) +
      " " +
      (names.length === 3 ? i18n.t("helpers.other") : i18n.t("helpers.others"))
    );
  };

  // --- COMPONENTS ---

  const ExpandedSearchNames = () => (
    <Center>
      <Text mx="15%" fontSize={13} textAlign="center">
        {getAllSearchNames()}
      </Text>
      {names.length > 2 && <ToggleButton />}
    </Center>
  );

  const CollapsedSearchNames = () => (
    <Center>
      <Text mx="15%" fontSize={13} textAlign="center">
        {getSearchNamesShortened()}
      </Text>
      {names.length > 2 && <ToggleButton />}
    </Center>
  );

  const SearchNames = () => {
    return searchNamesExpanded || names.length === 2 ? (
      <ExpandedSearchNames />
    ) : (
      <CollapsedSearchNames />
    );
  };

  const ToggleButton = () => (
    <Text color="blue.700" onPress={toggleSearchNamesExpanded}>
      {searchNamesExpanded
        ? i18n.t("results_screen.collapse_names")
        : i18n.t("results_screen.expand_names")}
    </Text>
  );

  const TitleMovieResults = () => (
    <Box flex={1} alignItems="center" mr={10}>
      <Heading>
        {noResults
          ? i18n.t("results_screen.title_individual_movies")
          : i18n.t("results_screen.title_common_movies")}
      </Heading>
      {!noResults && <SearchNames />}
    </Box>
  );

  const TitleArtistResults = () => (
    <Box flex={1} alignItems="center" mr={10}>
      <Heading>
        {noResults
          ? i18n.t("results_screen.title_individual_artists")
          : i18n.t("results_screen.title_common_artists")}
      </Heading>
      {!noResults && <SearchNames />}
    </Box>
  );

  const TitleSearching = () => (
    <Heading flex={1} textAlign="center" alignItems="center" mr={10}>
      {i18n.t("results_screen.title_searching")}
    </Heading>
  );

  const SectionTitle = ({ section }) => {
    return (
      <Heading
        size="md"
        py={2}
        style={{ backgroundColor: colors.pageBackground }}
      >
        {section.title}
      </Heading>
    );
  };

  return (
    <Box safeAreaTop={platformAndroid && 2} px={4} flex={1}>
      <Row mb={2} justifyContent="center">
        <IconButton
          mb="auto"
          icon={<ArrowBackIcon size={5} color="gray.700" />}
          rounded="md"
          onPress={() => navigation.pop()}
        />

        {loading ? (
          <TitleSearching />
        ) : movieResults.length > 0 ? (
          <TitleMovieResults />
        ) : (
          artistResults.length > 0 && <TitleArtistResults />
        )}
      </Row>

      {movieResults.length > 0 && (
        <SectionList
          sections={movieResults}
          renderSectionHeader={SectionTitle}
          renderItem={({ item }) => <MovieItem {...item} />}
          keyExtractor={(item) => item.id.toString()}
          listKey="MovieList"
          stickySectionHeadersEnabled={false}
        />
      )}

      {artistResults.length > 0 && (
        <SectionList
          sections={artistResults}
          renderSectionHeader={SectionTitle}
          renderSectionFooter={({ section }) => {
            if (section.data.length === 0) {
              return (
                <Text italic alignSelf="center" mb={2}>
                  {section.title === i18n.t("results_screen.common_cast")
                    ? i18n.t("results_screen.no_common_cast")
                    : i18n.t("results_screen.no_common_crew")}
                </Text>
              );
            }
          }}
          renderItem={({ item }) => <ArtistItem {...item} />}
          keyExtractor={(item) => item.id.toString() + item.as}
          listKey="ArtistList"
          stickySectionHeadersEnabled={false}
        />
      )}

      {loading &&
        Array.from(Array(10)).map((_, index) => <ItemSkeleton key={index} />)}

      <AlertDialog
        isOpen={noResultsAlertVisible}
        onClose={() => setNoResultsAlertVisible(false)}
        animationPreset="fade"
      >
        <AlertDialog.Content>
          <AlertDialog.Header alignItems="center" borderBottomWidth={0}>
            {i18n.t("results_screen.alert_title")}
          </AlertDialog.Header>
          <AlertDialog.Body py={0}>
            <Text textAlign="center">{`${getAllSearchNames()} ${i18n.t(
              findMovies
                ? "results_screen.alert_no_movies"
                : "results_screen.alert_no_artists"
            )}`}</Text>
          </AlertDialog.Body>
          <AlertDialog.Footer justifyContent="center" borderTopWidth={0}>
            <Button
              variant="ghost"
              colorScheme="black"
              onPress={() => setNoResultsAlertVisible(false)}
            >
              OK
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </Box>
  );
};

export default ResultsScreen;
