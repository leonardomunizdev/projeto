import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Platform, Modal, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, addMonths, addWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Switch } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { useTransactions } from '../context/TransactionContext';
import { useAccounts } from '../context/AccountContext';
import { useCategories } from '../context/CategoryContext';
import UUID from 'react-native-uuid';

const formatCurrency = (value) => {
  return `${parseFloat(value).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
};

const AddTransactionScreen = () => {
  const navigation = useNavigation();
  const { addTransaction } = useTransactions();
  const { accounts } = useAccounts();
  const { categories } = useCategories();

  const [transactionType, setTransactionType] = useState('income');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [expenseCategory, setExpenseCategory] = useState('');
  const [incomeCategory, setIncomeCategory] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [accountName, setAccountName] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrence, setRecurrence] = useState({ count: '', unit: 'month' });
  const [recurrenceInfo, setRecurrenceInfo] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showRecurrenceModal, setShowRecurrenceModal] = useState(false);

  useEffect(() => {
    setShowRecurrenceModal(isRecurring);
  }, [isRecurring]);

  const generateRecurringTransactions = (transaction, recurrenceId) => {
    const transactions = [];
    let nextDate = new Date(date);

    for (let i = 0; i < recurrence.count; i++) {
      transactions.push({
        ...transaction,
        id: UUID.v4(),
        recurrenceId,
        date: format(nextDate, 'yyyy-MM-dd', { locale: ptBR }),
        isRecurring,
      });

      if (recurrence.unit === 'month') {
        nextDate = addMonths(nextDate, 1);
      } else if (recurrence.unit === 'week') {
        nextDate = addWeeks(nextDate, 1);
      }
    }

    return transactions;
  };

  const handleSave = () => {
    if (isNaN(recurrence.count) || recurrence.count <= 0) {
      Alert.alert('Erro', 'Quantidade de períodos deve ser um número positivo.');
      return;
    }

    const unitText = recurrence.unit === 'month' ? 'meses' : 'semanas';
    setRecurrenceInfo(`Repetir por ${recurrence.count} ${unitText}`);
    setShowRecurrenceModal(false);
  };

  const handleSaveAndNavigate = () => {
    if (!description || !amount || !selectedAccount) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('Erro', 'O valor deve ser um número positivo.');
      return;
    }

    const recurrenceId = UUID.v4(); // Gerar um UUID para a recorrência
    const baseTransaction = {
      id: UUID.v4(),
      type: transactionType,
      description,
      amount: parseFloat(amount),
      date: format(date, 'yyyy-MM-dd', { locale: ptBR }),
      startDate: date,
      accountId: selectedAccount,
      accountName,
      categoryId: transactionType === 'expense' ? expenseCategory : incomeCategory,
      categoryName,
      isRecurring,
      recurrenceId, // Adicionar o RecurrenceId
    };

    const transactions = isRecurring ? generateRecurringTransactions(baseTransaction, recurrenceId) : [baseTransaction];

    transactions.forEach(transaction => {
      addTransaction(transaction);
    });

    setTransactionType('expense');
    setAmount('');
    setDescription('');
    setDate(new Date());
    setExpenseCategory('');
    setIncomeCategory('');
    setSelectedAccount('');
    setAccountName('');
    setIsRecurring(false);
    setRecurrence({ count: '', unit: 'month' });
    setRecurrenceInfo('');

    navigation.navigate('Home');
  };

  const handleIncrement = () => {
    setRecurrence(prevRecurrence => ({
      ...prevRecurrence,
      count: (parseInt(prevRecurrence.count, 10) || 0) + 1
    }));
  };

  const handleDecrement = () => {
    setRecurrence(prevRecurrence => ({
      ...prevRecurrence,
      count: Math.max((parseInt(prevRecurrence.count, 10) || 0) - 1, 0)
    }));
  };

  const handleRecurrenceCountChange = (text) => {
    const parsedValue = parseInt(text, 10);
    if (!isNaN(parsedValue) && parsedValue > 0) {
      setRecurrence(prevRecurrence => ({ ...prevRecurrence, count: parsedValue }));
    } else {
      setRecurrence(prevRecurrence => ({ ...prevRecurrence, count: '' }));
    }
  };

  const handleTransactionTypeChange = (type) => {
    setTransactionType(type);
    setExpenseCategory('');
    setIncomeCategory('');
  };

  const getButtonStyle = (type) => ({
    ...styles.transactionButton,
    backgroundColor: transactionType === type ? (type === 'expense' ? 'red' : 'blue') : '#ddd',
  });

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const handleAccountChange = (itemValue) => {
    setSelectedAccount(itemValue);
    const account = accounts.find(acc => acc.id === itemValue);
    setAccountName(account ? account.name : '');
  };

  const handleValueChange = (itemValue) => {
    if (transactionType === 'expense') {
      setExpenseCategory(itemValue);
      handleCategoryChange(itemValue);
    } else {
      setIncomeCategory(itemValue);
      handleCategoryChange(itemValue);
    }
  };

  const handleCategoryChange = (itemValue) => {
    setSelectedCategory(itemValue);
    const category = categories.find(cat => cat.id === itemValue);
    setCategoryName(category ? category.name : '');
  };

  const filteredCategories = categories.filter(cat => cat.type === transactionType);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Adicionar Transação</Text>

        <View style={styles.transactionTypeContainer}>
          <TouchableOpacity style={getButtonStyle('expense')} onPress={() => handleTransactionTypeChange('expense')}>
            <Text style={styles.transactionButtonText}>Despesa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={getButtonStyle('income')} onPress={() => handleTransactionTypeChange('income')}>
            <Text style={styles.transactionButtonText}>Receita</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Descrição"
          value={description}
          onChangeText={setDescription}
        />
        <TextInput
          style={styles.input}
          placeholder="Valor"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <Picker
          selectedValue={selectedAccount}
          onValueChange={handleAccountChange}
          style={styles.picker}
        >
          <Picker.Item label="Selecione uma conta" value="" />
          {accounts.map(acc => (
            <Picker.Item key={acc.id} label={acc.name} value={acc.id} />
          ))}
        </Picker>

        <Picker
          selectedValue={transactionType === 'expense' ? expenseCategory : incomeCategory}
          onValueChange={handleValueChange}
          style={styles.picker}
        >
          <Picker.Item label="Selecione uma categoria" value="" />
          {filteredCategories.map(cat => (
            <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
          ))}
        </Picker>

        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <Text>Data: {format(date, 'dd/MM/yyyy')}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onChange}
          />
        )}

        <View style={styles.switchContainer}>
          <Text>Repetir</Text>
          <Switch
            value={isRecurring}
            onValueChange={(value) => setIsRecurring(value)}
          />
        </View>


        \\modal de adicionar conta
        {isRecurring && (
          <Modal
            visible={showRecurrenceModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowRecurrenceModal(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Configurar Recorrência</Text>

                

                <Picker
                  selectedValue={recurrence.unit}
                  onValueChange={(itemValue) =>
                    setRecurrence((prevRecurrence) => ({
                      ...prevRecurrence,
                      unit: itemValue,
                    }))
                  }
                  style={styles.picker}
                >
                  <Picker.Item label="Mensal" value="month" />
                  <Picker.Item label="Semanal" value="week" />
                </Picker>

                <View style={styles.incrementDecrementContainer}>
                  <TouchableOpacity style={styles.incrementButton} onPress={handleDecrement}>
                    <Text style={styles.incrementButtonText}>-</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.recurrenceInput}
                    placeholder="Quantidade"
                    keyboardType="numeric"
                    value={recurrence.count.toString()}
                    onChangeText={handleRecurrenceCountChange}
                  />
                  <TouchableOpacity style={styles.incrementButton} onPress={handleIncrement}>
                    <Text style={styles.incrementButtonText}>+</Text>
                  </TouchableOpacity>
                </View>

                <Button title="Salvar" onPress={handleSave} />
              </View>
            </View>
          </Modal>
        )}

        <Text>{recurrenceInfo}</Text>

        <Button title="Salvar" onPress={handleSaveAndNavigate} />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 16,
  },
  transactionTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  transactionButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    alignItems: 'center',
    borderRadius: 5,
  },
  transactionButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  incrementDecrementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  incrementButton: {
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  incrementButtonText: {
    fontSize: 18,
  },
  recurrenceInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 8,
    textAlign: 'center',
  },
});

export default AddTransactionScreen;
