import { AsyncStorage } from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const exportData = async () => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const allItems = await AsyncStorage.multiGet(allKeys);

    // Convertendo os dados para JSON
    const dataToExport = allItems.reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {});

    const jsonData = JSON.stringify(dataToExport);

    // Salvando o arquivo JSON no armazenamento local
    const fileUri = `${FileSystem.documentDirectory}async-storage-data.json`;
    await FileSystem.writeAsStringAsync(fileUri, jsonData);

    // Compartilhando o arquivo
    await Sharing.shareAsync(fileUri);
  } catch (error) {
    console.error('Erro ao exportar os dados:', error);
  }
};
