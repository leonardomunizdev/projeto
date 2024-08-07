// screens/ExportScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ExportScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Exportar</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ExportScreen;
