// AccountModal.js
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAccounts } from '../../../context/AccountContext';
import { RFValue } from 'react-native-responsive-fontsize';

// Função para formatar valores monetários enquanto o usuário digita
const formatCurrency = (value) => {
  let numericValue = value.replace(/[^\d]/g, '');
  if (numericValue.length === 0) return '';
  let intValue = parseInt(numericValue, 10);
  let realValue = intValue / 100;
  return realValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

const parseCurrencyToNumber = (formatted) => {
  if (!formatted) return 0;
  const numeric = formatted.replace(/\D/g, '');
  return parseFloat(numeric) / 100;
};

const AccountModal = ({ visible, onClose }) => {
  const { accounts, addAccount, removeAccount, updateAccount } = useAccounts();

  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isNewModalVisible, setIsNewModalVisible] = useState(false);

  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accountToRemove, setAccountToRemove] = useState(null);

  // Para novo cadastro
  const [tempAccountName, setTempAccountName] = useState('');
  const [tempInitialBalance, setTempInitialBalance] = useState('');

  // Para edição
  const [accountName, setAccountName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');

  useEffect(() => {
    if (selectedAccount) {
      setAccountName(selectedAccount.name);
      setInitialBalance(
        formatCurrency(
          (selectedAccount.initialBalance ?? 0).toFixed(2).replace('.', ',')
        )
      );
    }
  }, [selectedAccount]);

  const debitAccounts = accounts.filter((acc) => acc.type === 'Debito');

  const handleConfirmNewAccount = () => {
    if (tempAccountName.trim() === '') {
      Alert.alert('Erro', 'O nome da conta não pode estar vazio.');
      return;
    }
    const balance = parseCurrencyToNumber(tempInitialBalance) || 0;
    addAccount(tempAccountName, balance, 'Debito', null, null);
    setTempAccountName('');
    setTempInitialBalance('');
    setIsNewModalVisible(false);
  };

  const handleUpdateAccount = () => {
    if (accountName.trim() === '') {
      Alert.alert('Erro', 'O nome da conta não pode estar vazio.');
      return;
    }
    updateAccount({
      id: selectedAccount.id,
      name: accountName,
      type: selectedAccount.type,
      initialBalance: parseCurrencyToNumber(initialBalance) || 0,
    });
    setIsEditModalVisible(false);
  };

  // Ao clicar na lixeira do modal edição, abre confirmação
  const handleRemoveAccount = () => {
    setAccountToRemove(selectedAccount.id);
    setIsConfirmModalVisible(true);
    setIsEditModalVisible(false);
  };

  const confirmRemoveAccount = () => {
    if (accountToRemove) {
      removeAccount(accountToRemove);
      setAccountToRemove(null);
      setIsConfirmModalVisible(false);
    }
  };

  const handleChangeTempInitialBalance = (text) => {
    const cleaned = text.replace(/[^\d]/g, '');
    setTempInitialBalance(formatCurrency(cleaned));
  };

  const handleChangeInitialBalance = (text) => {
    const cleaned = text.replace(/[^\d]/g, '');
    setInitialBalance(formatCurrency(cleaned));
  };

  return (
    <View>
      {/* Modal principal - Gerir Contas */}
      <Modal
        visible={visible}
        animationType="slide"
        onRequestClose={onClose} 
        transparent={true}
      >
        <View style={styles.fullScreenModal}>
          <View style={styles.modalContent}>
            <View style={styles.headerContainer}>
              <TouchableOpacity style={styles.backButton} onPress={onClose}>
                <Ionicons name="arrow-back" size={30} color="#1976D2" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Gerir Contas</Text>
              <View style={styles.rightHeaderPlaceholder} />
            </View>

            <FlatList
              data={debitAccounts}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedAccount(item);
                    setIsEditModalVisible(true);
                  }}
                  style={styles.card}
                >
                  <View>
                    <Text style={styles.cardText}>{item.name}</Text>
                    <Text style={styles.cardBalance}>
                      {formatCurrency((item.initialBalance ?? 0).toFixed(2).replace('.', ','))}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#666" />
                </TouchableOpacity>
              )}
            />

            <View style={styles.fixedButtonContainer}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setIsNewModalVisible(true)}
              >
                <Text style={styles.addButtonText}>Adicionar Conta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Novo Modal */}
      <Modal visible={isNewModalVisible} animationType="fade" transparent={true}>
        <View style={styles.fullScreenModal}>
          <View style={styles.newModalContent}>
            <Text style={styles.modalTitle}>Nova Conta</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nome da conta"
              value={tempAccountName}
              onChangeText={setTempAccountName}
              autoFocus
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Saldo inicial (opcional)"
              value={tempInitialBalance}
              onChangeText={handleChangeTempInitialBalance}
              keyboardType="numeric"
              maxLength={15}
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setIsNewModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleConfirmNewAccount}
              >
                <Text style={styles.modalButtonText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Editar Modal */}
      <Modal visible={isEditModalVisible} animationType="fade" transparent={true}>
        <View style={styles.fullScreenModal}>
          <View style={styles.newModalContent}>
            <View style={styles.headerContainer}>
              <View style={{ width: 28 }} /> 
              <Text style={styles.modalTitle}>Editar Conta</Text>
              <TouchableOpacity onPress={handleRemoveAccount} style={styles.deleteIconButton}>
                <Ionicons name="trash" size={40} color="#E91E63" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Nome da conta"
              value={accountName}
              onChangeText={setAccountName}
              autoFocus
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Saldo inicial"
              value={initialBalance}
              onChangeText={handleChangeInitialBalance}
              keyboardType="numeric"
              maxLength={15}
            />

            <View style={[styles.modalButtonContainer, { justifyContent: 'flex-end' }]}>
              <TouchableOpacity
                style={[styles.modalCancelButton, { backgroundColor: 'gray', marginRight: 10 }]}
                onPress={() => setIsEditModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleUpdateAccount}
              >
                <Text style={styles.modalButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Confirmar Exclusão */}
      <Modal visible={isConfirmModalVisible} animationType="slide" transparent={true}>
        <View style={styles.fullScreenModal}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.confirmTitle}>Confirmar Exclusão</Text>
            <Text style={styles.confirmText}>
              Tem certeza que deseja apagar esta conta? Todas as movimentações associadas também serão excluídas.
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
                onPress={confirmRemoveAccount}
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

export default AccountModal;

const styles = StyleSheet.create({
  fullScreenModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '100%',
    height: '100%',
    maxWidth: 600,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 0,
  },
  rightHeaderPlaceholder: {
    width: 30,
  },
  modalTitle: {
    flex: 1,
    fontSize: RFValue(24),
    fontWeight: '600',
    color: '#1976D2', // Azul escuro (substituiu verde)
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#E3F2FD', // Azul claro para cards
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3', // Azul borda esquerda
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardText: {
    fontSize: RFValue(18),
    fontWeight: '500',
    color: '#333',
  },
  cardBalance: {
    fontSize: RFValue(14),
    fontWeight: '400',
    color: '#1976D2',
    marginTop: 4,
  },
  listContent: {
    paddingBottom: 80,
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
    backgroundColor: '#2196F3', // Azul do botão
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
  newModalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  confirmModalContent: {
    width: '90%',
    maxWidth: 400,
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
    backgroundColor: '#2196F3',
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
  deleteIconButton: {
    position: 'absolute',
    right: 0,
    padding: 6,
    zIndex: 10,
  },
});
