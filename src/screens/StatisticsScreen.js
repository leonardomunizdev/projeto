import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, Button, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCategories } from '../context/CategoryContext';
import { useTransactions } from '../context/TransactionContext';
import { useAccounts } from '../context/AccountContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

const DashboardScreen = () => {
  const { categories } = useCategories();
  const { transactions } = useTransactions();
  const { accounts } = useAccounts(); // Adiciona contas do contexto
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState('all'); // Adiciona estado para tipo de transação

  // Estados para os filtros
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);
  const [filteredBalance, setFilteredBalance] = useState(0); // Novo estado para o saldo filtrado

  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedAccount('all');
    setSelectedType('all');
    setStartDate(null);
    setEndDate(null);
  };

  const showStartDatePicker = () => setStartDatePickerVisible(true);
  const hideStartDatePicker = () => setStartDatePickerVisible(false);

  const showEndDatePicker = () => setEndDatePickerVisible(true);
  const hideEndDatePicker = () => setEndDatePickerVisible(false);

  const applyFilters = () => {
    return transactions.filter((transaction) => {
      const matchCategory = selectedCategory === 'all' || transaction.categoryId === selectedCategory;
      const matchAccount = selectedAccount === 'all' || transaction.accountId === selectedAccount;
      const matchType = selectedType === 'all' || transaction.type === selectedType;

      const matchStartDate = !startDate || new Date(transaction.date) >= startDate;
      const matchEndDate = !endDate || new Date(transaction.date) <= endDate;

      return matchCategory && matchAccount && matchType && matchStartDate && matchEndDate;
    });
  };

  // Filtra e calcula os dados para a visão geral
  const filteredTransactions = applyFilters();

  // Calcular saldo filtrado
  useEffect(() => {
    const balance = filteredTransactions.reduce((total, transaction) => {
      return transaction.type === 'income' ? total + transaction.amount : total - transaction.amount;
    }, 0);
    setFilteredBalance(balance);
  }, [filteredTransactions]);

  const totalRevenues = filteredTransactions
    .filter(transaction => transaction.type === 'income')
    .reduce((total, transaction) => total + transaction.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(transaction => transaction.type === 'expense')
    .reduce((total, transaction) => total + transaction.amount, 0);

  const quantityRevenues = filteredTransactions.filter(transaction => transaction.type === 'income').length;
  const quantityExpenses = filteredTransactions.filter(transaction => transaction.type === 'expense').length;

  const avgRevenuePerDay = quantityRevenues > 0 ? totalRevenues / quantityRevenues : 0;
  const avgExpensePerDay = quantityExpenses > 0 ? totalExpenses / quantityExpenses : 0;

  const calculateCategoryTotals = (type) => {
    return categories
      .filter(cat => cat.type === type)
      .map(cat => {
        const totalForCategory = filteredTransactions
          .filter(transaction => transaction.categoryId === cat.id && transaction.type === type)
          .reduce((total, transaction) => total + transaction.amount, 0);

        return {
          ...cat,
          total: totalForCategory,
          percentage: (totalForCategory / (type === 'expense' ? totalExpenses : totalRevenues)) * 100,
        };
      })
      .filter(cat => cat.total > 0);
  };

  const expenseCategories = calculateCategoryTotals('expense');
  const incomeCategories = calculateCategoryTotals('income');

  const balanceColor = filteredBalance > 0 
    ? styles.balancePositive 
    : filteredBalance < 0 
    ? styles.balanceNegative 
    : styles.balanceZero;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Relatório</Text>
        <TouchableOpacity onPress={openModal} style={styles.iconButton}>
          <Icon name="menu" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {selectedType === 'all' || selectedType === 'income' ? (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Receitas por Categoria</Text>
          {incomeCategories.length > 0 ? (
            incomeCategories.map(item => (
              <View style={styles.item} key={item.id}>
                <Text style={styles.categoryItem}>
                  {item.name} ({item.percentage.toFixed(2)}%) {item.total.toFixed(2)}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noData}>Nenhuma receita por categoria.</Text>
          )}
        </View>
      ) : null}

      {selectedType === 'all' || selectedType === 'expense' ? (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Despesas por Categoria</Text>
          {expenseCategories.length > 0 ? (
            expenseCategories.map(item => (
              <View style={styles.item} key={item.id}>
                <Text style={styles.categoryItem}>
                  {item.name} ({item.percentage.toFixed(2)}%) {item.total.toFixed(2)}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noData}>Nenhuma despesa por categoria.</Text>
          )}
        </View>
      ) : null}

      {selectedType === 'all' || selectedType === 'income' ? (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Receitas</Text>
          {filteredTransactions.filter(transaction => transaction.type === 'income').length > 0 ? (
            filteredTransactions.filter(transaction => transaction.type === 'income').map(item => (
              <View style={styles.transactionItemContainer} key={item.id}>
                <Text style={styles.transactionItem}>
                  {item.date} / {item.categoryName} / {item.amount.toFixed(2)}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noData}>Nenhuma receita encontrada.</Text>
          )}
        </View>
      ) : null}

      {selectedType === 'all' || selectedType === 'expense' ? (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Despesas</Text>
          {filteredTransactions.filter(transaction => transaction.type === 'expense').length > 0 ? (
            filteredTransactions.filter(transaction => transaction.type === 'expense').map(item => (
              <View style={styles.transactionItemContainer} key={item.id}>
                <Text style={styles.transactionItem}>
                  {item.date} / {item.categoryName} / ({item.amount.toFixed(2)})
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noData}>Nenhuma despesa encontrada.</Text>
          )}
        </View>
      ) : null}

      <View style={styles.tableContainer}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Visão Geral</Text>
        </View>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableHeader}>Visão geral</Text>
            <Text style={styles.tableHeader}>Receitas</Text>
            <Text style={styles.tableHeader}>Despesas</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Quantidade</Text>
            <Text style={styles.tableCell}>{quantityRevenues}</Text>
            <Text style={styles.tableCell}>{quantityExpenses}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Total</Text>
            <Text style={styles.tableCell}>{totalRevenues.toFixed(2)}</Text>
            <Text style={styles.tableCell}>{totalExpenses.toFixed(2)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Média por Dia</Text>
            <Text style={styles.tableCell}>{avgRevenuePerDay.toFixed(2)}</Text>
            <Text style={styles.tableCell}>{avgExpensePerDay.toFixed(2)}</Text>
          </View>
          <View style={styles.balanceRow}>
            <Text style={[styles.tableCell, styles.balanceLabel]}>Fluxo de caixa</Text>
            <Text style={[styles.tableCell, balanceColor]}>{filteredBalance.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filtros</Text>

            <Text style={styles.filterLabel}>Tipo de Transação</Text>
            <Picker
              selectedValue={selectedType}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedType(itemValue)}
            >
              <Picker.Item label="Todas" value="all" />
              <Picker.Item label="Receitas" value="income" />
              <Picker.Item label="Despesas" value="expense" />
            </Picker>

            <Text style={styles.filterLabel}>Categoria</Text>
            <Picker
              selectedValue={selectedCategory}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedCategory(itemValue)}
            >
              <Picker.Item label="Todas" value="all" />
              {categories.map(category => (
                <Picker.Item key={category.id} label={category.name} value={category.id} />
              ))}
            </Picker>

            <Text style={styles.filterLabel}>Conta</Text>
            <Picker
              selectedValue={selectedAccount}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedAccount(itemValue)}
            >
              <Picker.Item label="Todas" value="all" />
              {accounts.map(account => (
                <Picker.Item key={account.id} label={account.name} value={account.id} />
              ))}
            </Picker>

            <Text style={styles.filterLabel}>Data de Início</Text>
            <TouchableOpacity onPress={showStartDatePicker}>
              <TextInput
                style={styles.dateInput}
                value={startDate ? startDate.toLocaleDateString() : ''}
                placeholder="Selecionar Data de Início"
                editable={false}
              />
            </TouchableOpacity>
            {isStartDatePickerVisible && (
              <DateTimePicker
                value={startDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  hideStartDatePicker();
                  setStartDate(selectedDate || startDate);
                }}
              />
            )}

            <Text style={styles.filterLabel}>Data de Fim</Text>
            <TouchableOpacity onPress={showEndDatePicker}>
              <TextInput
                style={styles.dateInput}
                value={endDate ? endDate.toLocaleDateString() : ''}
                placeholder="Selecionar Data de Fim"
                editable={false}
              />
            </TouchableOpacity>
            {isEndDatePickerVisible && (
              <DateTimePicker
                value={endDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  hideEndDatePicker();
                  setEndDate(selectedDate || endDate);
                }}
              />
            )}

            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity onPress={clearFilters} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Limpar Filtros</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={closeModal} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Fechar </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  header: {
    paddingTop: 25,
    fontSize: 35,
    fontWeight: 'bold',
    textAlign: 'center',
    justifyContent: 'center'
  },
  iconButton: {
    padding: 8,
    backgroundColor: 'silver',
    borderRadius: 100,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    backgroundColor: 'silver'
  },
  item: {
    marginBottom: 8,
  },
  categoryItem: {
    fontSize: 16,
    color: '#333',
  },
  noData: {
    fontSize: 16,
    color: '#999',
  },
  transactionItemContainer: {
    marginBottom: 8,
  },
  transactionItem: {
    fontSize: 16,
    color: '#333',
  },
  tableContainer: {
    marginTop: 16,
  },
  table: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tableHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  tableCell: {
    fontSize: 16,
    flex: 1,
  },
  balanceRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  balanceLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 2,
  },
  balancePositive: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'green',
    flex: 1,
    textAlign: 'right',
  },
  balanceNegative: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'red',
    flex: 1,
    textAlign: 'right',
  },
  balanceZero: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  filterLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 16,
  },
  dateInput: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'blue',
    borderRadius: 5,
    marginHorizontal: 5,
    marginBottom: 10,
  },
  modalButtonText: {
    fontSize: 16,
    color: 'white',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
});

export default DashboardScreen;
