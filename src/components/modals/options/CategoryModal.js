import React, { useState, useRef } from 'react';
import {
  Alert,
  Modal,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCategories } from '../../../context/CategoryContext';
import { RFValue } from 'react-native-responsive-fontsize';

const CategoryModal = ({
  visible,
  onClose,
  newCategoryName,
  setNewCategoryName,
  selectedCategoryType,
  setSelectedCategoryType,
}) => {
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isNewCategoryModalVisible, setIsNewCategoryModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [tempCategoryName, setTempCategoryName] = useState('');
  const [editedCategoryName, setEditedCategoryName] = useState('');

  const { categories, addCategory, removeCategory, updateCategory } = useCategories();

  const filteredCategories = categories.filter(
    (category) => category.type === selectedCategoryType
  );

  // Refs para controlar foco dos TextInputs
  const editInputRef = useRef(null);
  const newCategoryInputRef = useRef(null);

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setEditedCategoryName(category.name);
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

  const handleConfirmNewCategory = () => {
    // Tira o foco e fecha teclado antes de continuar
    newCategoryInputRef.current?.blur();

    if (tempCategoryName.trim() === '') {
      Alert.alert('Erro', 'O nome da categoria não pode estar vazio.');
      return;
    }
    addCategory(tempCategoryName, selectedCategoryType);
    setTempCategoryName('');
    setIsNewCategoryModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent={true}>
        <View style={styles.fullScreenModal}>
          <View style={styles.modalContent}>
            <View style={styles.headerContainer}>
              <TouchableOpacity style={styles.backButton} onPress={onClose}>
                <Ionicons name="arrow-back" size={30} color="black" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Gerir Categorias</Text>
              <View style={styles.rightHeaderPlaceholder} />
            </View>

            <View style={styles.categoryButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  selectedCategoryType === 'income' && styles.incomeButton,
                ]}
                onPress={() => setSelectedCategoryType('income')}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategoryType === 'income' && styles.incomeButtonText,
                  ]}
                >
                  Receita
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  selectedCategoryType === 'expense' && styles.expenseButton,
                ]}
                onPress={() => setSelectedCategoryType('expense')}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategoryType === 'expense' && styles.expenseButtonText,
                  ]}
                >
                  Despesa
                </Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={filteredCategories}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleEditCategory(item)}
                  style={[
                    styles.card,
                    item.type === 'income' ? styles.incomeCard : styles.expenseCard,
                  ]}
                >
                  <Text style={styles.cardText}>{item.name}</Text>
                  <View style={styles.cardActions} />
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.listContent}
            />

            <View style={styles.fixedButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.addButton,
                  selectedCategoryType === 'income' && styles.incomeButton,
                  selectedCategoryType === 'expense' && styles.expenseButton,
                ]}
                onPress={() => setIsNewCategoryModalVisible(true)}
              >
                <Text style={styles.addButtonText}>Adicionar Categoria</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Nova Categoria */}
      <Modal
        visible={isNewCategoryModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsNewCategoryModalVisible(false)}
      >
        <View style={styles.fullScreenModal}>
          <View style={styles.newCategoryModalContent}>
            <Text style={styles.modalTitle}>Nova Categoria</Text>
            <TextInput
              ref={newCategoryInputRef}
              style={styles.modalInput}
              placeholder="Nome da categoria"
              value={tempCategoryName}
              onChangeText={setTempCategoryName}
              autoFocus
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setIsNewCategoryModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalConfirmButton,
                  selectedCategoryType === 'income' && styles.incomeButton,
                  selectedCategoryType === 'expense' && styles.expenseButton,
                ]}
                onPress={handleConfirmNewCategory}
              >
                <Text style={styles.modalButtonText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Edição */}
      {selectedCategory && (
        <Modal
          visible={isEditModalVisible}
          animationType="slide"
          onRequestClose={() => setIsEditModalVisible(false)}
          transparent={true}
        >
          <View style={styles.fullScreenModal}>
            <View style={styles.editModalContent}>
              <View style={styles.editModalHeader}>
                <View style={styles.headerTitleContainer}>
                  <Text style={styles.modalTitle}>Editar Categoria</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemoveCategory(selectedCategory.id)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash" size={50} color="red" />
                </TouchableOpacity>
              </View>

              <TextInput
                ref={editInputRef}
                style={styles.modalInput}
                placeholder="Nome da categoria"
                value={editedCategoryName}
                onChangeText={setEditedCategoryName}
              />

              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setIsEditModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalConfirmButton,
                    selectedCategory.type === 'income' && styles.incomeButton,
                    selectedCategory.type === 'expense' && styles.expenseButton,
                  ]}
                  onPress={() => {
                    editInputRef.current?.blur();

                    if (editedCategoryName.trim() === '') {
                      Alert.alert('Erro', 'O nome da categoria não pode estar vazio.');
                      return;
                    }

                    updateCategory(selectedCategory.id, editedCategoryName);
                    setIsEditModalVisible(false);
                  }}
                >
                  <Text style={styles.modalButtonText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

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
              Tem certeza que deseja apagar esta categoria? Todas as movimentações associadas também
              serão excluídas.
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalCancelButton, { backgroundColor: '#2196F3' }]}
                onPress={() => setIsConfirmModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalDeleteButton}
                onPress={confirmRemoveCategory}
              >
                <Text style={styles.modalButtonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CategoryModal;

const styles = StyleSheet.create({
  fullScreenModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '100%',
    height: '100%',
    maxWidth: 600,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: RFValue(24),
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
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
    backgroundColor: '#f0f0f0',
  },
  incomeButton: {
    backgroundColor: '#3F51B5',
  },
  expenseButton: {
    backgroundColor: '#E91E63',
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
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  addButton: {
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: RFValue(16),
    fontWeight: 'bold',
  },
  newCategoryModalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  editModalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  confirmModalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
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
  modalInput: {
    width: '100%',
    padding: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 20,
    fontSize: RFValue(16),
    color: '#333',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalCancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'red',
    marginRight: 10,
  },
  modalConfirmButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#3F51B5',
  },
  modalDeleteButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#E91E63',
  },
  modalButtonText: {
    fontSize: RFValue(16),
    fontWeight: '500',
    color: '#fff',
  },
  listContent: {
    paddingBottom: 80,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  incomeCard: {
    backgroundColor: '#E3F2FD',
    borderLeftWidth: 4,
    borderLeftColor: '#3F51B5',
  },
  expenseCard: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: '#E91E63',
  },
  cardText: {
    fontSize: RFValue(18),
    fontWeight: '500',
    color: '#333',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
});
