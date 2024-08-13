import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Modal, TextInput, FlatList, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Corrigido para usar Ionicons
import { useAccounts } from '../context/AccountContext';
import { useCategories } from '../context/CategoryContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RFPercentage, RFValue } from 'react-native-responsive-fontsize'; // Importando para ajustar o tamanho da fonte

const OptionsScreen = () => {
  const [isAccountModalVisible, setIsAccountModalVisible] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isClearDataConfirmVisible, setIsClearDataConfirmVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newAccountName, setNewAccountName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedCategoryType, setSelectedCategoryType] = useState('income');

  const { accounts, addAccount, removeAccount } = useAccounts();
  const { categories, addCategory, removeCategory } = useCategories();


  
  const handleAddAccount = () => {
    if (newAccountName.trim()) {
      addAccount(newAccountName);
      setNewAccountName('');
    }
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim() && selectedCategoryType) {
      addCategory(newCategoryName, selectedCategoryType);
      setNewCategoryName('');
    }
  };

  const handleRemoveAccount = (id) => {
    setSelectedAccount(id);
    setIsConfirmModalVisible(true);
  };

  const confirmRemoveAccount = () => {
    if (selectedAccount) {
      removeAccount(selectedAccount);
      setSelectedAccount(null);
      setIsConfirmModalVisible(false);
    }
  };

  const cancelRemoveAccount = () => {
    setSelectedAccount(null);
    setIsConfirmModalVisible(false);
  };

  const handleRemoveCategory = (id) => {
    setSelectedCategory(id);
    setIsConfirmModalVisible(true);
  };

  const confirmRemoveCategory = () => {
    if (selectedCategory) {
      removeCategory(selectedCategory);
      setSelectedCategory(null);
      setIsConfirmModalVisible(false);
    }
  };

  const clearAllData = async () => {
    try {
      await AsyncStorage.clear();
      Alert.alert('Dados Limpos', 'Todos os dados foram removidos com sucesso.');
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao tentar limpar os dados.');
      console.error('Failed to clear AsyncStorage', error);
    }
  };

  const confirmClearData = () => {
    setIsClearDataConfirmVisible(true);
  };

  const handleClearData = () => {
    clearAllData();
    setIsClearDataConfirmVisible(false);
  };

  const cancelClearData = () => {
    setIsClearDataConfirmVisible(false);
  };

  const filteredCategories = categories.filter(category =>
    !selectedCategoryType || category.type === selectedCategoryType
  );
  const generateAndSharePDF = async () => {
    try {
      // Cria um novo documento PDF
      const page = PDFPage
        .create()
        .setMediaBox(200, 200)
        .drawText('Notas Fiscais', { x: 5, y: 180, color: '#007386', fontSize: 18 });

      // Adiciona cada transação ao PDF
      transactions.forEach((transaction, index) => {
        page.drawText(`ID: ${transaction.id}`, { x: 5, y: 150 - index * 20, fontSize: 12 });
        page.drawText(`Data: ${transaction.date}`, { x: 5, y: 140 - index * 20, fontSize: 12 });
        page.drawText(`Valor: R$${transaction.amount}`, { x: 5, y: 130 - index * 20, fontSize: 12 });
        page.drawText(`Tipo: ${transaction.type === 'income' ? 'Receita' : 'Despesa'}`, { x: 5, y: 120 - index * 20, fontSize: 12 });
      });

      const pdfDoc = PDFDocument
        .create()
        .addPages(page);

      const pdfBytes = await pdfDoc.writeToBytes(); // Obtém o PDF como bytes

      // Cria um arquivo temporário
      const tempFilePath = `${RNFetchBlob.fs.dirs.CacheDir}/NotasFiscais.pdf`;

      await RNFetchBlob.fs.writeFile(tempFilePath, pdfBytes, 'base64');

      // Compartilha o PDF usando react-native-share
      await Share.open({
        title: 'Compartilhar Notas Fiscais',
        url: `file://${tempFilePath}`,
        type: 'application/pdf',
        message: 'Confira suas notas fiscais!',
      });

    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao gerar o PDF.');
      console.error('Failed to generate or share PDF', error);
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

      <TouchableOpacity style={styles.optionButton} onPress={generateAndSharePDF}>
        <Ionicons name="download" size={24} color="black" />
        <Text style={styles.optionText}>Baixar Notas Fiscais</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.optionButton}>
        <Ionicons name="folder-open" size={RFValue(24)} color="black" />
        <Text style={styles.optionText}>Importar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.optionButton}>
        <Ionicons name="folder" size={RFValue(24)} color="black" />
        <Text style={styles.optionText}>Exportar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.optionButton}>
        <Ionicons name="stats-chart" size={RFValue(24)} color="black" />
        <Text style={styles.optionText}>Gráficos</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.optionButton} onPress={confirmClearData}>
        <Ionicons name="trash" size={RFValue(24)} color="red" />
        <Text style={styles.optionText}>Limpar Todos os Dados</Text>
      </TouchableOpacity>

      {/* Modal de Contas */}
      <Modal
        visible={isAccountModalVisible}
        animationType="slide"
        onRequestClose={() => setIsAccountModalVisible(false)}
        transparent={true}
      >
        <View style={styles.fullScreenModal}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsAccountModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Gerir Contas</Text>
            <TextInput
              style={styles.input}
              value={newAccountName}
              onChangeText={setNewAccountName}
              placeholder="Nome da nova conta"
            />
            <Button title="Adicionar Conta" onPress={handleAddAccount} />
            <FlatList
              data={accounts}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.accountItem}>
                  <Text style={styles.accountName}>{item.name}</Text>
                  <TouchableOpacity onPress={() => handleRemoveAccount(item.id)}>
                    <Text style={styles.removeButton}>Remover</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>


      {/* Modal de Categorias */}
      <Modal
        visible={isCategoryModalVisible}
        animationType="slide"
        onRequestClose={() => setIsCategoryModalVisible(false)}
        transparent={true}
      >
        <View style={styles.fullScreenModal}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsCategoryModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Gerir Categorias</Text>
            <View style={styles.categoryButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  selectedCategoryType === 'income' && styles.incomeButton,
                ]}
                onPress={() => setSelectedCategoryType('income')}
              >
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategoryType === 'income' && styles.incomeButtonText,
                ]}>Receita</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  selectedCategoryType === 'expense' && styles.expenseButton,
                ]}
                onPress={() => setSelectedCategoryType('expense')}
              >
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategoryType === 'expense' && styles.expenseButtonText,
                ]}>Despesa</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholder="Nome da nova categoria"
            />
            <Button title="Adicionar Categoria" onPress={handleAddCategory} />
            <FlatList
              data={filteredCategories}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.categoryItem}>
                  <Text style={styles.categoryName}>{item.name}</Text>
                  <TouchableOpacity onPress={() => handleRemoveCategory(item.id)}>
                    <Text style={styles.removeButton}>Remover</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Modal de Confirmação */}
      <Modal
        visible={isConfirmModalVisible}
        animationType="slide"
        onRequestClose={cancelRemoveAccount}
        transparent={true}
      >
        <View style={styles.fullScreenModal}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.confirmTitle}>Confirmar Exclusão</Text>
            <Text style={styles.confirmText}>
              Tem certeza que deseja apagar esta {selectedAccount ? 'conta' : 'categoria'}? Todas as movimentações associadas também serão excluídas.
            </Text>
            <View style={styles.buttonContainer}>
              <Button title="Cancelar" onPress={cancelRemoveAccount} />
              <Button title="Excluir" onPress={selectedAccount ? confirmRemoveAccount : confirmRemoveCategory} color="red" />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Confirmação de Limpeza de Dados */}
      <Modal
        visible={isClearDataConfirmVisible}
        animationType="slide"
        onRequestClose={cancelClearData}
        transparent={true}
      >
        <View style={styles.fullScreenModal}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.confirmTitle}>Confirmar Limpeza de Dados</Text>
            <Text style={styles.confirmText}>
              Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.
            </Text>
            <View style={styles.buttonContainer}>
              <Button title="Cancelar" onPress={cancelClearData} />
              <Button title="Limpar" onPress={handleClearData} color="red" />
            </View>
          </View>
        </View>
      </Modal>
    
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#f4f4f4',
  },
  title: {
    fontSize: RFPercentage(4), // Ajusta o tamanho da fonte com base no tamanho da tela
    fontWeight: 'bold',
    marginBottom: 45,
    marginTop: 35,
    color: '#333',
    textAlign: 'center',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  optionText: {
    fontSize: RFValue(16), // Ajusta o tamanho da fonte com base no tamanho da tela
    marginLeft: 12,
    color: '#333',
  },
  fullScreenModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '100%', // Use percentuais para responsividade
    height: '100%',
    maxWidth: 600, // Define um máximo para telas grandes
    backgroundColor: 'white',
    padding: 20,
  },
  modalTitle: {
    fontSize: RFValue(24),
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 14,
    borderWidth: 1, 
    borderColor: '#ccc',
    borderRadius: 20,
    marginBottom: 16,
    fontSize: RFValue(16),
    color: '#333',
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  accountName: {
    fontSize: RFValue(20),
    color: '#333',
    fontWeight: 'bold',
  },
  removeButton: {
    color: '#e74c3c',
    fontWeight: '500',
  },
  categoryName: {
    fontWeight: 'bold',
    fontSize: RFValue(20),
  },
  categoryButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  incomeButton: {
    backgroundColor: 'blue',
  },
  expenseButton: {
    backgroundColor: 'red',
  },
  categoryButtonText: {
    fontSize: RFValue(16),
    fontWeight: '500',
    color: '#333',
  },
  incomeButtonText: {
    color: 'white',
  },
  expenseButtonText: {
    color: 'white',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  confirmModalContent: {
    width: '90%',
    maxWidth: 600,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  confirmTitle: {
    fontSize: RFValue(22),
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  confirmText: {
    fontSize: RFValue(16),
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
});

export default OptionsScreen;
