import React, { useState } from 'react';
import { Modal, FlatList, View, Text, TextInput, Button, TouchableOpacity, Alert } from 'react-native';
import styles from '../../../styles/screens/OptionsScreenStyles';
import { Ionicons } from '@expo/vector-icons';
import { useAccounts } from '../../../context/AccountContext';

const AccountModal = ({ visible, onClose, newAccountName, setNewAccountName }) => {
  const { accounts, addAccount, removeAccount } = useAccounts();
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false); // Estado para o modal de confirmação
  const [accountToRemove, setAccountToRemove] = useState(null); // Estado para armazenar o ID da conta a ser removida

  // Função para adicionar conta
  const handleAddAccount = () => {
    if (newAccountName.trim() === '') {
      Alert.alert('Erro', 'O nome da conta não pode estar vazio.');
      return;
    }
    addAccount(newAccountName);
    setNewAccountName('');
  };

  // Função para abrir o modal de confirmação
  const openConfirmModal = (accountId) => {
    setAccountToRemove(accountId);
    setIsConfirmModalVisible(true);
  };

  // Função para confirmar a exclusão
  const confirmRemoveAccount = () => {
    if (accountToRemove) {
      removeAccount(accountToRemove);
    }
    setIsConfirmModalVisible(false);
    setAccountToRemove(null);
  };


  return (
    <View style={styles.container}>
      <Modal
        visible={visible}
        animationType="slide"
        onRequestClose={onClose}
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
                  <TouchableOpacity onPress={() => openConfirmModal(item.id)}>
                    <Text style={styles.removeButton}>Remover</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        visible={isConfirmModalVisible}
        animationType="slide"
        onRequestClose={ () => setIsConfirmModalVisible(false)}
        transparent={true}
      >
        <View style={styles.fullScreenModal}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.confirmTitle}>Confirmar Exclusão</Text>
            <Text style={styles.confirmText}>
              Tem certeza que deseja apagar esta Conta? Todas as movimentações associadas também serão excluídas.
            </Text>
            <View style={styles.buttonContainer}>
              <Button title="Cancelar" onPress={ () => setIsConfirmModalVisible(false)} />
              <Button title="Excluir" onPress={confirmRemoveAccount} color="red" />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AccountModal;
