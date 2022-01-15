/**
 * i18n-js is a library for internationalisation,
 * so the app can be easily translated to any language.
 *
 * JSON files with the translations of all strings in the
 * app are located in the /i18n directory.
 * Currently, english and bulgarian.
 */

import i18n from "i18n-js";
import * as Localization from "expo-localization";

import en from "./en.json";
import bg from "./bg.json";

i18n.defaultLocale = "en";
i18n.locale = Localization.locale;
i18n.fallbacks = true;
i18n.translations = { en, bg };

export default i18n;
