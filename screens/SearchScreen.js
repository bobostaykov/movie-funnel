/**
 * On this screen the user searches for and chooses up to 10
 * actors/directors and makes a search request which sends them
 * to the results screen. Initially, the 20 most popular actors
 * are shown, ready to be selected.
 */

import React, {useEffect, useState} from 'react';
import {
   Image,
   SafeAreaView,
   ScrollView,
   StatusBar,
   StyleSheet, Text,
   TextInput, ToastAndroid,
   View
} from 'react-native';

import MainButton from 'components/MainButton.js';
import ArtistItem from 'components/ArtistItem.js';
import i18n from 'i18n';
import bearerToken from 'assets/bearerToken.json';
import {
   DEFAULT_BORDER_RADIUS,
   POPULAR_ARTISTS_NUMBER,
   spacing,
   TMDB_POPULAR_ARTISTS_URL
} from 'modules/constants.js';
import {autoAnimate, showToastAlert} from 'modules/utils.js';
import {globalStyles} from 'modules/globalStyles.js';

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

   /**
    * Called on artist item press
    */
   const onSelectArtist = (id, name, selected) => {
      selected ?
         // add to list
         setSelectedArtists(current => [...current, {id, name}]) :
         // remove from list
         setSelectedArtists(current => current.filter(item => item.id !== id));
   };

   /**
    * Called on "apply" button press
    */
   const applyHandler = () => {
      if (selectedArtists.length < 2 || selectedArtists.length > 10) {
         showToastAlert(i18n.t('errors.nothing_selected'));
         return;
      }

      navigation.navigate('ResultsScreen', {
         artistIds: getArtistIds(),
         artistNames: getArtistNames(),
      });
   };

   const getArtistIds = () => {
      const ids = [];
      for (const artist of selectedArtists)
         ids.push(artist.id)
      return ids.join(',');
   };

   const getArtistNames = () => {
      const names = [];
      for (const artist of selectedArtists)
         names.push(artist.name)
      return names.join(',');
   };

   return (
      <SafeAreaView style={styles.homeContainer}>
         <TextInput
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder={i18n.t('search_screen.input_placeholder')}
            style={styles.nameInput}/>
         <ScrollView keyboardShouldPersistTaps='handled'>
            {loadingPopular ?
               <Text style={styles.title}>{i18n.t('search_screen.title_loading_popular')}</Text> :
               <Text style={styles.title}>{i18n.t('search_screen.title_showing_popular')}</Text>}
            {!searching && popularArtists.map((item, index) =>
               <ArtistItem
                  name={item.name}
                  id={item.id}
                  photoPath={item.photoPath}
                  knownFor={item.knownFor}
                  onPress={onSelectArtist}
                  key={index}
               />)}
         </ScrollView>
         <MainButton
            text={i18n.t('search_screen.apply_button')}
            style={styles.searchButton}
            onPress={applyHandler}/>
         {loadingPopular && <Image
            source={require('assets/loading_indicator.gif')}
            style={globalStyles.loadingIndicator}/>}
      </SafeAreaView>
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

   title: {
      fontWeight: 'bold',
      fontSize: 26,
      alignSelf: 'center',
      marginBottom: spacing.marginS,
      textAlign: 'center',
   },

   searchButton: {
      marginTop: spacing.defaultMargin,
   },
});

export default SearchScreen;
