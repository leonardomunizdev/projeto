import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTransactions } from '../context/TransactionContext';
import { useAccounts } from '../context/AccountContext';
import { useCategories } from '../context/CategoryContext';
import moment from 'moment';
import 'moment/locale/pt-br';

const formatCurrency = (value) => {
  const numberValue = parseFloat(value);
  if (isNaN(numberValue)) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numberValue);
};

const formatDate = (date) => {
  return moment(date, 'YYYY-MM-DD').format('DD/MM/YYYY');
};

const TransactionsScreen = () => {
  const { transactions, removeTransaction } = useTransactions();
  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const route = useRoute();
  const navigation = useNavigation();

  const [filterType, setFilterType] = useState(route.params?.filterType || undefined);
  const [selectedMonth, setSelectedMonth] = useState(moment().startOf('month'));
  const [searchText, setSearchText] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [currentTransaction, setCurrentTransaction] = useState(null);

  const applyFilter = (transactions) => {
    return transactions.filter(transaction =>
      moment(transaction.date, 'YYYY-MM-DD').isSame(selectedMonth, 'month') &&
      (!filterType || transaction.type === filterType) &&
      (searchText === '' || transaction.description.toLowerCase().includes(searchText.toLowerCase()))
    );
  };

  const clearFilter = () => {
    setFilterType(undefined);
    setSearchText('');
  };

  useFocusEffect(
    useCallback(() => {
      const { filterType: receivedFilter } = route.params || {};
      if (receivedFilter) {
        setFilterType(receivedFilter);
      } else {
        clearFilter();
      }

      return () => {
        clearFilter();
      };
    }, [route.params?.filterType])
  );

  const filteredTransactions = applyFilter(transactions).sort((a, b) => moment(a.date).diff(moment(b.date)));

  const changeMonth = (direction) => {
    setSelectedMonth(prevMonth => prevMonth.clone().add(direction, 'month'));
  };

  const getCurrentInstallment = (transaction) => {
    if (!transaction.isRecurring || !transaction.date || !transaction.totalInstallments) {
      return console.log(transaction.date, transaction.description, transaction.isRecurring);
    
    }
  
    const startDate = moment(transaction.startDate, 'YYYY-MM-DD');
    const transactionDate = moment(transaction.date, 'YYYY-MM-DD');
    const totalInstallments = transaction.totalInstallments;
  
    const monthsDifference = transactionDate.diff(startDate, 'months') + 1;
    const installmentNumber = Math.min(monthsDifference, totalInstallments);
  
    return `Parcela ${installmentNumber} de ${totalInstallments}`;
  };

  const getAccountName = (accountId) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account ? account.name : 'Conta desconhecida';
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Categoria desconhecida';
  };

  const handleDelete = (id, isRecurring, date, recurrenceId) => {
    setCurrentTransaction({ id, isRecurring, date, recurrenceId });
    setModalVisible(true);
    setModalType(isRecurring ? 'recurring' : 'single');
  };

  const removeAllRecurringTransactions = () => {
    const { recurrenceId } = currentTransaction;
    const transactionsToRemove = transactions.filter(transaction => transaction.recurrenceId === recurrenceId);
    transactionsToRemove.forEach(transaction => removeTransaction(transaction.id));
    setModalVisible(false);
  };

  const removePreviousRecurringTransactions = () => {
    const { recurrenceId, date } = currentTransaction;
  
    const transactionsToRemove = transactions.filter(transaction => 
      transaction.recurrenceId === recurrenceId && moment(transaction.date).isBefore(date, 'day')
    );
    transactionsToRemove.forEach(transaction => removeTransaction(transaction.id));
    setModalVisible(false);
  };

  const removeFutureRecurringTransactions = () => {
    const { recurrenceId, date } = currentTransaction;
  
    const transactionsToRemove = transactions.filter(transaction => 
      transaction.recurrenceId === recurrenceId && moment(transaction.date).isAfter(date, 'day')
    );
    transactionsToRemove.forEach(transaction => removeTransaction(transaction.id));
    setModalVisible(false);
  };

  const removeTransactionById = () => {
    const { id } = currentTransaction;
    removeTransaction(id);
    setModalVisible(false);
  };

  const formatDayOfWeek = (date) => {
    return moment(date, 'YYYY-MM-DD').format('dddd, DD/MM/YYYY');
  };

  const renderItem = ({ item, index }) => {
    const dayOfWeek = formatDayOfWeek(item.date);
    const previousDate = index > 0 ? filteredTransactions[index - 1].date : null;
    const isNewDay = previousDate !== item.date;

    return (
      <View>
        {isNewDay && (
          <Text style={styles.dateHeader}>
            {dayOfWeek}
          </Text>
        )}
        <TouchableOpacity 
          style={[styles.item, item.type === 'expense' ? styles.expenseItem : styles.incomeItem]}
          onLongPress={() => handleDelete(item.id, item.isRecurring, item.date, item.recurrenceId)}
        >
          <View>
            <View style={styles.row}>
              <Text style={[styles.description]}>
                {item.description}
              </Text>
              <Text style={styles.amount}>
                {formatCurrency(item.amount)}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.category}>
                {getCategoryName(item.categoryId)} | {getAccountName(item.accountId)}
              </Text>
            </View>
            {item.isRecurring && (
              <Text style={styles.installment}>
                {getCurrentInstallment(item)}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Pesquisar por descrição"
        value={searchText}
        onChangeText={setSearchText}
      />

      <FlatList
        data={filteredTransactions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navButton}>
          <Text style={styles.navButtonText}>Anterior</Text>
        </TouchableOpacity>
        <Text style={styles.footerTitle}>
          {selectedMonth.format('MMMM YYYY')}
        </Text>
        <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navButton}>
          <Text style={styles.navButtonText}>Próximo</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {modalType === 'recurring' ? (
              <>
                <Text style={styles.modalTitle}>Excluir transações recorrentes</Text>
                <TouchableOpacity onPress={removeAllRecurringTransactions} style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>Excluir todas as transações</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={removePreviousRecurringTransactions} style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>Excluir transações anteriores</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={removeFutureRecurringTransactions} style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>Excluir transações futuras</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={removeTransactionById} style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>Excluir apenas esta transação</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Excluir transação</Text>
                <TouchableOpacity onPress={removeTransactionById} style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>Excluir</Text>
                </TouchableOpacity>
              </>
            )}
                        <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.modalButton, styles.cancelButton]}>
              <Text style={styles.modalButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  searchInput: {
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingLeft: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  expenseItem: {
    borderLeftColor: '#ff4d4f',
    borderLeftWidth: 5,
  },
  incomeItem: {
    borderLeftColor: '#4caf50',
    borderLeftWidth: 5,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  category: {
    fontSize: 14,
    color: '#999',
  },
  installment: {
    fontSize: 14,
    color: 'black',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  navButton: {
    padding: 10,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007bff',
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalButton: {
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#ff4d4f',
  },
});

export default TransactionsScreen;

             
