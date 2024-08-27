import React, { useState } from 'react';
import { Text, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, View, StyleSheet, Alert, BackHandler, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RFValue } from 'react-native-responsive-fontsize';
import AccountModal from '../components/modals/options/AccountModal';
import CategoryModal from '../components/modals/options/CategoryModal';
import ClearDataModal from '../components/modals/options/ClearDataModal';
import ImportModal from '../components/modals/options/ImportModal';
import DownloadInvoicesModal from '../components/modals/options/DownloadInvoicesModal';
import ChartsModal from '../components/modals/options/ChartsModal';
import optionsStyles from '../styles/screens/OptionsScreenStyles';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importação corrigida
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';
import * as Updates from 'expo-updates';
import HelpModal from '../components/modals/options/HelpModal';
import JSZip from 'jszip';

const OptionsScreen = () => {
  const [isAccountModalVisible, setIsAccountModalVisible] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isClearDataConfirmVisible, setIsClearDataConfirmVisible] = useState(false);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [isDownloadInvoicesModalVisible, setIsDownloadInvoicesModalVisible] = useState(false);
  const [isChartsModalVisible, setIsChartsModalVisible] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedCategoryType, setSelectedCategoryType] = useState('income');
  const [isLoading, setIsLoading] = useState(false); // Novo estado para carregamento
  const [helpModalVisible, setHelpModalVisible] = useState(false);

  
  const showRestartAlert = () => {
    Alert.alert(
      'Reiniciar o Aplicativo',
      'Os dados foram importados com sucesso. O aplicativo será fechado e deverá ser reaberto.',
      [
        {
          text: 'OK',
          onPress: () => {
            // Aguarde 3 segundos e então feche o aplicativo
            setTimeout(() => {
              Updates.reloadAsync();
              BackHandler.exitApp();
            }, 1); // 3000 milissegundos = 3 segundos
          }
        }
      ],
      { cancelable: false }
    );
  };





  const exportData = async () => {
    try {
      // 1. Coletar dados do AsyncStorage
      const allKeys = await AsyncStorage.getAllKeys();
      const allItems = await AsyncStorage.multiGet(allKeys);
      const dataToExport = allItems.reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});
  
      // 2. Criar um novo arquivo ZIP
      const zip = new JSZip();
  
      // 3. Adicionar dados JSON ao ZIP
      const jsonData = JSON.stringify(dataToExport);
      zip.file('data.json', jsonData);
  
      // 4. Adicionar imagens ao ZIP
      const transactions = JSON.parse(dataToExport['transactions'] || '[]');
      for (const transaction of transactions) {
        if (transaction.attachments && transaction.attachments.length > 0) {
          for (const [index, attachmentPath] of transaction.attachments.entries()) {
            const fileExists = await FileSystem.getInfoAsync(attachmentPath);
            if (fileExists.exists) {
              const attachmentData = await FileSystem.readAsStringAsync(attachmentPath, { encoding: FileSystem.EncodingType.Base64 });
              zip.file(`image-${transaction.id}-${index + 1}.jpg`, attachmentData, { base64: true });
            }
          }
        }
      }
  
      // 5. Gerar o arquivo ZIP
      const zipContent = await zip.generateAsync({ type: 'base64' });
  
      // 6. Salvar o arquivo ZIP no sistema de arquivos
      const zipFileUri = `${FileSystem.documentDirectory}backup.zip`;
      await FileSystem.writeAsStringAsync(zipFileUri, zipContent, { encoding: FileSystem.EncodingType.Base64 });
  
      // 7. Compartilhar o arquivo ZIP
      await shareAsync(zipFileUri);
  
      console.log('Backup completo.');
  
    } catch (error) {
      console.error('Erro ao exportar os dados:', error);
    }
  };

  const importData = async () => {
    setIsLoading(true); // Iniciar carregamento
    try {
      // Abrir o seletor de documentos para escolher o arquivo ZIP
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/zip',
      });

      if (result.canceled === false && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        if (file.mimeType === 'application/zip') {
          const fileUri = file.uri;

          // Ler o conteúdo do arquivo ZIP
          const zipData = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });

          // Descompactar o arquivo ZIP
          const zip = await JSZip.loadAsync(zipData, { base64: true });

          // Processar o arquivo JSON
          const jsonFile = zip.file('data.json');
          if (jsonFile) {
            const jsonData = await jsonFile.async('text');
            const dataToImport = JSON.parse(jsonData);

            // Salvar os dados no AsyncStorage
            const items = Object.entries(dataToImport);
            await AsyncStorage.multiSet(items);
            console.log('Dados importados com sucesso!');

            // Processar imagens
            zip.forEach(async (relativePath, zipEntry) => {
              if (zipEntry.name.startsWith('image-')) {
                const imageData = await zipEntry.async('base64');
                const imageUri = `${FileSystem.documentDirectory}${zipEntry.name}`;
                await FileSystem.writeAsStringAsync(imageUri, imageData, { encoding: FileSystem.EncodingType.Base64 });
              }
            });

            // Mostrar o alerta e fechar o aplicativo após 1 segundo
            showRestartAlert();
          } else {
            console.log('Arquivo JSON não encontrado no ZIP.');
          }
        } else {
          console.log('O arquivo selecionado não é um ZIP.');
        }
      } else {
        console.log('Nenhum arquivo selecionado.');
      }
    } catch (error) {
      console.error('Erro ao importar os dados:', error);
    } finally {
      setIsLoading(false); // Encerrar carregamento
    }
  };



  return (
    <ScrollView>
      <KeyboardAvoidingView
        style={optionsStyles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {isLoading ? (
          <View style={optionsStyles.loaderContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={optionsStyles.loaderText}>Importando dados...</Text>
          </View>
        ) : (
          <>
            <Text style={optionsStyles.title}>Opções</Text>

            <TouchableOpacity style={optionsStyles.optionButton} onPress={() => setIsAccountModalVisible(true)}>
              <Ionicons name="wallet" size={RFValue(24)} color="black" />
              <Text style={optionsStyles.optionText}>Gerir Contas Bancarias</Text>
            </TouchableOpacity>
            <TouchableOpacity style={optionsStyles.optionButton} onPress={() => setIsCategoryModalVisible(true)}>
              <Ionicons name="list" size={RFValue(24)} color="black" />
              <Text style={optionsStyles.optionText}>Gerir Categorias</Text>
            </TouchableOpacity>
            <TouchableOpacity style={optionsStyles.optionButton} onPress={() => setIsDownloadInvoicesModalVisible(true)}>
              <Ionicons name="download" size={24} color="black" />
              <Text style={optionsStyles.optionText}>Baixar Notas Fiscais</Text>
            </TouchableOpacity>
            <TouchableOpacity style={optionsStyles.optionButton} onPress={() => setIsImportModalVisible(true)}>
              <Ionicons name="folder-open" size={RFValue(24)} color="black" />
              <Text style={optionsStyles.optionText}>Importar CSV</Text>
            </TouchableOpacity>

            <TouchableOpacity style={optionsStyles.optionButton} onPress={() => setIsChartsModalVisible(true)}>
              <Ionicons name="stats-chart" size={RFValue(24)} color="black" />
              <Text style={optionsStyles.optionText}>Gráficos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={optionsStyles.optionButton} onPress={() => exportData()}>
              <Ionicons name="cloud-upload" size={RFValue(24)} color="black" />
              <Text style={optionsStyles.optionText}>Fazer Backup de dados</Text>
            </TouchableOpacity>
            <TouchableOpacity style={optionsStyles.optionButton} onPress={() => importData()}>
              <Ionicons name="cloud-download" size={RFValue(24)} color="black" />
              <Text style={optionsStyles.optionText}>Importar Backup de dados</Text>
            </TouchableOpacity>
            <TouchableOpacity style={optionsStyles.optionButton} onPress={() => setHelpModalVisible(true)}>
              <Ionicons name="help-circle-outline" size={RFValue(24)} color="black" />
              <Text style={optionsStyles.optionText}>Ajuda</Text>
            </TouchableOpacity>
            <TouchableOpacity style={optionsStyles.optionButton} onPress={() => setIsClearDataConfirmVisible(true)}>
              <Ionicons name="trash" size={RFValue(24)} color="red" />
              <Text style={optionsStyles.optionText}>Limpar Todos os Dados</Text>
            </TouchableOpacity>

            <AccountModal
              visible={isAccountModalVisible}
              onClose={() => setIsAccountModalVisible(false)}
              newAccountName={newAccountName}
              setNewAccountName={setNewAccountName}
            />
            <CategoryModal
              visible={isCategoryModalVisible}
              onClose={() => setIsCategoryModalVisible(false)}
              newCategoryName={newCategoryName}
              setNewCategoryName={setNewCategoryName}
              selectedCategoryType={selectedCategoryType}
              setSelectedCategoryType={setSelectedCategoryType}
            />

            <ImportModal
              visible={isImportModalVisible}
              onClose={() => setIsImportModalVisible(false)}
            />
            <ClearDataModal
              visible={isClearDataConfirmVisible}
              onCancel={() => setIsClearDataConfirmVisible(false)}
            />
            <ChartsModal
              visible={isChartsModalVisible}
              onClose={() => setIsChartsModalVisible(false)}
            />
            <DownloadInvoicesModal
              visible={isDownloadInvoicesModalVisible}
              onClose={() => setIsDownloadInvoicesModalVisible(false)}
            />
            <HelpModal
              visible={helpModalVisible}
              onClose={() => setHelpModalVisible(false)}
            />
          </>
        )}
      </KeyboardAvoidingView>
    </ScrollView>
  );
};


export default OptionsScreen;
