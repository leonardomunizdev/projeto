import React from 'react';
import { View, Text, Button, Modal, Image, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import Papa from 'papaparse';
import { useAccounts } from '../../../context/AccountContext';
import { useCategories } from '../../../context/CategoryContext';
import { useTransactions } from '../../../context/TransactionContext';
import styles from '../../../styles/screens/OptionsScreenStyles';

const ImportModal = ({ onClose, visible }) => {
  const { addAccount } = useAccounts();
  const { addCategory } = useCategories();
  const { addTransaction } = useTransactions();

  const handleParsedData = (data) => {
    data.forEach(item => {
      const { Descrição, Categoria, Conta, Valor, Data, Tipo } = item;

      // Adicionar conta, se não existir
      addAccount(Conta);

      // Adicionar categoria, se não existir
      addCategory(Categoria, Tipo);

      // Adicionar transação
      const newTransaction = {
        id: Date.now().toString(),
        description: Descrição,
        category: Categoria,
        account: Conta,
        amount: parseFloat(Valor),
        date: Data,
        type: Tipo, // Tipo pode ser 'income' ou 'expense'
      };
      addTransaction(newTransaction);
    });

    console.log('Dados processados e inseridos nos contextos');
  };

  const pickCsvFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/plain', 'application/vnd.ms-excel', 'application/csv', 'text/comma-separated-values', '*/*'], // Inclui mais tipos possíveis e genérico
        copyToCacheDirectory: true,
      });
      

      if (result.type === 'success') {
        const fileUri = result.uri;
        const csvString = await FileSystem.readAsStringAsync(fileUri);

        // Parse CSV data
        Papa.parse(csvString, {
          header: true,
          complete: (result) => {
            handleParsedData(result.data);
          },
        });
      }
    } catch (error) {
      console.error('Erro ao ler o arquivo CSV:', error);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.fullScreenModal}>
        <View style={styles.confirmModalContent}>
          <Text style={styles.modalText}>Deseja importar um arquivo CSV?</Text>
          <Image
            source={require('../../../../assets/test.png')}
            style={localStyles.image} 
            resizeMode="contain" 
          />
          <Button title="Selecionar CSV" onPress={pickCsvFile} />
          <Button color="red" title="Cancelar" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};

const localStyles = StyleSheet.create({
  image: {
    width: '100%', 
    height: 200, 
    marginVertical: 20, 
  },
});

export default ImportModal;
