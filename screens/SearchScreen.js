/**
 * On this screen the user inputs up to 10 actor/director
 * names and makes a search request which sends them to the
 * results screen.
 */

import React, {useState} from 'react';
import {ScrollView, StatusBar, StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign.js';

import MainButton from 'components/MainButton.js';
import i18n from 'i18n';
import {MAX_PEOPLE, spacing} from 'modules/constants.js';
import {autoAnimate, showToastAlert} from 'modules/utils.js';

const statusBarHeight = StatusBar.currentHeight;

const SearchScreen = ({navigation}) => {
   // tracking how many input field are visible (initially two)
   const [peopleList, setPeopleList] = useState([0, 1]);
   // storing the values for each of the input fields
   const [actorNames, setActorNames] = useState(['', '']);

   const addInputField = () => {
      if (peopleList.length < MAX_PEOPLE) {
         autoAnimate();
         setPeopleList(current => [...current, current.length]);
         setActorNames(current => [...current, '']);
      } else {
         showToastAlert(i18n.t('errors.max_people'));
      }
   };

   const removeInputField = (indexToRemove) => {
      autoAnimate();
      // always remove last index, peopleList only tracks the number of people
      setPeopleList(current => current.slice(0, -1));
      setActorNames(current => current.filter((value, index) => index !== indexToRemove));
   };

   const NameInput = ({index}) => (
      <View style={styles.nameInput}>
         <TextInput
            defaultValue={actorNames[index]}
            placeholder={`Actor ${index + 1} Name`}
            onChangeText={text => setActorNames(current => {
               current[index] = text;
               return current;
            })}/>
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
         <ScrollView>
            {peopleList.map(((value, index) => <NameInput key={index} index={index}/>))}
            <MainButton
               text={i18n.t('home_screen.add')}
               style={styles.addButton}
               onPress={addInputField}/>
         </ScrollView>
         <MainButton
            text={i18n.t('home_screen.search')}
            style={styles.searchButton}
            onPress={() => navigation.navigate('ResultsScreen')}/>
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
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'grey',
      borderRadius: 10,
      paddingVertical: 7,
      paddingHorizontal: 15,
      marginBottom: spacing.defaultMargin,
   },

   inputIcon: {
      marginStart: 'auto',
   },

   addButton: {
      backgroundColor: 'lightgreen',
   },

   searchButton: {
      marginTop: 'auto',
   },
});

export default SearchScreen;
