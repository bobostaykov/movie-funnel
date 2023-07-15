import i18n from "i18n";
import { Button, Center, Text } from "native-base";
import React from "react";

/**
 * On this screen the user chooses between the option to search
 * for common artists on selected movies or common movies of
 * selected artists.
 */
function WelcomeScreen({ navigation }) {
  return (
    <Center safeArea pt={32}>
      <Center w={200} h={200} bg="red.500">
        LOGO
      </Center>
      <Button
        onPress={() =>
          navigation.navigate("SearchScreen", { findMovies: true })
        }
        mt={10}
      >
        <Text>{i18n.t("welcome_screen.find_movies")}</Text>
      </Button>
      <Button
        onPress={() =>
          navigation.navigate("SearchScreen", { findMovies: false })
        }
        mt={4}
      >
        <Text>{i18n.t("welcome_screen.find_artists")}</Text>
      </Button>
    </Center>
  );
}

export default WelcomeScreen;
