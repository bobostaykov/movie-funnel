/**
 * Component representing an item in the actors
 * and directors results list
 */

import React, { useState } from "react";

import i18n from "i18n";
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
import { StyleSheet } from "react-native";
import FastImage from "react-native-fast-image";
import {
  IMAGE_RATIO,
  ITEM_HEIGHT,
  ITEM_TEXT_LINE_HEIGHT,
  TMDB_IMAGE_URL,
} from "../modules/constants";
import { openMovieOrArtistPage } from "../modules/utils";

const ArtistItem = ({
  name,
  id,
  photoPath,
  knownFor,
  onPress,
  selected,
  isActor,
  as,
}) => {
  // the number of lines which the "known for" text can span, calculated on layout
  const [knownForNumberOfLines, setKnownForNumberOfLines] = useState(2);

  if (!id) return null;

  const photo =
    photoPath === null
      ? require("assets/images/dummy_artist_image.png")
      : { uri: TMDB_IMAGE_URL + photoPath };

  if (as !== undefined) {
    const asValues = Object.values(as);
    const allTheSame = asValues.every((elem) => elem === asValues[0]);
    if (allTheSame) {
      as = asValues[0];
    }
  }

  const body = knownFor ? (
    <Text>
      <Text italic>{i18n.t("misc.known_for")}</Text>
      {knownFor.join(", ")}
    </Text>
  ) : (
    <Text>
      {typeof as === "string" ? (
        isActor ? (
          <Text>
            <Text italic>{`${i18n.t("helpers.as")} `}</Text>
            {as}
          </Text>
        ) : (
          as
        )
      ) : (
        Object.keys(as).map((movie) => (
          <Text key={movie}>
            <Text italic fontSize="13">
              {`${i18n.t("helpers.in")} ${movie} ${i18n.t("helpers.as")}: `}
            </Text>
            {`${as[movie]}\n`}
          </Text>
        ))
      )}
    </Text>
  );

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
      bgColor="#dbe3fa"
      flexDir="row"
    >
      <FastImage resizeMode="cover" source={photo} style={styles.image} />
      <Box ml={4} flex={1}>
        <Heading size="md" mr={4} my={2}>
          {name}
        </Heading>
        <Row flex={1}>
          <Text
            flex={1}
            numberOfLines={knownForNumberOfLines}
            onLayout={(event) =>
              setKnownForNumberOfLines(
                Math.floor(
                  (event.nativeEvent.layout.height - 10) / ITEM_TEXT_LINE_HEIGHT
                )
              )
            }
            flexWrap="wrap"
            mb={4}
            lineHeight={ITEM_TEXT_LINE_HEIGHT}
          >
            {body}
          </Text>
          <IconButton
            icon={<InfoIcon color="#9797cc" />}
            onPress={() => openMovieOrArtistPage(id, true)}
            m={1}
            mt="auto"
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
            backgroundColor="blue.700"
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
};

const styles = StyleSheet.create({
  image: {
    height: ITEM_HEIGHT,
    width: IMAGE_RATIO * ITEM_HEIGHT,
    borderRadius: 8,
  },
});

export default ArtistItem;
