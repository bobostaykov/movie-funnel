/**
 * Component representing an item in the movie results list
 */

import React, {useState} from 'react';
import {View, StyleSheet, Image, Text, TouchableOpacity} from 'react-native';

import {
   DEFAULT_BORDER_RADIUS,
   OPACITY_ON_PRESS,
   spacing,
   TMDB_IMAGE_URL
} from 'modules/constants.js';
import {openMovieOrArtistURL} from 'modules/utils.js';
import {ITEM_TEXT_LINE_HEIGHT} from 'modules/constants.js';

const MovieItem = ({title, overview, posterPath, id, rating, style}) => {
   const [ratingTextWidth, setRatingTextWidth] = useState(0);
   const [overviewNumberOfLines, setOverviewNumberOfLines] = useState(4);

   return (
      <TouchableOpacity
         activeOpacity={OPACITY_ON_PRESS}
         style={[styles.itemContainer, style]}
         onPress={() => openMovieOrArtistURL(id)}>
         <Image
            resizeMode='cover'
            source={{uri: TMDB_IMAGE_URL + posterPath}}
            style={styles.posterImage}/>
         <View style={styles.textContainer}>
            <View style={styles.titleAndRatingContainer}>
               <Text
                  style={[styles.title, {marginEnd: ratingTextWidth + 2 * spacing.defaultPadding}]}>
                  {title}
               </Text>
               <Text
                  style={styles.rating}
                  onLayout={event => setRatingTextWidth(event.nativeEvent.layout.width)}>
                  {rating}/10
               </Text>
            </View>
            <View style={styles.overviewContainer}>
               <Text
                  numberOfLines={overviewNumberOfLines}
                  style={styles.overview}
                  onLayout={event =>
                     setOverviewNumberOfLines(Math.floor(event.nativeEvent.layout.height / ITEM_TEXT_LINE_HEIGHT))}>
                  {overview}
               </Text>
            </View>
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
      backgroundColor: '#f3e2d7',
      marginBottom: spacing.marginL,
      overflow: 'hidden',
   },

   posterImage: {
      height: '100%',
      // aspect ratio of regular movie poster images
      aspectRatio: 0.66,
      borderRadius: DEFAULT_BORDER_RADIUS,
   },

   textContainer: {
      flex: 1,
   },

   titleAndRatingContainer: {
      flexDirection: 'row',
   },

   title: {
      width: 'auto',
      height: 'auto',
      fontWeight: 'bold',
      fontSize: 20,
      margin: spacing.defaultMargin,
      marginBottom: spacing.marginS,
   },

   rating: {
      marginStart: 'auto',
      fontWeight: 'bold',
      fontSize: 20,
      margin: spacing.defaultMargin,
      marginBottom: spacing.marginS,
   },

   overviewContainer: {
      flex: 1,
      flexDirection: 'row',
      marginBottom: 12,
   },

   overview: {
      flex: 1,
      flexWrap: 'wrap',
      marginHorizontal: spacing.defaultMargin,
      height: '100%',
      lineHeight: ITEM_TEXT_LINE_HEIGHT,
   },
});

export default MovieItem;
