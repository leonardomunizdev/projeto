import React, { useState } from 'react';
import { Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RFValue } from 'react-native-responsive-fontsize';
import AccountModal from '../components/modals/options/AccountModal';
import CategoryModal from '../components/modals/options/CategoryModal';
import ExportModal from '../components/modals/options/ExportModal';
import ClearDataModal from '../components/modals/options/ClearDataModal';
import styles from '../styles/screens/OptionsScreenStyles';
import ImportModal from '../components/modals/options/ImportModal';
import DownloadInvoicesModal from '../components/modals/options/DownloadInvoicesModal';
import ChartsModal from '../components/modals/options/ChartsModal';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importação corrigida
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const OptionsScreen = () => {
  const [isAccountModalVisible, setIsAccountModalVisible] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isClearDataConfirmVisible, setIsClearDataConfirmVisible] = useState(false);
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [isDownloadInvoicesModalVisible, setIsDownloadInvoicesModalVisible] = useState(false);
  const [isChartsModalVisible, setIsChartsModalVisible] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedCategoryType, setSelectedCategoryType] = useState('income');

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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >

      <Text style={styles.title}>Opções</Text>

      <TouchableOpacity style={styles.optionButton} onPress={() => setIsAccountModalVisible(true)}>
        <Ionicons name="wallet" size={RFValue(24)} color="black" />
        <Text style={styles.optionText}>Gerir Contas</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.optionButton} onPress={() => setIsCategoryModalVisible(true)}>
        <Ionicons name="list" size={RFValue(24)} color="black" />
        <Text style={styles.optionText}>Gerir Categorias</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.optionButton} onPress={() => setIsDownloadInvoicesModalVisible(true)}>
        <Ionicons name="download" size={24} color="black" />
        <Text style={styles.optionText}>Baixar Notas Fiscais</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.optionButton} onPress={() => setIsImportModalVisible(true)}>
        <Ionicons name="folder-open" size={RFValue(24)} color="black" />
        <Text style={styles.optionText}>Importar CSV</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.optionButton} onPress={() => setIsExportModalVisible(true)}>
        <Ionicons name="folder" size={RFValue(24)} color="black" />
        <Text style={styles.optionText}>Exportar Relatório</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.optionButton} onPress={() => setIsChartsModalVisible(true)}>
        <Ionicons name="stats-chart" size={RFValue(24)} color="black" />
        <Text style={styles.optionText}>Gráficos</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.optionButton} onPress={() => exportData()}>
        <Ionicons name="cloud-upload" size={RFValue(24)} color="black" />
        <Text style={styles.optionText}>Fazer Backup de dados</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.optionButton} onPress={() => importData()}>
        <Ionicons name="cloud-download" size={RFValue(24)} color="black" />
        <Text style={styles.optionText}>Importar Backup de dados</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.optionButton} onPress={() => setIsClearDataConfirmVisible(true)}>
        <Ionicons name="trash" size={RFValue(24)} color="red" />
        <Text style={styles.optionText}>Limpar Todos os Dados</Text>
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
      <ExportModal
        visible={isExportModalVisible}
        onClose={() => setIsExportModalVisible(false)}
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

    </KeyboardAvoidingView>
  );
};

export default OptionsScreen;
