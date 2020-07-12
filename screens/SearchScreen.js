/**
 * On this screen the user searches for and chooses up to 10
 * actors/directors and makes a search request which sends them
 * to the results screen. Initially, the 20 most popular actors
 * are shown, ready to be selected.
 */

import React, {useEffect, useState} from 'react';
import {
   ScrollView,
   StatusBar,
   StyleSheet,
   TextInput, ToastAndroid,
   View
} from 'react-native';

import MainButton from 'components/MainButton.js';
import i18n from 'i18n';
import {
   DEFAULT_BORDER_RADIUS,
   MAX_ARTISTS,
   POPULAR_ARTISTS_NUMBER,
   spacing,
   TMDB_POPULAR_ARTISTS_URL
} from 'modules/constants.js';
import {autoAnimate, showToastAlert} from 'modules/utils.js';
import bearerToken from 'assets/bearerToken.json';
import ArtistItem from '../components/ArtistItem.js';

const statusBarHeight = StatusBar.currentHeight;

const SearchScreen = ({navigation}) => {
   // storing the names and IDs of all of the selected actors/directors
   const [selectedArtists, setSelectedArtists] = useState([]);
   const [popularArtists, setPopularArtists] = useState([]);
   const [searchTerm, setSearchTerm] = useState('');
   const [searching, setSearching] = useState(false);
   const [loadingPopular, setLoadingPopular] = useState(false);

   useEffect(() => {
      getPopularArtists();
   }, []);

   /**
    * Fetches most popular artists on TMDb
    */
   const getPopularArtists = () => {
      setLoadingPopular(true);

      fetch(TMDB_POPULAR_ARTISTS_URL, {
         headers: {
            Authorization: 'Bearer ' + bearerToken
         }
      })
         .then(result => {
            autoAnimate();
            setLoadingPopular(false);
            return result.json();
         })
         .then(json => parseResults(json.results))
         .catch(() => {
            setLoadingPopular(false);
            showToastAlert(i18n.t('errors.fetch_popular'), ToastAndroid.LONG);
         });
   };

   /**
    * Extracts relevant information from the results
    */
   const parseResults = (resultsJSON) => {
      const results = [];
      let data;

      for (const result of resultsJSON.slice(0, POPULAR_ARTISTS_NUMBER)) {
         data = {};
         data.name = result.name;
         data.id = result.id;
         data.photoPath = result.profile_path;
         data.knownFor = parseKnownFor(result.known_for);

         results.push(data);
      }

      setPopularArtists(results);
   };

   /**
    * Gets the titles of the 'known for' movies
    */
   const parseKnownFor = (knownForJSON) => {
      const movies = [];

      for (const movie of knownForJSON) {
         movie.media_type === 'movie' ?
            movies.push(movie.title) :
            movies.push(movie.original_name);
      }

      return movies;
   };

   return (
      <View style={styles.homeContainer}>
         <TextInput
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder={i18n.t('search_screen.input_placeholder')}
            style={styles.nameInput}/>
         <ScrollView keyboardShouldPersistTaps='handled'>
            <View></View>
            {!searching && popularArtists.map((item, index) =>
               <ArtistItem
                  name={item.name}
                  id={item.id}
                  photoPath={item.photoPath}
                  knownFor={item.knownFor}
                  key={index}
               />)}
         </ScrollView>
         <MainButton
            text={i18n.t('search_screen.apply_button')}
            style={styles.searchButton}
            onPress={() => navigation.navigate('ResultsScreen', {
               artistIds: '54693,30614',
               artistNames: 'Emma Stone,Ryan Gosling'
            })}/>
      </View>
   );
};

const styles = StyleSheet.create({
   homeContainer: {
      flex: 1,
      marginTop: statusBarHeight,
      padding: spacing.defaultPadding,
   },

   nameInput: {
      borderWidth: 2,
      borderColor: 'grey',
      borderRadius: DEFAULT_BORDER_RADIUS,
      marginBottom: spacing.defaultMargin,
      paddingVertical: 7,
      paddingHorizontal: spacing.defaultPadding,
   },

   inputIcon: {
      marginStart: 'auto',
      marginEnd: spacing.defaultMargin,
   },

   addButton: {
      backgroundColor: 'lightgreen',
   },

   searchButton: {
      marginTop: spacing.defaultMargin,
   },
});

export default SearchScreen;
