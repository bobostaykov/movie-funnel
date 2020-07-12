/**
 * Component representing an item in the artist results list
 */

import React, {useState} from 'react';
import {View, StyleSheet, Image, Text, TouchableOpacity} from 'react-native';
import {
   DEFAULT_BORDER_RADIUS,
   ITEM_TEXT_LINE_HEIGHT,
   OPACITY_ON_PRESS,
   spacing,
   TMDB_IMAGE_URL
} from 'modules/constants.js';
import i18n from 'i18n';
import {openMovieOrArtistURL} from '../modules/utils.js';

const ArtistItem = ({name, id, photoPath, knownFor, style}) => {
   const [knownForNumberOfLines, setKnownForNumberOfLines] = useState(4);

   return (
      <TouchableOpacity
         activeOpacity={OPACITY_ON_PRESS}
         style={[styles.itemContainer, style]}
         onPress={() => {}}>
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
                  setKnownForNumberOfLines(Math.floor(event.nativeEvent.layout.height / ITEM_TEXT_LINE_HEIGHT))}>
               Known for: {knownFor.join(', ')}
            </Text>
            <TouchableOpacity
               activeOpacity={OPACITY_ON_PRESS}
               style={styles.linkToProfile}
               onPress={() => openMovieOrArtistURL(id, true)}>
               <Text>{i18n.t('search_screen.artist_profile')}</Text>
            </TouchableOpacity>
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
      margin: spacing.defaultMargin,
      marginBottom: spacing.marginS,
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
});

export default ArtistItem;
