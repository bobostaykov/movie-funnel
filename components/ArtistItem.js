/**
 * Component representing an item in the actors
 * and directors results list
 */

import React, {useEffect, useState} from 'react';
import {DeviceEventEmitter, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {
   CLEAR_SELECTION_EVENT,
   DEFAULT_BORDER_RADIUS,
   ITEM_TEXT_LINE_HEIGHT,
   OPACITY_ON_PRESS,
   spacing,
   TMDB_IMAGE_URL
} from 'modules/constants.js';
import i18n from 'i18n';
import {openMovieOrArtistURL} from 'modules/utils.js';

const ArtistItem = ({name, id, photoPath, knownFor, style, onPress}) => {
   const [knownForNumberOfLines, setKnownForNumberOfLines] = useState(2);
   const [selected, setSelected] = useState(false);

   useEffect(() => {
      const subscription = DeviceEventEmitter.addListener(
         CLEAR_SELECTION_EVENT,
         () => setSelected(false)
      );

      return () => DeviceEventEmitter.removeSubscription(subscription);
   }, []);

   if (!id)
      return null;

   return (
      <TouchableOpacity
         activeOpacity={OPACITY_ON_PRESS}
         onPress={() => {
            setSelected(current => !current);
            onPress(id, name, !selected);
         }}>
         <View style={[styles.itemContainer, style]}>
            <Image
               resizeMode='cover'
               source={{uri: TMDB_IMAGE_URL + photoPath}}
               style={styles.image}/>
            <View style={styles.textContainer}>
               <Text style={styles.name}>{name}</Text>
               <Text
                  numberOfLines={knownForNumberOfLines}
                  style={styles.knownFor}
                  onLayout={event =>
                     setKnownForNumberOfLines(Math.floor((event.nativeEvent.layout.height - 10) / ITEM_TEXT_LINE_HEIGHT))}>
                  {i18n.t('misc.known_for') + knownFor.join(', ')}
               </Text>
               <TouchableOpacity
                  activeOpacity={OPACITY_ON_PRESS}
                  style={styles.linkToProfile}
                  onPress={() => openMovieOrArtistURL(id, true)}>
                  <Text>{i18n.t('search_screen.artist_profile')}</Text>
               </TouchableOpacity>
            </View>
            {selected && <View pointerEvents='none' style={styles.overlay}/>}
            {selected && <Icon
               name='check-circle'
               size={24}
               color='lightgreen'
               style={styles.checkIcon}/>}
         </View>
      </TouchableOpacity>
   );
};

const styles = StyleSheet.create({
   itemContainer: {
      height: 150,
      width: '100%',
      flexDirection: 'row',
      borderRadius: DEFAULT_BORDER_RADIUS,
      backgroundColor: '#dbe3fa',
      marginBottom: spacing.marginL,
      overflow: 'hidden',
   },

   image: {
      height: '100%',
      // aspect ratio of regular movie poster images
      aspectRatio: 0.66,
      borderRadius: DEFAULT_BORDER_RADIUS,
   },

   textContainer: {
      flex: 1,
   },

   name: {
      width: 'auto',
      height: 'auto',
      fontWeight: 'bold',
      fontSize: 20,
      marginHorizontal: spacing.defaultMargin,
      marginVertical: spacing.marginS,
   },

   knownFor: {
      flex: 1,
      flexWrap: 'wrap',
      height: '100%',
      marginHorizontal: spacing.defaultMargin,
      lineHeight: ITEM_TEXT_LINE_HEIGHT,
   },

   linkToProfile: {
      backgroundColor: '#c3c3ea',
      borderRadius: 7,
      margin: spacing.marginS,
      marginStart: 'auto',
      paddingHorizontal: spacing.paddingS,
      paddingVertical: 5,
   },

   overlay: {
      width: '100%',
      height: '100%',
      position: 'absolute',
      start: 0,
      top: 0,
      opacity: 0.25,
      backgroundColor: 'blue',
   },

   checkIcon: {
      position: 'absolute',
      top: spacing.marginS,
      end: spacing.marginS,
   },
});

export default ArtistItem;
