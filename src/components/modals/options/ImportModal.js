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

  const handleParsedData = async (data) => {
    if (data && Array.isArray(data)) {
      // Usar Set para garantir que contas e categorias sejam únicas
      const processedAccounts = new Set();
      const processedCategories = new Set();
  
      for (const item of data) {
        const {
          Descrição = '',
          Categoria = '',
          Conta = '',
          Valor = '',
          Data = '',
          Tipo = ''
        } = item;
  
        // Verifica se todos os campos necessários estão presentes e não são vazios
        if (!Valor || !Categoria || !Conta || !Data || !Tipo) {
          console.warn('Dados ausentes ou inválidos no item:', item);
          continue; // Pular para o próximo item
        }
  
        // Adicionar conta, se não existir
        let accountId;
        if (!processedAccounts.has(Conta)) {
          accountId = addAccount(Conta);
          processedAccounts.add(Conta);
        } else {
          // Se já processado, pegar o ID existente (ou atualizar conforme necessário)
          accountId = accounts.find(account => account.name === Conta)?.id;
        }
  
        // Adicionar categoria, se não existir
        let categoryId;
        const transactionType = Tipo === 'receita' ? 'income' : 'expense';
        if (!processedCategories.has(`${Categoria}-${transactionType}`)) {
          categoryId = addCategory(Categoria, transactionType);
          processedCategories.add(`${Categoria}-${transactionType}`);
        } else {
          // Se já processado, pegar o ID existente (ou atualizar conforme necessário)
          categoryId = categories.find(category => category.name === Categoria && category.type === transactionType)?.id;
        }
  
        // Corrigir a formatação do valor para garantir que as casas decimais estejam corretas
        const formattedValue = Valor.replace(/R\$|\./g, '').replace(',', '.').trim();
  
        // Adicionar transação
        const newTransaction = {
          id: Date.now().toString(),
          description: Descrição || 'Sem descrição', // Valor padrão para descrição
          categoryId, // Usar o ID da categoria
          categoryName: Categoria, // Armazenar o nome da categoria
          accountId, // Usar o ID da conta
          accountName: Conta, // Armazenar o nome da conta
          amount: parseFloat(formattedValue), // Converter o valor formatado corretamente
          date: Data.split('/').reverse().join('-'), // Ajustar o formato da data para YYYY-MM-DD
          type: transactionType, // Usar o tipo determinado
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
