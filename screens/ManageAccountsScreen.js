import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { useAccounts } from '../context/AccountContext';

const ManageAccountsModal = ({ isVisible, onClose }) => {
  const { accounts, addAccount, removeAccount, editAccount } = useAccounts();
  const [newAccountName, setNewAccountName] = useState('');

  const handleAddAccount = () => {
    if (newAccountName.trim()) {
      addAccount(newAccountName);
      setNewAccountName('');
    }
  };

  return (
    <View style={[styles.modal, isVisible ? styles.visible : styles.hidden]}>
      <Text style={styles.title}>Gerenciar Contas</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome da nova conta"
        value={newAccountName}
        onChangeText={setNewAccountName}
      />
      <Button title="Adicionar Conta" onPress={handleAddAccount} />
      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id} // Define a chave única aqui
        renderItem={({ item }) => (
          <View style={styles.accountItem}>
            <Text style={styles.accountName}>{item.name}</Text>
            <Button title="Remover" onPress={() => removeAccount(item.id)} />
          </View>
        )}
      />
      <Button title="Fechar" onPress={onClose} />
    </View>
  );
};

const styles = StyleSheet.create({
  modal: {
    // Estilos do modal
  },
  visible: {
    display: 'flex',
  },
  hidden: {
    display: 'none',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  accountName: {
    fontSize: 18,
  },
});

export default ManageAccountsModal;
