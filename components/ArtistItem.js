import React, { useState } from "react";

import i18n from "i18n";
import {
  Box,
  Button,
  CheckCircleIcon,
  Heading,
  IconButton,
  InfoIcon,
  Pressable,
  Row,
  Text,
} from "native-base";
import { StyleSheet } from "react-native";
import { Image } from "expo-image";
import {
  GENDER_FEMALE,
  IMAGE_RATIO,
  ITEM_HEIGHT,
  ITEM_TEXT_LINE_HEIGHT,
  TMDB_IMAGE_URL,
} from "../modules/constants";
import { openMovieShowOrArtistPage } from "../modules/utils";

/**
 * Component representing an item in the cast
 * and crew results list
 */
function ArtistItem({
  name,
  id,
  photoPath,
  knownFor,
  onPress,
  selected,
  isActor,
  as,
  gender,
}) {
  // the number of lines which the "known for" text can span, calculated on layout
  const [knownForNumberOfLines, setKnownForNumberOfLines] = useState(2);
  const [knownForRef, setKnownForRef] = useState(knownFor);

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

  const bodyHeight = 107;

  const body = knownForRef ? (
    <Box flex={1} mt={-1.5} mb={2}>
      <Row
        alignItems="center"
        flexWrap="wrap"
        onLayout={(event) => {
          if (event.nativeEvent.layout.height > bodyHeight) {
            setKnownForRef(knownForRef.slice(0, 2));
          }
        }}
      >
        <Text italic ml={1}>
          {i18n.t(
            gender === GENDER_FEMALE
              ? "misc.known_for_female"
              : "misc.known_for_male"
          )}
        </Text>
        {knownForRef.map((movie) => (
          <Button
            key={movie.id}
            onPress={() => openMovieShowOrArtistPage(movie.id)}
            bg="#ceceeb"
            m={0.5}
            py={1}
            px="6px"
            rounded="md"
            _pressed={{
              bg: "#ceceeb",
              opacity: 0.5,
            }}
            _text={{
              lineHeight: 15,
              color: "text.800",
            }}
          >
            {movie.title}
          </Button>
        ))}
      </Row>
    </Box>
  ) : (
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
      bg="#dbe3fa"
      flexDir="row"
    >
      <Image contentFit="cover" source={photo} style={styles.image} />
      <Box ml={4} flex={1}>
        <Heading size="md" mr={4} my={2}>
          {name}
        </Heading>
        <Row flex={1}>
          {body}
          <IconButton
            icon={<InfoIcon color="#9797cc" />}
            onPress={() => openMovieShowOrArtistPage(id, true)}
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
}

const styles = StyleSheet.create({
  image: {
    height: ITEM_HEIGHT,
    width: IMAGE_RATIO * ITEM_HEIGHT,
    borderRadius: 8,
  },
});

export default ArtistItem;
