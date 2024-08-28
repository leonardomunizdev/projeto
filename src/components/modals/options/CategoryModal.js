import React, { useState } from 'react';
import { Alert, Modal, View, TextInput, Button, TouchableOpacity, Text, FlatList } from 'react-native';
import optionsStyles from '../../../styles/screens/OptionsScreenStyles';
import { Ionicons } from '@expo/vector-icons';
import { useCategories } from '../../../context/CategoryContext';
import EditCategoryModal from './EditCatetgoryModal'; // Importa o novo componente

const CategoryModal = ({ visible, onClose, newCategoryName, setNewCategoryName, selectedCategoryType, setSelectedCategoryType }) => {
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false); // Estado para o modal de edição
  const { categories, addCategory, removeCategory, updateCategory } = useCategories();
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

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setIsEditModalVisible(true);
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

  return (
    <View style={optionsStyles.container}>
      <Modal
        visible={visible}
        animationType="slide"
        onRequestClose={onClose}
        transparent={true}
      >
        <View style={optionsStyles.fullScreenModal}>
          <View style={optionsStyles.modalContent}>
            <TouchableOpacity
              style={optionsStyles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
            <Text style={optionsStyles.modalTitle}>Gerir Categorias</Text>
            <View style={optionsStyles.categoryButtonContainer}>
              <TouchableOpacity
                style={[
                  optionsStyles.categoryButton,
                  selectedCategoryType === 'income' && optionsStyles.incomeButton,
                ]}
                onPress={() => setSelectedCategoryType('income')}
              >
                <Text style={[
                  optionsStyles.categoryButtonText,
                  selectedCategoryType === 'income' && optionsStyles.incomeButtonText,
                ]}>Receita</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  optionsStyles.categoryButton,
                  selectedCategoryType === 'expense' && optionsStyles.expenseButton,
                ]}
                onPress={() => setSelectedCategoryType('expense')}
              >
                <Text style={[
                  optionsStyles.categoryButtonText,
                  selectedCategoryType === 'expense' && optionsStyles.expenseButtonText,
                ]}>Despesa</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={optionsStyles.input}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholder="Nome da nova categoria"
            />
            <Button title="Adicionar Categoria" onPress={handleAddCategory} />
            <FlatList
              data={filteredCategories}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={optionsStyles.accountItem}>
                  <Text style={optionsStyles.accountName}>{item.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => handleEditCategory(item)}>
                      <Ionicons name="create" size={24} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleRemoveCategory(item.id)} style={{ marginLeft: 10 }}>
                      <Ionicons name="trash" size={24} color="red" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Modal de Edição */}
      {selectedCategory && (
        <EditCategoryModal
          visible={isEditModalVisible}
          onClose={() => setIsEditModalVisible(false)}
          category={selectedCategory}
          updateCategory={updateCategory}
        />
      )}

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        visible={isConfirmModalVisible}
        animationType="slide"
        onRequestClose={() => setIsConfirmModalVisible(false)}
        transparent={true}
      >
        <View style={optionsStyles.fullScreenModal}>
          <View style={optionsStyles.confirmModalContent}>
            <Text style={optionsStyles.confirmTitle}>Confirmar Exclusão</Text>
            <Text style={optionsStyles.confirmText}>
              Tem certeza que deseja apagar esta categoria? Todas as movimentações associadas também serão excluídas.
            </Text>
            <View style={optionsStyles.buttonContainer}>
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
