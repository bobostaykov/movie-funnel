/**
 * Component representing an item in the movie results list
 */

import React, { useState } from "react";

import {
  ITEM_TEXT_LINE_HEIGHT,
  spacing,
  TMDB_IMAGE_URL,
} from "modules/constants.js";
import { openMovieOrArtistURL } from "modules/utils.js";
import { Box, Heading, Image, Pressable, Row, Text } from "native-base";

const ITEM_HEIGHT = 150;
// aspect ratio of regular movie poster images
const IMAGE_RATIO = 0.66;

const MovieItem = ({ title, overview, posterPath, id, rating }) => {
  // the width of the rating text, calculated on layout and used to add proper margin to title
  const [ratingTextWidth, setRatingTextWidth] = useState(0);
  // the number of lines which the overview text can span, calculated on layout
  const [overviewNumberOfLines, setOverviewNumberOfLines] = useState(4);

  return (
    <Pressable
      onPress={() => openMovieOrArtistURL(id)}
      _pressed={{
        transform: [{ scale: 0.99 }],
      }}
      mb={4}
      rounded="lg"
      h={ITEM_HEIGHT}
      w="full"
      flexDir="row"
      alignItems="center"
      backgroundColor="#f3e2d7"
    >
      <Image
        alt="Movie poster"
        resizeMode="cover"
        source={{ uri: TMDB_IMAGE_URL + posterPath }}
        fallbackSource={require("assets/dummy_movie_image.png")}
        h={ITEM_HEIGHT}
        w={IMAGE_RATIO * ITEM_HEIGHT}
        rounded="lg"
      />
      <Box px={4} py={3} flex={1}>
        <Row pb={2}>
          <Heading size="md" mr={ratingTextWidth + 2 * spacing.defaultMargin}>
            {title}
          </Heading>
          <Heading
            size="md"
            ml="auto"
            onLayout={(event) =>
              setRatingTextWidth(event.nativeEvent.layout.width)
            }
          >
            {rating}/10
          </Heading>
        </Row>
        <Text
          numberOfLines={overviewNumberOfLines}
          flex={1}
          flexWrap="wrap"
          lineHeight={ITEM_TEXT_LINE_HEIGHT}
          onLayout={(event) =>
            setOverviewNumberOfLines(
              Math.floor(
                event.nativeEvent.layout.height / ITEM_TEXT_LINE_HEIGHT
              )
            )
          }
        >
          {overview}
        </Text>
      </Box>
    </Pressable>
  );
};

export default MovieItem;
