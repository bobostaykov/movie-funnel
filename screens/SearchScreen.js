/**
 * On this screen the user searches for and chooses up to 10
 * actors/directors and makes a search request which sends them
 * to the results screen. Initially, the 20 most popular actors
 * are shown, ready to be selected.
 */

import React, {useEffect, useRef, useState} from 'react';
import {
   DeviceEventEmitter,
   Image,
   SafeAreaView,
   StatusBar,
   StyleSheet,
   Text,
   TextInput,
   ToastAndroid,
   View,
   Keyboard, TouchableOpacity, Dimensions, Animated
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import MainButton from 'components/MainButton.js';
import ArtistItem from 'components/ArtistItem.js';
import i18n from 'i18n';
import bearerToken from 'assets/bearerToken.json';
import {
   ANIMATION_DURATION,
   CLEAR_SELECTION_EVENT,
   DEFAULT_BORDER_RADIUS, DEFAULT_HIT_SLOP, MAX_RESULTS_SHOWN, MORE_THAN_20_SEARCH_RESULTS,
   POPULAR_ARTISTS_NUMBER,
   spacing, TMDB_API_ARTISTS_URL,
   TMDB_POPULAR_ARTISTS_URL
} from 'modules/constants.js';
import {autoAnimate, showToastAlert} from 'modules/utils.js';
import {globalStyles} from 'modules/globalStyles.js';

const windowWidth = Dimensions.get('window').width;
const statusBarHeight = StatusBar.currentHeight;
const backButtonMargin = 6;


const SearchScreen = ({navigation}) => {
   // storing the names and IDs of all of the selected actors/directors
   const [selectedArtists, setSelectedArtists] = useState([]);
   // list of fetched popular artists to show initially on search screen
   const [popularArtists, setPopularArtists] = useState([]);
   // search term, value changing as user types
   const [intermediateSearchValue, setIntermediateSearchValue] = useState('');
   // value of search field after pressing search button
   const [searchTerm, setSearchTerm] = useState('');
   // whether the user is in "search" mode
   const [searching, setSearching] = useState(false);
   /*
    whether popular artists are on screen, separate from "searching"
    variable to make the exit from "search" mode smooth
   */
   const [popularVisible, setPopularVisible] = useState(true);
   // list of fetched artist results
   const [searchResults, setSearchResults] = useState([]);
   // whether fetching is in progress
   const [loading, setLoading] = useState(false);
   // whether keyboard is currently on screen
   const [keyboardVisible, setKeyboardVisible] = useState(false);
   // search button width, calculated on button layout
   const [backButtonWidth, setBackButtonWidth] = useState(0);
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

      const didShowSubscription = Keyboard.addListener('keyboardDidShow', () => {
         autoAnimate();
         setKeyboardVisible(true);
      });
      const didHideSubscription = Keyboard.addListener('keyboardDidHide', () => {
         autoAnimate();
         setKeyboardVisible(false);
      });

      return () => {
         Keyboard.removeSubscription(didShowSubscription);
         Keyboard.removeSubscription(didHideSubscription);
      };
   }, []);

   useEffect(() => {
      // console.log('searchResults:', searchResults);
      // console.log('popularArtists:', popularArtists);
   });


   // --- FUNCTIONS ---

   /**
    * Fetches most popular artists on TMDb
    */
   const fetchPopularArtists = () => {
      setLoading(true);

      fetch(TMDB_POPULAR_ARTISTS_URL, {
         headers: {
            Authorization: 'Bearer ' + bearerToken
         }
      })
         .then(result => {
            autoAnimate();
            setLoading(false);
            return result.json();
         })
         .then(json => parseArtistResults(json.results, json.total_results, true))
         .catch(() => {
            showToastAlert(i18n.t('errors.fetch_popular'), ToastAndroid.LONG);
            autoAnimate();
            setLoading(false);
            setSearching(false);
            setPopularVisible(true);
         });
   };

   /**
    * Fetch actor and director results for search term
    */
   const fetchResultsForSearchTerm = (term) => {
      autoAnimate();
      setLoading(true);

      fetch(TMDB_API_ARTISTS_URL + encodeURI(term), {
         headers: {
            Authorization: 'Bearer ' + bearerToken
         }
      })
         .then(result => {
            autoAnimate();
            setLoading(false);
            setTimeout(() => {
               autoAnimate();
               setResultsFetched(true);
            }, 500);
            return result.json();
         })
         .then(json => parseArtistResults(json.results, json.total_results))
         .catch(() => {
            showToastAlert(i18n.t('errors.fetch_search_results'), ToastAndroid.LONG);
            autoAnimate();
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

      for (const result of resultsJSON.slice(0, isPopular ? POPULAR_ARTISTS_NUMBER : MAX_RESULTS_SHOWN)) {
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
         if (resultCount > 20)
            results.push({name: MORE_THAN_20_SEARCH_RESULTS});
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
         movie.media_type === 'movie' ?
            movies.push(movie.title) :
            movies.push(movie.original_name);
      }

      return movies;
   };

   /**
    * Called on artist item press
    */
   const selectArtistHandler = (id, name, selected) => {
      selected ?
         // add to list
         setSelectedArtists(current => [...current, {id, name}]) :
         // remove from list
         setSelectedArtists(current => current.filter(item => item.id !== id));
   };

   /**
    * Called on "back" button press. Exits "search" mode and shows
    * initial screen with popular artists. Fades artist items out
    * and in to make the transition smooth.
    */
   const backHandler = () => {
      Keyboard.dismiss();

      autoAnimate();
      setSearching(false);
      setIntermediateSearchValue('');

      setTimeout(() => {
         autoAnimate();
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
         })
      ]).start();
   };

   /**
    * Called on "clear" icon press
    */
   const clearSearchHandler = () => {
      autoAnimate()
      setIntermediateSearchValue('');
      nameInput.current.focus();
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
         artistIds: getSelectedArtistIds(),
         artistNames: getSelectedArtistNames(),
      });
   };

   /**
    * Called on "clear" button press
    */
   const clearSelectionHandler = () => {
      autoAnimate();
      setSelectedArtists([]);
      DeviceEventEmitter.emit(CLEAR_SELECTION_EVENT);
   };

   /**
    * Called on "search" button and keyboard "return" key press
    */
   const searchHandler = () => {
      if (!intermediateSearchValue.trim()) {
         showToastAlert(i18n.t('errors.empty_search'));
         setIntermediateSearchValue('');
         return;
      }

      Keyboard.dismiss();

      autoAnimate();
      setSearching(true);
      setPopularVisible(false);
      setSearchTerm(intermediateSearchValue);

      fetchResultsForSearchTerm(intermediateSearchValue);
   };

   const getSelectedArtistIds = () => {
      const ids = [];
      for (const artist of selectedArtists)
         ids.push(artist.id);
      return ids.join(',');
   };

   const getSelectedArtistNames = () => {
      const names = [];
      for (const artist of selectedArtists)
         names.push(artist.name);
      return names.join(',');
   };

   const scrollResultsToTop = () => {
      scrollView.current?.scrollTo({y: 0});
   };

   // invisible when keyboard shown or no results
   const isBottomBarVisible = () =>
      !keyboardVisible &&
      ((searching && searchResults.length > 0) ||
         !searching);

   const isNoResultsVisible = () =>
      searching &&
      resultsFetched &&
      searchResults.length === 0;

   const isHintShowing20Visible = () =>
      searching &&
      !loading &&
      searchResults[searchResults.length - 1] &&
      searchResults[searchResults.length - 1].name === MORE_THAN_20_SEARCH_RESULTS;


   // --- COMPONENTS ---

   /**
    * Title text shown when loading
    */
   const TitleLoading = () => searching ?
      <Text style={styles.title}>{i18n.t('search_screen.title_loading_results')}</Text> :
      <Text style={styles.title}>{i18n.t('search_screen.title_loading_popular')}</Text>;

   /**
    * Title text shown when showing popular artists/search results
    */
   const TitleNotLoading = () => searching ?
      <Text style={styles.title}>
         {searchResults.length > 0 && i18n.t('search_screen.title_showing_results') + ' "' + searchTerm + '":'}
      </Text> :
      <Text style={styles.title}>{i18n.t('search_screen.title_showing_popular')}</Text>;

   /**
    * Image and text telling the user no results were found
    */
   const NoResults = () => (
      <View style={styles.noResultsContainer}>
         <Image
            resizeMode='contain'
            style={styles.noResultsImage}
            source={require('assets/no_results.png')}/>
         <Text style={styles.noResultsText}>
            {i18n.t('errors.no_results') + ' "' + searchTerm + '"'}
         </Text>
      </View>
   );


   return (
      <SafeAreaView style={styles.outerContainer}>
         {/* search bar */}
         <View style={styles.searchContainer}>
            <TextInput
               ref={nameInput}
               value={intermediateSearchValue}
               onChangeText={setIntermediateSearchValue}
               placeholder={i18n.t('search_screen.input_placeholder')}
               returnKeyType='search'
               onSubmitEditing={searchHandler}
               style={[
                  styles.nameInput,
                  {paddingStart: searching ? backButtonWidth + backButtonMargin * 2 + 4 : spacing.defaultPadding}
               ]}/>

            {searching && <MainButton
               icon={<Icon name='arrow-back' size={20} color='black'/>}
               getWidth={setBackButtonWidth}
               // make "search" and "back" buttons the same size
               style={styles.backButton}
               onPress={backHandler}/>}

            {searching && <TouchableOpacity
               onPress={clearSearchHandler}
               hitSlop={DEFAULT_HIT_SLOP}
               style={styles.clearSearchIcon}>
               <Icon
                  name='backspace'
                  size={20}
                  color='grey'/>
            </TouchableOpacity>}

            {(!searching || intermediateSearchValue !== searchTerm) && <MainButton
               icon={<Icon name='search' size={20} color='black'/>}
               style={styles.searchButton}
               onPress={searchHandler}/>}
         </View>

         {/* main container */}
         <Animated.ScrollView
            ref={scrollView}
            style={{opacity: animatedOpacity}}
            contentContainerStyle={styles.resultsContainer}
            keyboardShouldPersistTaps='handled'>

            {loading ? <View><TitleLoading/></View> : <View><TitleNotLoading/></View>}

            {popularVisible && !loading && popularArtists.map((item, index) =>
               <ArtistItem
                  name={item.name}
                  id={item.id}
                  photoPath={item.photoPath}
                  knownFor={item.knownFor}
                  onPress={selectArtistHandler}
                  key={index}
               />)}

            {!popularVisible && !loading && searchResults.map((item, index) =>
               <ArtistItem
                  name={item.name}
                  id={item.id}
                  photoPath={item.photoPath}
                  knownFor={item.knownFor}
                  onPress={selectArtistHandler}
                  key={index}
               />)}

            {isHintShowing20Visible() && <Text style={styles.hintMoreThan20Results}>
               {i18n.t('search_screen.hint_showing_20_results')}
            </Text>}

            {isNoResultsVisible() && <NoResults/>}
         </Animated.ScrollView>

         {/* bottom bar */}
         {isBottomBarVisible() && <View style={styles.bottomButtonsContainer}>
            <MainButton
               text={i18n.t('search_screen.clear_selection_button')}
               style={styles.clearSelectionButton}
               onPress={clearSelectionHandler}/>
            <MainButton
               text={i18n.t('search_screen.apply_button')}
               style={styles.applyButton}
               onPress={applyHandler}/>
            <View style={styles.artistCounterContainer}>
               <Text style={styles.artistCounterText}>
                  {selectedArtists.length}
               </Text>
            </View>
         </View>}

         {loading && <Image
            source={require('assets/loading_indicator.gif')}
            style={globalStyles.loadingIndicator}/>}
      </SafeAreaView>
   );
};

const styles = StyleSheet.create({
   outerContainer: {
      flex: 1,
      justifyContent: 'center',
      marginTop: statusBarHeight,
      padding: spacing.defaultPadding,
      paddingTop: 5,
   },

   searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.marginS,
   },

   nameInput: {
      flex: 1,
      borderWidth: 2,
      borderColor: 'grey',
      borderRadius: DEFAULT_BORDER_RADIUS,
      paddingVertical: 10,
      paddingEnd: spacing.defaultPadding,
   },

   backButton: {
      position: 'absolute',
      start: backButtonMargin,
      padding: 8,
      borderRadius: 6,
      backgroundColor: '#99e2c8',
   },

   searchButton: {
      position: 'absolute',
      end: backButtonMargin,
      padding: 8,
      borderRadius: 6,
      backgroundColor: '#99e2c8',
   },

   clearSearchIcon: {
      position: 'absolute',
      end: spacing.defaultMargin,
   },

   resultsContainer: {
      alignItems: 'center',
      // flex: 1,
      justifyContent: 'center',
   },

   title: {
      fontWeight: 'bold',
      fontSize: 26,
      alignSelf: 'center',
      marginBottom: spacing.marginS,
      textAlign: 'center',
   },

   bottomButtonsContainer: {
      flexDirection: 'row',
      marginTop: spacing.defaultMargin,
   },

   clearSelectionButton: {
      backgroundColor: 'red',
      marginEnd: spacing.marginS,
      paddingHorizontal: spacing.defaultPadding,
   },

   applyButton: {
      flex: 1,
   },

   artistCounterContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      top: -10,
      end: -10,
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: '#99e2c8'
   },

   artistCounterText: {
      fontWeight: 'bold',
   },

   hintMoreThan20Results: {
      marginTop: -10,
   },

   noResultsContainer: {
      width: '100%',
      alignItems: 'center',
      marginBottom: '50%',
   },

   noResultsImage: {
      width: windowWidth,
   },

   noResultsText: {
      fontWeight: 'bold',
      fontSize: 17,
   },
});

export default SearchScreen;
