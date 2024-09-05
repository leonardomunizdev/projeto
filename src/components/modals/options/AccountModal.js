import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Button, TouchableOpacity, Alert, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import optionsStyles from '../../../styles/screens/OptionsScreenStyles';
import { useAccounts } from '../../../context/AccountContext';
import EditAccountModal from './EditAccountModal';
import { Picker } from '@react-native-picker/picker';
import addTransactionsStyles from '../../../styles/screens/addTransactionsScreenStyles';

const AccountModal = ({ visible, onClose }) => {
  const { accounts, addAccount, removeAccount, updateAccount, calculateAccountBalance } = useAccounts();
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [accountToRemove, setAccountToRemove] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [creditLimit, setCreditLimit] = useState('');
  const [dueDate, setDueDate] = useState(1); // Default to 1
  const [newAccountName, setNewAccountName] = useState('');
  const creditAccounts = accounts.filter(account => account.type === 'Credito');
  const debitAccounts = accounts.filter(account => account.type === 'Debito');

  useEffect(() => {
    if (selectedCategory === 'Credito' && selectedAccount) {
      const selectedAccountName = accounts.find(account => account.id === selectedAccount)?.name || '';
      setNewAccountName(`Credito ${selectedAccountName}`);
    } else if (selectedCategory === 'Debito') {
      setNewAccountName(''); // Permitir o usuário definir o nome da conta
    }
  }, [selectedCategory, selectedAccount]);

  const handleAddAccount = () => {
    if (selectedCategory === 'Credito' && !selectedAccount) {
      Alert.alert('Erro', 'Selecione uma conta para associar ao crédito.');
      return;
    }

    if (newAccountName.trim() === '' && selectedCategory === 'Debito') {
      Alert.alert('Erro', 'O nome da conta não pode estar vazio.');
      return;
    }

    addAccount(newAccountName, selectedCategory === 'Credito' ? parseFloat(creditLimit) : 0, selectedCategory, dueDate); // Passa o dueDate
    setCreditLimit('');
    setDueDate(1); // Reseta para o padrão
    setNewAccountName(''); // Limpar o nome da conta após adicionar
    setSelectedAccount(null);
    setSelectedCategory(null); // Voltar ao estado inicial
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

  // Funções para manipular o dia de vencimento
  const increaseDueDate = () => setDueDate(prev => prev < 31 ? prev + 1 : prev);
  const decreaseDueDate = () => setDueDate(prev => prev > 1 ? prev - 1 : prev);

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
            <View style={optionsStyles.categoryButtonContainer}>
              <TouchableOpacity
                style={[optionsStyles.categoryButton, optionsStyles.expenseButton, selectedCategory === 'Credito' && optionsStyles.selectedButton]}
                onPress={() => setSelectedCategory('Credito')}
              >
                <Text style={optionsStyles.expenseButtonText}>Credito</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[optionsStyles.categoryButton, optionsStyles.incomeButton, selectedCategory === 'Debito' && optionsStyles.selectedButton]}
                onPress={() => setSelectedCategory('Debito')}
              >
                <Text style={optionsStyles.incomeButtonText}>Debito</Text>
              </TouchableOpacity>
            </View>

            {selectedCategory === 'Credito' && (
              <>
                <Picker
                  selectedValue={selectedAccount}
                  style={optionsStyles.picker}
                  onValueChange={(itemValue) => setSelectedAccount(itemValue)}
                >
                  {accounts.map(account => (
                    <Picker.Item key={account.id} label={account.name} value={account.id} />
                  ))}
                </Picker>
                <TextInput
                  style={optionsStyles.input}
                  value={creditLimit}
                  onChangeText={setCreditLimit}
                  placeholder="Limite do cartão de crédito"
                  keyboardType="numeric"
                />
                <View style={addTransactionsStyles.recurrenceLabelContainer}>
                  <Text style={{ flexDirection: 'left', fontSize: 20 }}>Dia de Vencimento</Text>
                  <View style={addTransactionsStyles.recurrenceControls}>
                    <TouchableOpacity
                      style={addTransactionsStyles.recurrenceButton}
                      onPress={decreaseDueDate}
                    >
                      <Ionicons name={"chevron-down-outline"} />
                    </TouchableOpacity>

                    <TextInput
                      style={addTransactionsStyles.recurrenceInput}
                      value={dueDate.toString()}
                      keyboardType="numeric"
                      editable={false}
                    />

                    <TouchableOpacity
                      style={addTransactionsStyles.recurrenceButton}
                      onPress={increaseDueDate}
                    >
                      <Ionicons name={"chevron-up-outline"} />
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}

            {selectedCategory === 'Debito' && (
              <TextInput
                style={optionsStyles.input}
                value={newAccountName}
                onChangeText={setNewAccountName}
                placeholder="Nome da nova conta"
              />
            )}

            <Button title="Adicionar Conta" onPress={handleAddAccount} />
            {selectedCategory === 'Debito' && (
              <FlatList
                data={debitAccounts}
                keyExtractor={item => item.id}
                ListHeaderComponent={() => (
                  <Text style={optionsStyles.sectionHeader}>Contas de Débito</Text>
                )}
                renderItem={({ item }) => (
                  <View style={optionsStyles.accountItem}>
                    <Text style={optionsStyles.accountName}>
                      {item.name} {'\n'}
                      Saldo: {calculateAccountBalance(item.id).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
            )}
            {selectedCategory === 'Credito' && (
              <FlatList
                data={creditAccounts}
                keyExtractor={item => item.id}
                ListHeaderComponent={() => (
                  <Text style={optionsStyles.sectionHeader}>Contas de Crédito</Text>
                )}
                renderItem={({ item }) => (
                  <View style={optionsStyles.accountItem}>
                    <Text style={optionsStyles.accountName}>
                      {item.name} {'\n'}
                      Limite: {item.initialBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} {'\n'}
                      Vencimento: Dia {item.dueDate || 'N/A'}
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
            )}
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
