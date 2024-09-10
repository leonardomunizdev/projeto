import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Button, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import addTransactionsStyles from '../../../styles/screens/addTransactionsScreenStyles';

const EditAccountModal = ({ visible, onClose, account, onSave }) => {
  const [accountType, setAccountType] = useState('Debito');
  const [accountName, setAccountName] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [dueDate, setDueDate] = useState('1'); // Valor inicial como string para controle

  useEffect(() => {
    if (account) {
      setAccountType(account.type);
      setCreditLimit(account.initialBalance?.toString() || '');
      setDueDate((account.dueDate || 1).toString()); // Garantir que é uma string
      setAccountName(account.name);
    }
  }, [account]);

  const handleSave = () => {
    if (accountType === 'Debito' && accountName.trim() === '') {
      Alert.alert('Erro', 'O nome da conta não pode estar vazio.');
      return;
    }
  
    onSave(
      account.id,
      accountType === 'Debito' ? accountName : account.name,
      accountType,
      accountType === 'Credito' ? parseFloat(creditLimit) : undefined,
      accountType === 'Credito' ? parseInt(dueDate, 10) : undefined // Converter para número ao salvar
    );
    onClose();
  };
  

  const increaseDueDate = () => {
    setDueDate(prev => {
      const newValue = parseInt(prev, 10) + 1;
      return newValue <= 28 ? newValue.toString() : '28';
    });
  };

  const decreaseDueDate = () => {
    setDueDate(prev => {
      const newValue = parseInt(prev, 10) - 1;
      return newValue >= 1 ? newValue.toString() : '1';
    });
  };

  const handleDueDateChange = (text) => {
    const value = parseInt(text, 10);

    if (!isNaN(value)) {
      if (value > 28) {
        Alert.alert('Erro', 'O dia de vencimento não pode ser maior que 28.');
        setDueDate('28'); // Resetar para 28 se o valor for maior que 28
      } else if (value < 1) {
        Alert.alert('Erro', 'O dia de vencimento não pode ser menor que 1.');
        setDueDate('1'); // Resetar para 1 se o valor for menor que 1
      } else {
        setDueDate(value.toString()); // Atualizar o estado com o valor válido
      }
    } else {
      setDueDate('1'); // Valor padrão se o input for inválido
    }
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

          {accountType === 'Debito' && (
            <TextInput
              style={styles.input}
              value={accountName}
              onChangeText={setAccountName}
              placeholder="Nome da conta"
            />
          )}

          {accountType === 'Credito' && (
            <>
              <TextInput
                style={styles.input}
                value={creditLimit}
                onChangeText={setCreditLimit}
                placeholder="Limite do cartão de crédito"
                keyboardType="numeric"
              />
              <View style={addTransactionsStyles.recurrenceLabelContainer}>
                <Text style={{ flexDirection: 'left', fontSize: 20 }}>Vencimento (Dia)</Text>
                <View style={addTransactionsStyles.recurrenceControls}>
                  <TouchableOpacity
                    style={addTransactionsStyles.recurrenceButton}
                    onPress={decreaseDueDate}
                  >
                    <Ionicons name={"chevron-down-outline"} />
                  </TouchableOpacity>

                  <TextInput
                    style={addTransactionsStyles.recurrenceInput}
                    value={dueDate}
                    keyboardType="numeric"
                    onChangeText={handleDueDateChange}
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

          <Button title="Salvar" onPress={handleSave} />
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
    justifyContent: 'flex-end'
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
