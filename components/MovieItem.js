/**
 * Component representing an item in the movie results list
 */

import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import {
  DEFAULT_BORDER_RADIUS,
  ITEM_TEXT_LINE_HEIGHT,
  OPACITY_ON_PRESS,
  spacing,
  TMDB_IMAGE_URL,
} from "modules/constants.js";
import { openMovieOrArtistURL } from "modules/utils.js";

const ITEM_HEIGHT = 150;
// aspect ratio of regular movie poster images
const IMAGE_RATIO = 0.66;

const MovieItem = ({ title, overview, posterPath, id, rating, style }) => {
  // the width of the rating text, calculated on layout and used to add proper margin to title
  const [ratingTextWidth, setRatingTextWidth] = useState(0);
  // the number of lines which the overview text can span, calculated on layout
  const [overviewNumberOfLines, setOverviewNumberOfLines] = useState(4);
  // whether a movie poster photo is provided
  const [hasPhoto, setHasPhoto] = useState(true);

  useEffect(() => {
    checkHasPhoto(TMDB_IMAGE_URL + posterPath);
  }, []);

  /**
   * Checks if a poster photo for the movie is provided
   */
  const checkHasPhoto = (url) => {
    fetch(url)
      .then((result) => {
        setHasPhoto(result.status !== 404);
      })
      .catch(() => setHasPhoto(false));
  };

  /**
   * Movie poster photo fetched from TMDb
   */
  const MoviePosterPhoto = () => (
    <Image
      resizeMode="cover"
      source={{ uri: TMDB_IMAGE_URL + posterPath }}
      style={styles.posterPhoto}
    />
  );

  /**
   * Dummy image used in case no poster photo is provided
   */
  const DummyImage = () => (
    <Image
      resizeMode="cover"
      source={require("assets/dummy_movie_image.png")}
      style={styles.dummyImage}
    />
  );

  return (
    <TouchableOpacity
      activeOpacity={OPACITY_ON_PRESS}
      style={[styles.itemContainer, style]}
      onPress={() => openMovieOrArtistURL(id)}
    >
      {hasPhoto ? <MoviePosterPhoto /> : <DummyImage />}
      <View style={styles.textContainer}>
        <View style={styles.titleAndRatingContainer}>
          <Text
            style={[
              styles.title,
              { marginEnd: ratingTextWidth + 2 * spacing.defaultMargin },
            ]}
          >
            {title}
          </Text>
          <Text
            style={styles.rating}
            onLayout={(event) =>
              setRatingTextWidth(event.nativeEvent.layout.width)
            }
          >
            {rating}/10
          </Text>
        </View>
        <View style={styles.overviewContainer}>
          <Text
            numberOfLines={overviewNumberOfLines}
            style={styles.overview}
            onLayout={(event) =>
              setOverviewNumberOfLines(
                Math.floor(
                  (event.nativeEvent.layout.height - 10) / ITEM_TEXT_LINE_HEIGHT
                )
              )
            }
          >
            {overview}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    height: ITEM_HEIGHT,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: DEFAULT_BORDER_RADIUS,
    backgroundColor: "#f3e2d7",
    marginBottom: spacing.marginL,
    overflow: "hidden",
  },

  posterPhoto: {
    height: ITEM_HEIGHT,
    width: IMAGE_RATIO * ITEM_HEIGHT,
    borderRadius: DEFAULT_BORDER_RADIUS,
  },

  dummyImage: {
    height: ITEM_HEIGHT,
    width: IMAGE_RATIO * ITEM_HEIGHT,
  },

  textContainer: {
    flex: 1,
  },

  titleAndRatingContainer: {
    flexDirection: "row",
  },

  title: {
    width: "auto",
    height: "auto",
    fontWeight: "bold",
    fontSize: 18,
    marginHorizontal: spacing.defaultMargin,
    marginVertical: spacing.marginS,
  },

  rating: {
    marginStart: "auto",
    fontWeight: "bold",
    fontSize: 20,
    marginEnd: spacing.defaultMargin,
    marginVertical: spacing.marginS,
  },

  overviewContainer: {
    flex: 1,
    flexDirection: "row",
    marginBottom: spacing.marginS,
  },

  overview: {
    flex: 1,
    flexWrap: "wrap",
    marginHorizontal: spacing.defaultMargin,
    height: "100%",
    lineHeight: ITEM_TEXT_LINE_HEIGHT,
  },
});

export default MovieItem;
