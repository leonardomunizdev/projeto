import React, { useState} from 'react';
import {Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {RFValue } from 'react-native-responsive-fontsize';
import AccountModal from '../components/modals/options/AccountModal';
import CategoryModal from '../components/modals/options/CategoryModal';
import ExportModal from '../components/modals/options/ExportModal';
import ClearDataModal from '../components/modals/options/ClearDataModal';
import styles from '../styles/screens/OptionsScreenStyles';
import ImportModal from '../components/modals/options/ImportModal';
import DownloadInvoicesModal from '../components/modals/options/DownloadInvoicesModal';
import ChartsModal from '../components/modals/options/ChartsModal';

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
      <TouchableOpacity style={styles.optionButton}   onPress={() => setIsImportModalVisible(true)}>
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
    
    </KeyboardAvoidingView >

  );
};

export default OptionsScreen;
