    import React, { useState } from 'react';
    import { View, Text, Button, Modal, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
    import * as DocumentPicker from 'expo-document-picker';
    import * as FileSystem from 'expo-file-system';
    import Papa from 'papaparse';
    import { useAccounts } from '../../../context/AccountContext';
    import { useCategories } from '../../../context/CategoryContext';
    import { useTransactions } from '../../../context/TransactionContext';
    import styles from '../../../styles/screens/OptionsScreenStyles';

    const ImportModal = ({ onClose, visible }) => {
      const { addAccount, accounts } = useAccounts();
      const { addCategory, categories } = useCategories();
      const { addTransaction } = useTransactions();
      
      const [loading, setLoading] = useState(false);

      const handleParsedData = async (data) => {
        if (data && Array.isArray(data)) {
          const existingCategories = new Map();
          categories.forEach(category => existingCategories.set(`${category.name.trim().toLowerCase()}-${category.type}`, category.id));
      
          const existingAccounts = new Map();
          accounts.forEach(account => existingAccounts.set(account.name.trim().toLowerCase(), account.id));
      
          for (const item of data) {
            const {
              Descrição = '',
              Categoria = '',
              Conta = '',
              Valor = '',
              Data = '',
              Tipo = ''
            } = item;
      
            if (!Valor || !Categoria || !Conta || !Data || !Tipo) {
              console.warn('Dados ausentes ou inválidos no item:', item);
              continue;
            }
      
            const normalizedAccountName = Conta.trim().toLowerCase();
            let accountId;
            if (!existingAccounts.has(normalizedAccountName)) {
              accountId = addAccount(Conta);
              existingAccounts.set(normalizedAccountName, accountId);
            } else {
              accountId = existingAccounts.get(normalizedAccountName);
            }
      
            const normalizedCategoryName = Categoria.trim().toLowerCase();
            const transactionType = Tipo === 'receita' ? 'income' : 'expense';
            const categoryKey = `${normalizedCategoryName}-${transactionType}`;
      
            let categoryId;
            if (!existingCategories.has(categoryKey)) {
              categoryId = addCategory(Categoria, transactionType);
              existingCategories.set(categoryKey, categoryId);
            } else {
              categoryId = existingCategories.get(categoryKey);
            }
      
            const formattedValue = Valor.replace(/R\$|\./g, '').replace(',', '.').trim();
      
            const newTransaction = {
              id: Date.now().toString(),
              description: Descrição || 'Sem descrição',
              categoryId,
              categoryName: Categoria,
              accountId,
              accountName: Conta,
              amount: parseFloat(formattedValue),
              date: Data.split('/').reverse().join('-'),
              type: transactionType,
            };
      
            console.log('Nova transação:', newTransaction);
            addTransaction(newTransaction);
      
            await new Promise(resolve => setTimeout(resolve, 50)); // Delay de 50ms
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

          if (result.assets && !result.canceled) {
            setLoading(true); // Inicia o carregamento
            const fileUri = result.assets[0].uri;
            console.log('CSV file selected:', fileUri);

            const csvString = await FileSystem.readAsStringAsync(fileUri);
            console.log('CSV file content read successfully');

            Papa.parse(csvString, {
              header: true,
              complete: async (parsedResult) => {
                console.log('CSV parsed successfully:', parsedResult.data);
                await handleParsedData(parsedResult.data);
                setLoading(false); // Termina o carregamento
                onClose(); // Fecha o modal após finalizar a importação
              },
              error: (error) => {
                console.error('Error parsing CSV:', error);
                setLoading(false); // Termina o carregamento em caso de erro
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
              {loading ? (
                <View style={localStyles.loadingContainer}>
                  <ActivityIndicator size="large" color="#0000ff" />
                  <Text style={localStyles.loadingText}>Importando dados...</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.modalText}>Deseja importar um arquivo CSV?</Text>
                  <Image
                    source={require('../../../../assets/test.png')}
                    style={localStyles.image}
                    resizeMode="contain"
                  />
                  <Button title="Selecionar CSV" onPress={pickCsvFile} />
                  <Button color="red" title="Cancelar" onPress={onClose} />
                </>
              )}
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
      loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
      },
      loadingText: {
        marginTop: 10,
        fontSize: 16,
      },
    });

    export default ImportModal;
