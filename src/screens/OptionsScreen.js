import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Modal, TextInput, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useAccounts } from '../context/AccountContext';
import { useCategories } from '../context/CategoryContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OptionsScreen = () => {
  const [isAccountModalVisible, setIsAccountModalVisible] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isClearDataConfirmVisible, setIsClearDataConfirmVisible] = useState(false); // Adicionado para a confirmação de limpeza
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
      addCategory(newCategoryName, selectedCategoryType); // Passa o nome e o tipo
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

  // Função para filtrar categorias com base no tipo selecionado
  const filteredCategories = categories.filter(category =>
    !selectedCategoryType || category.type === selectedCategoryType
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Options Screen</Text>
      <Button title="Gerir Contas" onPress={() => setIsAccountModalVisible(true)} />
      <Button title="Gerir Categorias" onPress={() => setIsCategoryModalVisible(true)} />
      <Button title="Limpar Todos os Dados" onPress={confirmClearData} color="red" />

      {/* Modal de Contas */}
      <Modal
        visible={isAccountModalVisible}
        animationType="slide"
        onRequestClose={() => setIsAccountModalVisible(false)}
        transparent={true}
      >
        <View style={styles.fullScreenModal}>
          <View style={styles.modalContent}>
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
            <Button title="Fechar" onPress={() => setIsAccountModalVisible(false)} />
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
          <Text >Gerir asdfsdfsdfsdfsdfsdfsdfsdasd</Text>
            <Text style={styles.modalTitle}>Gerir Categorias</Text>

            {/* Botões Despesa e Receita */}
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
              data={filteredCategories} // Use filteredCategories para mostrar as categorias filtradas
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

            <Button title="Fechar" onPress={() => setIsCategoryModalVisible(false)} />
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

      {/* Modal de Confirmação para Limpar Dados */}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  fullScreenModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  accountName: {
    fontSize: 16,
  },
  removeButton: {
    color: 'red',
  },
  categoryButtonContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  categoryButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    margin: 5,
    alignItems: 'center',
  },
  incomeButton: {
    backgroundColor: 'lightblue',
  },
  expenseButton: {
    backgroundColor: 'lightcoral',
  },
  categoryButtonText: {
    fontSize: 16,
  },
  incomeButtonText: {
    color: 'blue',
  },
  expenseButtonText: {
    color: 'red',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 16,
  },
  confirmModalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  confirmText: {
    fontSize: 16,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default OptionsScreen;
