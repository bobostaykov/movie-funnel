/**
 * On this screen the user inputs up to 10 actor/director
 * names and makes a search request which sends them to the
 * results screen.
 */

import React, {useRef, useState} from 'react';
import {
   ScrollView,
   StatusBar,
   StyleSheet,
   TextInput,
   TouchableOpacity,
   View
} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign.js';

import MainButton from 'components/MainButton.js';
import i18n from 'i18n';
import {MAX_PEOPLE, spacing} from 'modules/constants.js';
import {autoAnimate} from 'modules/utils.js';

const statusBarHeight = StatusBar.currentHeight;

const SearchScreen = ({navigation}) => {
   // storing the values for each of the input fields
   const [artistNames, setArtistNames] = useState(['', '']);
   const scrollView = useRef(null);


   /**
    * Always make newly added input visible
    */
   const scrollToBottom = () => scrollView.current.scrollToEnd();

   const addInputField = () => {
      if (artistNames.length < MAX_PEOPLE) {
         autoAnimate();
         setArtistNames(current => [...current, '']);
         // wait for animation to finish
         setTimeout(scrollToBottom, 500);
      }
   };

   const removeInputField = (indexToRemove) => {
      autoAnimate();
      setArtistNames(current =>
         current.filter((value, index) => index !== indexToRemove));
   };

   const NameInput = ({value, index}) => (
      <View style={styles.nameInputContainer}>
         <TextInput
            defaultValue={value}
            placeholder={`Actor ${index + 1} Name`}
            onChangeText={text => setArtistNames(current => {
               current[index] = text;
               return current;
            })}
            style={styles.nameInput}/>
         {/* text inputs count should not be less than 2 */}
         {index > 1 && <TouchableOpacity
            style={styles.inputIcon}
            hitSlop={{top: 10, right: 10, bottom: 10, left: 10}}
            onPress={() => removeInputField(index)}>
            <Icon name='minuscircle' size={16} color='grey'/>
         </TouchableOpacity>}
      </View>
   );

   return (
      <View style={styles.homeContainer}>
         <ScrollView keyboardShouldPersistTaps='handled' ref={scrollView}>
            {artistNames.map(((value, index) => <NameInput value={value} index={index} key={index}/>))}
            {artistNames.length < 10 && <MainButton
               text={i18n.t('home_screen.add')}
               style={styles.addButton}
               onPress={addInputField}/>}
         </ScrollView>
         <MainButton
            text={i18n.t('home_screen.search')}
            style={styles.searchButton}
            onPress={() => navigation.navigate('ResultsScreen', {actorNames: artistNames})}/>
      </View>
   );
};

const styles = StyleSheet.create({
   homeContainer: {
      flex: 1,
      marginTop: statusBarHeight,
      padding: spacing.defaultPadding,
   },

   nameInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'grey',
      borderRadius: 10,
      marginBottom: spacing.defaultMargin,
   },

   nameInput: {
      flex: 1,
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
