/**
 * On this screen the resulting list of movies is shown with
 * information and a link to the corresponding TMDB page
 */

import React, {useEffect, useState} from 'react';
import {
   Dimensions,
   Image,
   SafeAreaView,
   ScrollView,
   StatusBar,
   StyleSheet,
   Text,
   ToastAndroid,
   View,
} from 'react-native';

import MovieItem from 'components/MovieItem.js';
import i18n from 'i18n';
import bearerToken from 'assets/bearerToken.json';
import {spacing, TMDB_API_MOVIES_URL} from 'modules/constants.js';
import {autoAnimate, showToastAlert} from 'modules/utils.js';
import {globalStyles} from 'modules/globalStyles.js';

const statusBarHeight = StatusBar.currentHeight;
const windowHeight = Dimensions.get('window').height;

const ResultsScreen = ({navigation, route}) => {
   // a list of fetched results (common movies of selected artists)
   const [movieResults, setMovieResults] = useState([]);
   // a list of selected artists' names to show above results
   const [artistNames, setArtistNames] = useState([]);
   // whether fetching is in progress
   const [loading, setLoading] = useState(false);
   /*
    whether results are fully fetched, used to show "no results"
    text with a delay, otherwise it shows for a moment before the
    results appear
   */
   const [resultsFetched, setResultsFetched] = useState(false);
   // whether all artist names are shown (when more than 2)
   const [artistNamesExpanded, setArtistNamesExpanded] = useState(false);

   useEffect(() => {
      parseArtistNames();
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
            Authorization: 'Bearer ' + bearerToken
         }
      })
         .then(result => result.json())
         .then(json => {
            autoAnimate();
            setLoading(false);
            setTimeout(() => {
               autoAnimate();
               setResultsFetched(true);
            }, 500)
            return parseResults(json.results);
         })
         .catch(() => {
            setLoading(false);
            navigation.pop();
            showToastAlert(i18n.t('errors.fetch_results'), ToastAndroid.LONG);
         });
   };

   /**
    * Extract the relevant information from the results
    */
   const parseResults = (resultsJSON) => {
      const results = [];
      let resultData;

      for (const result of resultsJSON) {
         resultData = {};
         resultData.title = result.title;
         resultData.overview = result.overview;
         resultData.posterPath = result.poster_path;
         resultData.id = result.id;
         resultData.rating = result.vote_average;

         results.push(resultData);
      }

      setMovieResults(results);
   };

   const parseArtistNames = () => {
      const artists = [];

      for (const name of route.params.artistNames.split(','))
         artists.push(name);

      setArtistNames(artists);
   };

   /**
    * Toggles the expanded/collapsed view of the artist names
    */
   const toggleArtistNamesExpanded = () => {
      autoAnimate();
      setArtistNamesExpanded(current => !current);
   };

   /**
    * Returns a string of all artists' names joined with commas
    */
   const getAllArtistsNames = () => {
      // deliberately not using string templates as is this case it is much less readable
      return artistNames.length === 2 ?
         artistNames[0]
         + ' '
         + i18n.t('helpers.and')
         + ' '
         + artistNames[1] :

         artistNames.slice(0, -1).join(', ')
         + ' '
         + i18n.t('helpers.and')
         + ' '
         + artistNames[artistNames.length - 1];
   };

   /**
    * Returns a string of the first two artists' names
    * and an indicator of how many are hidden
    */
   const getArtistsNamesShortened = () => {
      // deliberately not using string templates as is this case it is much less readable
      return artistNames[0]
      + ', '
      + artistNames[1]
      + ' '
      + i18n.t('helpers.and')
      + ' '
      + (artistNames.length - 2)
      + ' '
      + (artistNames.length === 3 ?
         i18n.t('helpers.other') :
         i18n.t('helpers.others'))
   };


   // --- COMPONENTS ---

   const ExpandedArtistNames = () => (
      <View>
         <Text style={styles.subtitle}>
            {getAllArtistsNames()}
         </Text>
         {artistNames.length > 2 && <ToggleButton/>}
      </View>
   );

   const CollapsedArtistNames = () => (
      <View>
         <Text style={styles.subtitle}>
            {getArtistsNamesShortened()}
         </Text>
         {artistNames.length > 2 && <ToggleButton/>}
      </View>
   );

   const ToggleButton = () => (
      <Text style={styles.toggleButton} onPress={toggleArtistNamesExpanded}>{
         artistNamesExpanded ?
            i18n.t('results_screen.collapse_names') :
            i18n.t('results_screen.expand_names')
      }</Text>
   );

   const TitleResults = () => (
      <View style={styles.titleResults}>
         <Text style={styles.title}>{i18n.t('results_screen.title_common_movies')}</Text>
         {artistNamesExpanded || artistNames.length === 2 ? <ExpandedArtistNames/> : <CollapsedArtistNames/>}
      </View>
   );

   const TitleSearching = () => (
      <Text style={styles.title}>{i18n.t('results_screen.title_searching')}</Text>
   );

   return (
      <SafeAreaView style={styles.pageContainer}>
         <ScrollView contentContainerStyle={styles.resultsContainer}>
            {loading ?
               <TitleSearching/> :
               movieResults.length > 0 && <TitleResults/>}
            {movieResults.map((item, index) =>
               <MovieItem
                  title={item.title}
                  overview={item.overview}
                  posterPath={item.posterPath}
                  id={item.id}
                  rating={item.rating}
                  key={index}
               />)}
         </ScrollView>
         {loading && <Image
            source={require('assets/loading_indicator.gif')}
            style={globalStyles.loadingIndicator}/>}
         {resultsFetched && movieResults.length === 0 &&
         <Text style={styles.noResultsText}>{
            getAllArtistsNames()
            + ' '
            + i18n.t('results_screen.no_common_movies')
         }</Text>}
      </SafeAreaView>
   );
};

const styles = StyleSheet.create({
   pageContainer: {
      flex: 1,
      paddingTop: statusBarHeight,
      paddingHorizontal: spacing.defaultPadding,
   },

   titleResults: {
      alignItems: 'center',
      width: '100%',
      marginBottom: spacing.defaultMargin,
   },

   title: {
      fontWeight: 'bold',
      fontSize: 30,
   },

   subtitle: {
      width: 'auto',
      height: 'auto',
      marginHorizontal: '15%',
      fontSize: 15,
      textAlign: 'center',
   },

   toggleButton: {
      alignSelf: 'center',
      color: 'blue',
      marginBottom: spacing.defaultMargin,
   },

   resultsContainer: {
      alignItems: 'center',
      width: '100%',
   },

   noResultsText: {
      alignSelf: 'center',
      position: 'absolute',
      top: windowHeight / 2,
      textAlign: 'center',
   },
});

export default ResultsScreen;
