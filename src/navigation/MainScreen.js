import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import * as Sharing from 'expo-sharing';
import { useNavigation } from '@react-navigation/native';

const MainScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const handleSharedImage = async () => {
      const shared = await Sharing.getSharedContent();

      if (shared) {
        const { uri } = shared;
        navigation.navigate("AddTransactionScreen", { imageUri: uri });
      }
    };

    handleSharedImage();
  }, []);

  return (
    <View>
      <Text>Main Screen</Text>
    </View>
  );
};

export default MainScreen;
