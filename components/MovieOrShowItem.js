import {
  Box,
  CheckCircleIcon,
  Heading,
  IconButton,
  InfoIcon,
  Pressable,
  Row,
  Text,
} from "native-base";
import React, { useState } from "react";
import { StyleSheet } from "react-native";
import FastImage from "react-native-fast-image";
import FeatherIcon from "react-native-vector-icons/Feather";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import {
  IMAGE_RATIO,
  ITEM_HEIGHT,
  ITEM_TEXT_LINE_HEIGHT,
  spacing,
  TMDB_IMAGE_URL,
} from "../modules/constants";
import { openMovieShowOrArtistPage, platformAndroid } from "../modules/utils";

/**
 * Component representing an item in the movie and show results list
 */
function MovieOrShowItem({
  name,
  overview,
  posterPath,
  id,
  rating,
  onPress,
  selected,
  isShow,
}) {
  // the width of the rating text, calculated on layout and used to add proper margin to title
  const [ratingTextWidth, setRatingTextWidth] = useState(0);
  // the number of lines which the overview text can span, calculated on layout
  const [overviewNumberOfLines, setOverviewNumberOfLines] = useState(4);

  const photo =
    posterPath === null
      ? require("assets/images/dummy_movie_image.png")
      : { uri: TMDB_IMAGE_URL + posterPath };

  return (
    <Pressable
      onPress={onPress}
      _pressed={
        onPress !== undefined
          ? {
              transform: [{ scale: 0.985 }],
            }
          : undefined
      }
      mb={4}
      rounded="lg"
      overflow="hidden"
      h={ITEM_HEIGHT}
      w="full"
      flexDir="row"
      alignItems="center"
      bg="#f3e2d7"
    >
      <FastImage
        resizeMode={FastImage.resizeMode.cover}
        source={photo}
        style={styles.image}
      />
      <Box px={4} py={3} flex={1}>
        <Row pb={2}>
          <Heading size="md" mr={ratingTextWidth + spacing.marginS}>
            <Box pr={isShow ? 1 : 1.5}>
              {isShow ? (
                <FeatherIcon
                  name="tv"
                  size={platformAndroid ? 17 : 20}
                  color="#a6a6a6"
                />
              ) : (
                <FontAwesomeIcon
                  name="film"
                  size={platformAndroid ? 16 : 20}
                  color="#a6a6a6"
                />
              )}
            </Box>
            {name}
          </Heading>
          <Heading
            size="xs"
            ml="auto"
            onLayout={(event) =>
              setRatingTextWidth(event.nativeEvent.layout.width)
            }
          >
            {rating}/10
          </Heading>
        </Row>
        <Row flex={1}>
          <Text
            flex={1}
            numberOfLines={overviewNumberOfLines}
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
          <IconButton
            icon={<InfoIcon color="#c48f6c" />}
            onPress={() => openMovieShowOrArtistPage(id, false, isShow)}
            mb={-2}
            mr={-3}
            alignSelf="flex-end"
            rounded="full"
          />
        </Row>
      </Box>
      {selected && (
        <>
          <Box
            pointerEvents="none"
            position="absolute"
            start={0}
            end={0}
            w="full"
            h="full"
            opacity={0.4}
            backgroundColor="orange.800"
          />
          <CheckCircleIcon
            size={7}
            color="green.400"
            position="absolute"
            top={2}
            start={8}
          />
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  image: {
    height: ITEM_HEIGHT,
    width: IMAGE_RATIO * ITEM_HEIGHT,
    borderRadius: 8,
  },
});

export default MovieOrShowItem;
