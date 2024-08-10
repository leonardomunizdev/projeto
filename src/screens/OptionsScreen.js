import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Modal, TextInput, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAccounts } from '../context/AccountContext';
import { useCategories } from '../context/CategoryContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useIsFocused } from "@react-navigation/native";

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
  const isFocused = useIsFocused();

  useEffect(() => { 
    if (isFocused) {
      console.log('A tela options está em foco');
      // Aqui você pode executar outras ações necessárias quando a tela estiver em foco
    }
  }, [isFocused]);

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Options Screen</Text>
      <TouchableOpacity style={styles.optionButton} onPress={() => setIsAccountModalVisible(true)}>
        <Ionicons name="wallet" size={24} color="black" />
        <Text style={styles.optionText}>Gerir Contas</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.optionButton} onPress={() => setIsCategoryModalVisible(true)}>
        <Ionicons name="list" size={24} color="black" />
        <Text style={styles.optionText}>Gerir Categorias</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.optionButton}>
        <Ionicons name="download" size={24} color="black" />
        <Text style={styles.optionText}>Baixar Notas Fiscais</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.optionButton}>
        <Ionicons name="folder-open" size={24} color="black" />
        <Text style={styles.optionText}>Importar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.optionButton}>
        <Ionicons name="folder" size={24} color="black" />
        <Text style={styles.optionText}>Exportar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.optionButton}>
        <Ionicons name="stats-chart" size={24} color="black" />
        <Text style={styles.optionText}>Gráficos</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.optionButton} onPress={confirmClearData}>
        <Ionicons name="trash" size={24} color="red" />
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
              Tem certeza que deseja apagar esta {selectedAccount ? 'conta' : 'categoria'}?
            </Text>
            <Button title="Confirmar" onPress={selectedAccount ? confirmRemoveAccount : confirmRemoveCategory} />
            <Button title="Cancelar" onPress={cancelRemoveAccount} />
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
            <Button title="Limpar Dados" onPress={handleClearData} />
            <Button title="Cancelar" onPress={cancelClearData} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginVertical: 10,
  },
  optionText: {
    fontSize: 18,
    marginLeft: 10,
  },
  fullScreenModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    padding: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    width: '100%',
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
    margin: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  incomeButton: {
    backgroundColor: 'blue',
  },
  expenseButton: {
    backgroundColor: 'red',
  },
  categoryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  incomeButtonText: {
    color: '#fff',
  },
  expenseButtonText: {
    color: '#fff',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    width: '100%',
  },
  categoryName: {
    fontSize: 16,
  },
  confirmModalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  confirmText: {
    fontSize: 16,
    marginBottom: 10,
  },
});

export default OptionsScreen;
