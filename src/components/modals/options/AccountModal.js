import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Button, TouchableOpacity, Alert, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../../../styles/screens/OptionsScreenStyles'; // Assumindo que você tem um arquivo de estilos separado.
import { useAccounts } from '../../../context/AccountContext';
import EditAccountModal from './EditAccountModal'; // Importa o novo componente



const AccountModal = ({ visible, onClose, newAccountName, setNewAccountName }) => {
  const { accounts, addAccount, removeAccount, updateAccount } = useAccounts();
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState(null);
  const [accountToRemove, setAccountToRemove] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const handleAddAccount = () => {
    if (newAccountName.trim() === '') {
      Alert.alert('Erro', 'O nome da conta não pode estar vazio.');
      return;
    }
    addAccount(newAccountName);
    setNewAccountName('');
  };

  const openEditModal = (account) => {
    setSelectedAccount(account);
    setIsEditModalVisible(true);
  };

  

  const openConfirmModal = (accountId) => {
    setAccountToRemove(accountId);
    setIsConfirmModalVisible(true);
  };

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
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => openEditModal(item)}>
                      <Ionicons name="create" size={24} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => openConfirmModal(item.id)} style={{ marginLeft: 10 }}>
                      <Ionicons name="trash" size={24} color="red" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
      {selectedAccount && (
        <EditAccountModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        account={selectedAccount} // Passando a conta correta para o modal
        onSave={updateAccount} // Usando a função que chama updateAccount
      />
        
      )}   

      

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
              Tem certeza que deseja apagar esta Conta? Todas as movimentações associadas também serão excluídas.
            </Text>
            <View style={styles.buttonContainer}>
              <Button title="Cancelar" onPress={() => setIsConfirmModalVisible(false)} />
              <Button title="Excluir" onPress={confirmRemoveAccount} color="red" />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AccountModal;
