import React from 'react';
import { View, Text, Button, Modal, Image, StyleSheet, Alert } from 'react-native';
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

  const formatDate = (dateString) => {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
  };

  const formatValue = (valueString) => {
    // Remove o símbolo de moeda e os espaços, substitui a vírgula por ponto e converte para número
    return parseFloat(valueString.replace(/R\$|\s|,/g, '').trim());
  };
  
  const handleParsedData = async (data) => {
    if (data && Array.isArray(data)) {
      for (const item of data) {
        const { Descrição, Categoria, Conta, Valor, Data, Tipo } = item;
  
        // Adicionar conta, se não existir
        const accountId = addAccount(Conta);
        if (!accountId) {
          console.error(`Conta não adicionada: ${Conta}`);
          continue;
        }
  
        // Adicionar categoria, se não existir
        const categoryId = addCategory(Categoria, Tipo);
        if (!categoryId) {
          console.error(`Categoria não adicionada: ${Categoria}`);
          continue;
        }
  
        // Adicionar transação
        const newTransaction = {
          id: Date.now().toString(),
          description: Descrição,
          category: categoryId, // Usar o ID da categoria
          account: accountId, // Usar o ID da conta
          amount: parseFloat(Valor.replace(/R\$|,/g, '').trim()), // Ajustar a conversão do valor
          date: Data.split('/').reverse().join('-'), // Ajustar o formato da data para YYYY-MM-DD
          type: Tipo === 'receita' ? 'income' : 'expense', // Mapeamento do tipo
        };
  
        console.log('Nova transação:', newTransaction);
        addTransaction(newTransaction);
      }
  
      console.log('Dados processados e inseridos nos contextos');
    } else {
      console.error('Nenhum dado foi processado. Verifique o formato do CSV.');
    }
  };
  
  
  

  const pickCsvFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/plain', 'application/vnd.ms-excel', 'application/csv', 'text/comma-separated-values', '*/*'],
        copyToCacheDirectory: true,
      });
  
      console.log('DocumentPicker result:', result);
  
      // Verifica se há assets e se o cancelamento foi falso
      if (result.assets && !result.canceled) {
        const fileUri = result.assets[0].uri;
        console.log('CSV file selected:', fileUri);
  
        const csvString = await FileSystem.readAsStringAsync(fileUri);
        console.log('CSV file content read successfully');
  
        // Parse CSV data
        Papa.parse(csvString, {
          header: true,
          complete: (parsedResult) => {
            console.log('CSV parsed successfully:', parsedResult.data);
            handleParsedData(parsedResult.data);
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
            Alert.alert('Erro ao processar CSV', 'Ocorreu um erro ao processar o arquivo CSV.');
          }
        });
      } else {
        console.log('User cancelled document picker or no file selected');
      }
    } catch (error) {
      console.error('Erro ao ler o arquivo CSV:', error);
      Alert.alert('Erro', 'Não foi possível abrir o arquivo CSV.');
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
