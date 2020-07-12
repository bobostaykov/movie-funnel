/**
 * On this screen the resulting list of movies is shown with
 * information and a link to the corresponding TMDB page
 */

import React, {useEffect, useState} from 'react';
import {
   View,
   StyleSheet,
   Text,
   ToastAndroid,
   ScrollView,
   Image,
   Dimensions,
   StatusBar,
   TouchableOpacity
} from 'react-native';

import MovieItem from 'components/MovieItem.js';
import i18n from 'i18n';
import bearerToken from 'assets/bearerToken.json';
import {OPACITY_ON_PRESS, spacing, TMDB_API_MOVIES_URL} from 'modules/constants.js';
import {autoAnimate, showToastAlert} from 'modules/utils.js';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const statusBarHeight = StatusBar.currentHeight;
const loadingIndicatorDiameter = 60;

const ResultsScreen = ({navigation, route}) => {
   const [movies, setMovies] = useState([]);
   const [artistNames, setArtistNames] = useState([]);
   const [loading, setLoading] = useState(false);
   // are all artist names shown (when more than 2)
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
         .then(result => {
            autoAnimate();
            setLoading(false);
            return result.json();
         })
         .then(json => parseResults(json.results))
         .catch(() => {
            setLoading(false);
            navigation.pop();
            showToastAlert(i18n.t('errors.fetchResults'), ToastAndroid.LONG);
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

      setMovies(results);
   };

   const parseArtistNames = () => {
      const artists = [];

      for (const name of route.params.artistNames.split(','))
         artists.push(name);

      setArtistNames(artists);
   };

   const toggleArtistNamesExpanded = () => {
      autoAnimate();
      setArtistNamesExpanded(current => !current);
   };


   // --- COMPONENTS ---

   const ExpandedArtistNames = () => (
      <Text style={styles.subtitle}>
         {
            // deliberately not using string templates as is this case it is much less readable
            artistNames.length === 2 ?
               artistNames[0]
               + ' '
               + i18n.t('results_screen.subtitle_and')
               + ' '
               + artistNames[1] :

               artistNames.slice(0, -1).join(', ')
               + ' '
               + i18n.t('results_screen.subtitle_and')
               + ' '
               + artistNames[artistNames.length - 1]
         }
         {artistNames.length > 2 && <ToggleButton/>}
      </Text>
   );

   const CollapsedArtistNames = () => (
      <Text style={styles.subtitle}>
         {
            // deliberately not using string templates as is this case it is much less readable
            artistNames[0]
            + ', '
            + artistNames[1]
            + ' '
            + i18n.t('results_screen.subtitle_and')
            + ' '
            + (artistNames.length - 2)
            + ' '
            + (artistNames.length === 3 ?
               i18n.t('results_screen.subtitle_other') :
               i18n.t('results_screen.subtitle_others'))
         }
         {artistNames.length > 2 && <ToggleButton/>}
      </Text>
   );

   const ToggleButton = () => (
      <Text style={styles.toggleButton} onPress={toggleArtistNamesExpanded}>{
         '     ' +
         (artistNamesExpanded ?
            i18n.t('results_screen.collapse_names') :
            i18n.t('results_screen.expand_names'))
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
      <View style={styles.pageContainer}>
         <ScrollView contentContainerStyle={styles.resultsContainer}>
            {loading ? <TitleSearching/> : <TitleResults/>}
            {movies.map((item, index) =>
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
            style={styles.loadingIndicator}/>}
      </View>
   );
};

const styles = StyleSheet.create({
   pageContainer: {
      flex: 1,
      paddingTop: statusBarHeight,
      paddingHorizontal: spacing.defaultPadding,
   },

   titleResults: {
      width: '100%',
      alignItems: 'center',
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
      marginBottom: spacing.defaultMargin,
      textAlign: 'center',
   },

   toggleButton: {
      color: 'blue',
   },

   resultsContainer: {
      alignItems: 'center',
      width: '100%',
   },

   loadingIndicator: {
      position: 'absolute',
      top: (windowHeight - loadingIndicatorDiameter) / 2,
      start: (windowWidth - loadingIndicatorDiameter) / 2,
      width: loadingIndicatorDiameter,
      height: loadingIndicatorDiameter,
   },
});

export default ResultsScreen;
