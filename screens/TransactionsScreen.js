import React, { useState, useCallback } from 'react';
import { View, Text, Button, Modal, FlatList, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTransactions } from '../context/TransactionContext';
import { useAccounts } from '../context/AccountContext';
import { useCategories } from '../context/CategoryContext';
import moment from 'moment';
import 'moment/locale/pt-br';
import { Swipeable } from 'react-native-gesture-handler';

// Função para formatar valores em reais (R$)
const formatCurrency = (value) => {
  const numberValue = parseFloat(value);
  if (isNaN(numberValue)) {
    return 'R$ 0,00'; // Valor padrão em caso de erro
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numberValue);
};

// Função para formatar datas no padrão brasileiro (dd/mm/yyyy)
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

  // Estado para modais
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [currentTransaction, setCurrentTransaction] = useState(null);

  // Função para aplicar o filtro
  const applyFilter = (transactions) => {
    return transactions.filter(transaction =>
      moment(transaction.date, 'YYYY-MM-DD').isSame(selectedMonth, 'month') &&
      (!filterType || transaction.type === filterType) &&
      (searchText === '' || transaction.description.toLowerCase().includes(searchText.toLowerCase()))
    );
  };

  // Função para limpar o filtro
  const clearFilter = () => {
    setFilterType(undefined);
    setSearchText('');
  };

  // Atualiza o filtro e mês selecionado quando a tela ganhar foco
  useFocusEffect(
    useCallback(() => {
      const { filterType: receivedFilter } = route.params || {};
      if (receivedFilter) {
        setFilterType(receivedFilter);
      } else {
        clearFilter();
      }

      // Retorna uma função para limpar o filtro ao sair da tela
      return () => {
        clearFilter();
      };
    }, [route.params?.filterType])
  );

  // Filtra transações para o mês selecionado e com base no tipo de filtro
  const filteredTransactions = applyFilter(transactions);

  // Função para mudar o mês
  const changeMonth = (direction) => {
    setSelectedMonth(prevMonth => prevMonth.clone().add(direction, 'month'));
  };

  // Função para calcular a parcela atual de uma transação recorrente
  const getCurrentInstallment = (transaction) => {
    if (!transaction.isRecurring || !transaction.startDate || !transaction.totalInstallments) {
      return '';
    }
  
    const startDate = moment(transaction.startDate, 'YYYY-MM-DD');
    const transactionDate = moment(transaction.date, 'YYYY-MM-DD');
    const totalInstallments = transaction.totalInstallments;
  
    // Calcular o número de parcelas
    const monthsDifference = transactionDate.diff(startDate, 'months') + 1;
    const installmentNumber = Math.min(monthsDifference, totalInstallments);
  
    return `Parcela ${installmentNumber} de ${totalInstallments}`;
  };

  // Função para obter o nome da conta com base no ID
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
    console.log('Transações a remover (todas):', transactionsToRemove);
    transactionsToRemove.forEach(transaction => removeTransaction(transaction.id));
    setModalVisible(false);
  };

  const removePreviousRecurringTransactions = () => {
    const { recurrenceId, date } = currentTransaction;
    if (!isValidDate(date)) {
      console.error('Data da transação inválida:', date);
      return;
    }
  
    const transactionsToRemove = transactions.filter(transaction => 
      transaction.recurrenceId === recurrenceId && moment(transaction.date).isBefore(date, 'day')
    );
    console.log('Transações a remover (anteriores):', transactionsToRemove);
    transactionsToRemove.forEach(transaction => removeTransaction(transaction.id));
    setModalVisible(false);
  };

  const removeFutureRecurringTransactions = () => {
    const { recurrenceId, date } = currentTransaction;
    if (!isValidDate(date)) {
      console.error('Data da transação inválida:', date);
      return;
    }
  
    const transactionsToRemove = transactions.filter(transaction => 
      transaction.recurrenceId === recurrenceId && moment(transaction.date).isAfter(date, 'day')
    );
    console.log('Transações a remover (posteriores):', transactionsToRemove);
    transactionsToRemove.forEach(transaction => removeTransaction(transaction.id));
    setModalVisible(false);
  };

  const removeTransactionById = () => {
    const { id } = currentTransaction;
    removeTransaction(id);
    setModalVisible(false);
  };

  const isValidDate = (date) => moment(date, 'YYYY-MM-DD', true).isValid();

  const renderItem = ({ item }) => {
    const renderRightActions = () => (
      <TouchableOpacity
        onPress={() => handleDelete(item.id, item.isRecurring, item.date, item.recurrenceId)}
        style={styles.deleteButton}
      >
        <Text style={[styles.incomeItem, styles.deleteButtonText ]}>Excluir</Text>
      </TouchableOpacity>
    );

    return (
      <Swipeable renderRightActions={renderRightActions}>
        <View style={[styles.item, item.type === 'expense' ? styles.expenseItem : styles.incomeItem]}>
          <View style={styles.row}>
            <Text style={[styles.description]}>
              {item.description}
            </Text>
            <Text style={[styles.amount, item.type === 'expense' ? styles.expenseAmount : styles.incomeAmount]}>
              {formatCurrency(item.amount)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.category]}>
              {getCategoryName(item.categoryId)}   |   {getAccountName(item.accountId)}
            </Text>
          </View>
          {item.isRecurring && (
            <Text style={[styles.installment]}>
              {getCurrentInstallment(item)}
            </Text>
          )}
        </View>
      </Swipeable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Barra de pesquisa */}
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
      
      {/* Modais */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {modalType === 'single' && (
              <View>
                <Text style={styles.modalTitle}>Excluir transação</Text>
                <Text>Tem certeza de que deseja excluir esta transação?</Text>
                <TouchableOpacity onPress={removeTransactionById} style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>Sim</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>Não</Text>
                </TouchableOpacity>
              </View>
            )}
            {modalType === 'recurring' && (
              <View>
                <Text style={styles.modalTitle}>Excluir transações recorrentes</Text>
                <TouchableOpacity onPress={removeAllRecurringTransactions} style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>Excluir todas</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={removePreviousRecurringTransactions} style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>Excluir anteriores</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={removeFutureRecurringTransactions} style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>Excluir futuras</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    padding: 10,
    paddingTop: 30,
  },
  searchInput: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  listContent: {
    paddingBottom: 80,
  },
  item: {
    padding: 15,
    margin: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    borderLeftWidth: 5,
  },
  expenseItem: {
    borderLeftColor: 'red',
  },
  incomeItem: {
    borderLeftColor: 'blue',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  description: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  date: {
    fontSize: 14,
    color: '#888',
  },
  category: {
    fontSize: 14,
    color: '#888',
  },
  account: {
    fontSize: 14,
    color: '#888',
  },
  installment: {
    fontSize: 1,
    color: '#888',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  expenseAmount: {
    color: 'red',
  },
  incomeAmount:{
    color: 'blue',

  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalButton: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  modalButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
  },
  navButton: {
    padding: 10,
  },
  navButtonText: {
    fontSize: 18,
    color: '#007bff',
  },
  footerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    justifyContent: 'center',
    alignItems: 'center',
    height: '70%',
    width: 100,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default TransactionsScreen;
