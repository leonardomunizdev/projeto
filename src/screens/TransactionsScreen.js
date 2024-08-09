import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTransactions } from '../context/TransactionContext';
import { useAccounts } from '../context/AccountContext';
import { useCategories } from '../context/CategoryContext';
import {styles} from '../styles/screens/TransactionsScreenStyles'
import moment from 'moment';
import 'moment/locale/pt-br';

// FORMATA OS VALORES PARA REAIS(BRL)
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
//////////////////////////////////////////////////

const TransactionsScreen = () => {
  const { transactions, removeTransaction } = useTransactions();
  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const route = useRoute();
 

  const [filterType, setFilterType] = useState(route.params?.filterType || undefined);
  const [selectedMonth, setSelectedMonth] = useState(moment().startOf('month'));
  const [searchText, setSearchText] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [currentTransaction, setCurrentTransaction] = useState(null);


  // CONTROLE DE FILTROS
  const applyFilter = (transactions) => {
    return transactions.filter(transaction =>
      moment(transaction.date, 'YYYY-MM-DD').isSame(selectedMonth, 'month') &&
      (!filterType || transaction.type === filterType) &&
      (searchText === '' || transaction.description.toLowerCase().includes(searchText.toLowerCase()))
    );
  };

  useFocusEffect(
    useCallback(() => {
      const { filterType: receivedFilter } = route.params || {};
      if (receivedFilter) {
        setFilterType(receivedFilter);
      } else {
        setFilterType(undefined);
      }

      return () => {
        setFilterType(undefined);
        
      };
    }, [route.params?.filterType])
  );

  const filteredTransactions = applyFilter(transactions).sort((a, b) => moment(a.date).diff(moment(b.date)));
  //////////////////////////////////////////////////

  // FUNÇÃO PARA MUDANÇA DE MÊS
  const changeMonth = (direction) => {
    setSelectedMonth(prevMonth => prevMonth.clone().add(direction, 'month'));
  };
  //////////////////////////////////////////////////


  // FUNÇÃO PARA CONTAGEM DE PARECLAS
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
  //////////////////////////////////////////////////

  // FUNÇÕES PARA PEGAR OS NOMES DAS CONTAS E DAS CATEGORIAS
  const getAccountName = (accountId) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account ? account.name : 'Conta desconhecida';
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Categoria desconhecida';
  };
  //////////////////////////////////////////////////
  
  // FUNÇÕES PARA DELETAR TRANSAÇÕES  
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
  //////////////////////////////////////////////////

  // FUNÇÃO DE FORMATAÇÃO DE DATA
  const formatDayOfWeek = (date) => {
    return moment(date, 'YYYY-MM-DD').format('dddd, DD/MM/YYYY');
  };
  //////////////////////////////////////////////////

  // RENDERIZAÇÃO DAS TRANSAÇÕES
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
  {/*/////////////////////////////////////////////////////////////////////////////////////////// */}

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

      {/*  MODAL DE EXCLUSÃO DE TRANSAÇÕES  */}
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
                  <Text style={styles.modalButtonText}>Todas as parcelas</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={removePreviousRecurringTransactions} style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>Parcelas anteriores</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={removeFutureRecurringTransactions} style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>Parcelas futuras</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={removeTransactionById} style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>Esta parcela</Text>
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
      {/*/////////////////////////////////////////////////////////////////////////////////////////// */}

    </View>
  );
};


export default TransactionsScreen;

             
