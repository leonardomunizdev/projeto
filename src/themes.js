// src/themes.js
import { DefaultTheme, DarkTheme } from 'react-native-paper';

export const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: 'blue',
    background: 'white',
    text: 'black',
  },
};

export const DarkThemes = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: 'blue',
    background: 'black',
    text: 'white',
  },
};
