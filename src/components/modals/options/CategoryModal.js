 import React, { useState } from 'react';
import { Alert, Modal, View, TextInput, Button, TouchableOpacity, Text, FlatList } from 'react-native';
import styles from '../../../styles/screens/OptionsScreenStyles';
import { Ionicons } from '@expo/vector-icons';
import { useCategories } from '../../../context/CategoryContext';

const CategoryModal = ({ visible, onClose,  newCategoryName, setNewCategoryName, selectedCategoryType, setSelectedCategoryType }) => {
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false); // Estado para o modal de confirmação
  const { categories, addCategory, removeCategory } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleAddCategory = () => {
    if (newCategoryName.trim() === '') {
      Alert.alert('Erro', 'O nome da categoria não pode estar vazio.');
      return;
    }
    addCategory(newCategoryName, selectedCategoryType);
    setNewCategoryName('');
  };

  const filteredCategories = categories.filter(category => category.type === selectedCategoryType);
  

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

  
  return (
    <View style={styles.container}>
      <Modal
        visible={visible}
        animationType="slide"
        onRequestClose={() => onClose}
        transparent={true}
      >
        <View style={styles.fullScreenModal}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
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

      {/* Modal de Confirmação de Exclusão */}
      {/* Modal de Confirmação de Exclusão */}
      <Modal
        visible={isConfirmModalVisible}
        animationType="slide"
        onRequestClose={() => setIsConfirmModalVisible(false)}
        transparent={true}
      >
        <View style={styles.fullScreenModal}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.confirmTitle}>Confirmar Exclusão</Text>
            <Text style={styles.confirmText}>
              Tem certeza que deseja apagar esta categoria ? Todas as movimentações associadas também serão excluídas.
            </Text>
            <View style={styles.buttonContainer}>
              <Button title="Cancelar" onPress={() => setIsConfirmModalVisible(false)} />
              <Button title="Excluir" onPress={confirmRemoveCategory} color="red" />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CategoryModal;
