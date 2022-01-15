/**
 * Component representing an item in the actors
 * and directors results list
 */

import React, { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

import {
  DEFAULT_BORDER_RADIUS,
  ITEM_TEXT_LINE_HEIGHT,
  OPACITY_ON_PRESS,
  spacing,
  TMDB_IMAGE_URL,
} from "modules/constants.js";
import i18n from "i18n";
import { openMovieOrArtistURL } from "modules/utils.js";

const ITEM_HEIGHT = 150;
const IMAGE_RATIO = 0.66;

const ArtistItem = ({
  name,
  id,
  photoPath,
  knownFor,
  style,
  onPress,
  selected,
}) => {
  // the number of lines which the "known for" text can span, calculated on layout
  const [knownForNumberOfLines, setKnownForNumberOfLines] = useState(2);
  // whether the artist photo is provided
  const [hasPhoto, setHasPhoto] = useState(true);

  useEffect(() => {
    checkHasPhoto(TMDB_IMAGE_URL + photoPath);
  }, []);

  /**
   * Checks if a photo of the artist is provided
   */
  const checkHasPhoto = (url) => {
    fetch(url)
      .then((result) => {
        setHasPhoto(result.status !== 404);
      })
      .catch(() => setHasPhoto(false));
  };

  /**
   * Artist photo fetched from TMDb
   */
  const ArtistPhoto = () => (
    <Image
      resizeMode="cover"
      source={{ uri: TMDB_IMAGE_URL + photoPath }}
      style={styles.artistPhoto}
    />
  );

  /**
   * Dummy avatar used in case no photo is provided
   */
  const DummyImage = () => (
    <Image
      resizeMode="contain"
      source={require("assets/dummy_artist_image.png")}
      style={styles.dummyImage}
    />
  );

  if (!id) return null;

  return (
    <TouchableOpacity
      activeOpacity={OPACITY_ON_PRESS}
      onPress={() => onPress(id, name, !selected)}
    >
      <View style={[styles.itemContainer, style]}>
        {hasPhoto ? <ArtistPhoto /> : <DummyImage />}
        <View style={styles.textContainer}>
          <Text style={styles.name}>{name}</Text>
          <Text
            numberOfLines={knownForNumberOfLines}
            style={styles.knownFor}
            onLayout={(event) =>
              setKnownForNumberOfLines(
                Math.floor(
                  (event.nativeEvent.layout.height - 10) / ITEM_TEXT_LINE_HEIGHT
                )
              )
            }
          >
            {i18n.t("misc.known_for") + knownFor.join(", ")}
          </Text>
          <TouchableOpacity
            activeOpacity={OPACITY_ON_PRESS}
            style={styles.linkToProfile}
            onPress={() => openMovieOrArtistURL(id, true)}
          >
            <Text>{i18n.t("search_screen.artist_profile")}</Text>
          </TouchableOpacity>
        </View>
        {selected && <View pointerEvents="none" style={styles.overlay} />}
        {selected && (
          <Icon
            name="check-circle"
            size={24}
            color="lightgreen"
            style={styles.checkIcon}
          />
        )}
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
    backgroundColor: "#dbe3fa",
    marginBottom: spacing.marginL,
    overflow: "hidden",
  },

  artistPhoto: {
    height: ITEM_HEIGHT,
    width: IMAGE_RATIO * ITEM_HEIGHT,
    borderRadius: DEFAULT_BORDER_RADIUS,
  },

  dummyImage: {
    height: ITEM_HEIGHT - 50,
    width: IMAGE_RATIO * ITEM_HEIGHT,
  },

  textContainer: {
    flex: 1,
  },

  name: {
    width: "auto",
    height: "auto",
    fontWeight: "bold",
    fontSize: 20,
    marginHorizontal: spacing.defaultMargin,
    marginVertical: spacing.marginS,
  },

  knownFor: {
    flex: 1,
    flexWrap: "wrap",
    height: "100%",
    marginHorizontal: spacing.defaultMargin,
    lineHeight: ITEM_TEXT_LINE_HEIGHT,
  },

  linkToProfile: {
    backgroundColor: "#c3c3ea",
    borderRadius: 7,
    margin: spacing.marginS,
    marginStart: "auto",
    paddingHorizontal: spacing.paddingS,
    paddingVertical: 5,
  },

  overlay: {
    width: "100%",
    height: "100%",
    position: "absolute",
    start: 0,
    top: 0,
    opacity: 0.25,
    backgroundColor: "blue",
  },

  checkIcon: {
    position: "absolute",
    top: spacing.marginS,
    end: spacing.marginS,
  },
});

export default ArtistItem;
