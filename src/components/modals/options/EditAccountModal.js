import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Button, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// Remova esta linha duplicada
import { StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import optionsStyles from '../../../styles/screens/OptionsScreenStyles';
import addTransactionsStyles from '../../../styles/screens/addTransactionsScreenStyles';

const EditAccountModal = ({ visible, onClose, account, onSave }) => {
  const [selectedCategory, setSelectedCategory] = useState("Debito");
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState('Debito'); // Estado para o tipo de conta
  const [dueDate, setDueDate] = useState(1); // Estado para o dia de vencimento

  useEffect(() => {
    if (account) {
      setAccountName(account.name);
      setAccountType(account.type); // Definir tipo da conta ao abrir o modal
      setDueDate(account.dueDate || 1); // Definir o dia de vencimento, com valor padrão 1
    }
  }, [account]);

  const handleSave = () => {
    if (accountName.trim() === '') {
      Alert.alert('Erro', 'O nome da conta não pode estar vazio.');
      return;
    }
    // Passa o tipo da conta e o dia de vencimento para o onSave
    onSave(account.id, accountName, accountType, accountType === 'Credito' ? dueDate : undefined);
    onClose();
  };

  const increaseDueDate = () => setDueDate(prev => (prev < 31 ? prev + 1 : prev));
  const decreaseDueDate = () => setDueDate(prev => (prev > 1 ? prev - 1 : prev));

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
            style={styles.input}
            value={accountName}
            onChangeText={setAccountName}
            placeholder="Nome da conta"
          />

          <View style={optionsStyles.categoryButtonContainer}>

            <TouchableOpacity
              style={[optionsStyles.categoryButton,
              selectedCategory === 'Credito' && optionsStyles.expenseButton,
              ]}
              onPress={() => setSelectedCategory('Credito')}
            >
              <Text style={[optionsStyles.categoryButtonText,
              selectedCategory === 'Credito' && optionsStyles.incomeButtonText
              ]}>Credito</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[optionsStyles.categoryButton,
              selectedCategory === 'Debito' && optionsStyles.incomeButton
              ]}
              onPress={() => setSelectedCategory('Debito')}
            >
              <Text style={[optionsStyles.categoryButtonText,
              selectedCategory === 'Debito' && optionsStyles.expenseButtonText
              ]}>Debito</Text>
            </TouchableOpacity>
          </View>

          {accountType === 'Credito' && (
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
          )}

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
