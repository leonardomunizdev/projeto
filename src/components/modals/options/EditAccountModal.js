import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Button, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// Remova esta linha duplicada
import { StyleSheet } from 'react-native';

const EditAccountModal = ({ visible, onClose, account, onSave }) => {
  const [accountName, setAccountName] = useState('');

  useEffect(() => {
    if (account) {
      setAccountName(account.name);
    }
  }, [account]);

  const handleSave = () => {
    if (accountName.trim() === '') {
      Alert.alert('Erro', 'O nome da conta não pode estar vazio.');
      return;
    }
    onSave(account.id, accountName); // Verifique se `onSave` está recebendo `updateAccount`
    onClose();
  };
  

  return (
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
          <Text style={styles.modalTitle}>Editar Conta</Text>
          <TextInput
            style={[styles.input]} // Usando ambos os estilos
            value={accountName}
            onChangeText={setAccountName}
            placeholder="Nome da conta"
          />
          <Button title="Salvar Alterações" onPress={handleSave} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreenModal: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
      width: '80%',
      backgroundColor: 'white',
      padding: 20,
      borderRadius: 10,
      alignItems: 'center',
  },
  closeButton: {
      alignSelf: 'flex-end',
  },
  modalTitle: {
      fontSize: 20,
      marginBottom: 10,
  },
  input: {
      width: '100%',
      padding: 10,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      marginBottom: 15,
  },
});
export default EditAccountModal;
