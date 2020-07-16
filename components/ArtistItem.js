/**
 * Component representing an item in the actors
 * and directors results list
 */

import React, {useState} from 'react';
import {View, StyleSheet, Image, Text, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {
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
                  Known for: {knownFor.join(', ')}
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
      opacity: 0.3,
      backgroundColor: 'blue',
   },

   checkIcon: {
      position: 'absolute',
      top: spacing.marginS,
      end: spacing.marginS,
   },
});

export default ArtistItem;
