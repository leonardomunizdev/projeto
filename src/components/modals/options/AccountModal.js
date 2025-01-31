import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Button, TouchableOpacity, Alert, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import optionsStyles from '../../../styles/screens/OptionsScreenStyles';
import { useAccounts } from '../../../context/AccountContext';
import EditAccountModal from './EditAccountModal';
import addTransactionsStyles from '../../../styles/screens/addTransactionsScreenStyles';

const AccountModal = ({ visible, onClose }) => {
  const { accounts, addAccount, removeAccount, updateAccount } = useAccounts();
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [accountToRemove, setAccountToRemove] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [newAccountName, setNewAccountName] = useState('');
  const debitAccounts = accounts.filter(account => account.type === 'Debito');

  const handleAddAccount = () => {
    if (newAccountName.trim() === '') {
      Alert.alert('Erro', 'O nome da conta não pode estar vazio.');
      return;
    }

    addAccount(newAccountName, 0, 'Debito', null, null); // Adiciona apenas contas de débito
    setNewAccountName(''); // Limpar o nome da conta após adicionar
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
            <Text style={optionsStyles.modalTitle}>Gerir Contas</Text>

            <TextInput
              style={optionsStyles.input}
              value={newAccountName}
              onChangeText={setNewAccountName}
              placeholder="Nome da nova conta"
            />

            <Button title="Adicionar Conta" onPress={handleAddAccount} />

            <FlatList
              data={debitAccounts}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={optionsStyles.accountItem}>
                  <Text style={optionsStyles.accountName}>
                    {item.name}
                  </Text>
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
          account={selectedAccount}
          onSave={updateAccount}
        />
      )}

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
              Tem certeza que deseja apagar esta Conta? Todas as movimentações associadas também serão excluídas.
            </Text>
            <View style={optionsStyles.buttonContainer}>
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