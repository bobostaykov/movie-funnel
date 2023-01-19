/**
 * Component representing an item in the actors
 * and directors results list
 */

import React, { useState } from "react";

import i18n from "i18n";
import { ITEM_TEXT_LINE_HEIGHT, TMDB_IMAGE_URL } from "modules/constants.js";
import { openMovieOrArtistURL } from "modules/utils.js";
import {
  Box,
  Button,
  CheckCircleIcon,
  Column,
  Heading,
  Pressable,
  Row,
  Skeleton,
  Text,
} from "native-base";
import { StyleSheet } from "react-native";
import FastImage from "react-native-fast-image";

const ITEM_HEIGHT = 150;
const IMAGE_RATIO = 0.66;

export const ArtistItemSkeleton = () => (
  <Row h={ITEM_HEIGHT} w="full" mb={4} rounded="lg">
    <Skeleton h={ITEM_HEIGHT} w={IMAGE_RATIO * ITEM_HEIGHT} rounded="lg" />
    <Column flex={1} px={4} py={2} justifyContent="space-between">
      <Skeleton.Text />
      <Skeleton h={25} w={60} rounded="md" alignSelf="flex-end" />
    </Column>
  </Row>
);

const ArtistItem = ({ name, id, photoPath, knownFor, onPress, selected }) => {
  // the number of lines which the "known for" text can span, calculated on layout
  const [knownForNumberOfLines, setKnownForNumberOfLines] = useState(2);

  if (!id) return null;

  return (
    <Pressable
      onPress={() => onPress(id, name, !selected)}
      _pressed={{
        transform: [{ scale: 0.985 }],
      }}
      mb={4}
      rounded="lg"
      overflow="hidden"
      h={ITEM_HEIGHT}
      w="full"
      bgColor="#dbe3fa"
      flexDir="row"
    >
      <FastImage
        resizeMode="cover"
        source={{ uri: TMDB_IMAGE_URL + photoPath }}
        defaultSource={require("assets/dummy_artist_image.png")}
        style={styles.image}
      />
      <Box ml={4} flex={1}>
        <Heading size="md" mr={4} my={2}>
          {name}
        </Heading>
        <Text
          numberOfLines={knownForNumberOfLines}
          onLayout={(event) =>
            setKnownForNumberOfLines(
              Math.floor(
                (event.nativeEvent.layout.height - 10) / ITEM_TEXT_LINE_HEIGHT
              )
            )
          }
          flex={1}
          flexWrap="wrap"
          mr={4}
          lineHeight={ITEM_TEXT_LINE_HEIGHT}
        >
          {i18n.t("misc.known_for") + knownFor.join(", ")}
        </Text>
        <Button
          onPress={() => openMovieOrArtistURL(id, true)}
          rounded="md"
          bgColor="#c3c3ea"
          m="3"
          ml="auto"
          py={1}
          _pressed={{
            transform: [{ scale: 0.95 }],
          }}
        >
          <Text>{i18n.t("search_screen.artist_profile")}</Text>
        </Button>
      </Box>
      {selected && (
        <Box
          pointerEvents="none"
          position="absolute"
          start={0}
          end={0}
          w="full"
          h="full"
          opacity={0.4}
          backgroundColor="blue.700"
        />
      )}
      {selected && (
        <CheckCircleIcon
          size={7}
          color="green.300"
          position="absolute"
          top={2}
          end={8}
        />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  image: {
    height: ITEM_HEIGHT,
    width: IMAGE_RATIO * ITEM_HEIGHT,
    borderRadius: 8,
  },
});

export default ArtistItem;
