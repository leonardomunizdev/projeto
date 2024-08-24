

const importData = async () => {
  try {
    // Abrir o seletor de documentos para escolher o arquivo JSON
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
    });

    if (result.type === 'success') {
      const fileUri = result.uri;
      const jsonData = await FileSystem.readAsStringAsync(fileUri);

      const dataToImport = JSON.parse(jsonData);

      // Salvando os dados no AsyncStorage
      const items = Object.entries(dataToImport);
      await AsyncStorage.multiSet(items);

      console.log('Dados importados com sucesso!');
    }
  } catch (error) {
    console.error('Erro ao importar os dados:', error);
  }
};
