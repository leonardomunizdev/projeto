import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, Button, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCategories } from '../context/CategoryContext';
import { useTransactions } from '../context/TransactionContext';
import { useAccounts } from '../context/AccountContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

const DashboardScreen = () => {
  const { categories } = useCategories();
  const { transactions, calculateTotalBalance } = useTransactions();
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

  const totalBalance = calculateTotalBalance();
  const balanceColor = totalBalance > 0 
    ? styles.balancePositive 
    : totalBalance < 0 
    ? styles.balanceNegative 
    : styles.balanceZero;

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

  // Calcula categorias com total maior que zero
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
      .filter(cat => cat.total > 0); // Filtra categorias com total maior que zero
  };

  const expenseCategories = calculateCategoryTotals('expense');
  const incomeCategories = calculateCategoryTotals('income');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Relatório</Text>
        <TouchableOpacity onPress={openModal} style={styles.iconButton}>
          <Icon name="menu" size={24} color="#000" />
        </TouchableOpacity>
      </View>

          
          <View selectedValue={selectedType}  style={styles.sectionContainer}>
        
        
          
        
      </View>

      {/* Selecione apenas categorias e transações relevantes com base no tipo selecionado */}
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
            <Text style={styles.tableCell}>Média por dia</Text>
            <Text style={styles.tableCell}>{avgRevenuePerDay.toFixed(2)}</Text>
            <Text style={styles.tableCell}>{avgExpensePerDay.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.total}>
        <Text style={balanceColor}>
          Saldo Total: {totalBalance.toFixed(2)}
        </Text>
      </View>

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filtros</Text>
            <Text style={styles.filterLabel}>Categoria</Text>
            <Picker
              selectedValue={selectedCategory}
              onValueChange={(itemValue) => setSelectedCategory(itemValue)}
            >
              <Picker.Item label="Todas as Categorias" value="all" />
              {categories.map(category => (
                <Picker.Item key={category.id} label={category.name} value={category.id} />
              ))}
            </Picker>

            <Text style={styles.filterLabel}>Conta</Text>
            <Picker
              selectedValue={selectedAccount}
              onValueChange={(itemValue) => setSelectedAccount(itemValue)}
            >
              <Picker.Item label="Todas as Contas" value="all" />
              {accounts.map(account => (
                <Picker.Item key={account.id} label={account.name} value={account.id} />
              ))}
            </Picker>

            <Text style={styles.filterLabel}>Tipo</Text>
            <Picker
              selectedValue={selectedType}
              onValueChange={(itemValue) => setSelectedType(itemValue)}
            >
              <Picker.Item label="Todos" value="all" />
              <Picker.Item label="Receita" value="income" />
              <Picker.Item label="Despesa" value="expense" />
            </Picker>

            <Text style={styles.filterLabel}>Data Inicial</Text>
            <TouchableOpacity onPress={showStartDatePicker}>
              <Text>{startDate ? startDate.toDateString() : 'Selecionar data'}</Text>
            </TouchableOpacity>
            {isStartDatePickerVisible && (
              <DateTimePicker
                value={startDate || new Date()}
                mode="date"
                onChange={(event, date) => {
                  setStartDate(date);
                  hideStartDatePicker();
                }}
              />
            )}

            <Text style={styles.filterLabel}>Data Final</Text>
            <TouchableOpacity onPress={showEndDatePicker}>
              <Text>{endDate ? endDate.toDateString() : 'Selecionar data'}</Text>
            </TouchableOpacity>
            {isEndDatePickerVisible && (
              <DateTimePicker
                value={endDate || new Date()}
                mode="date"
                onChange={(event, date) => {
                  setEndDate(date);
                  hideEndDatePicker();
                }}
              />
            )}

            <View style={styles.modalButtonContainer}>
              <Button title="Aplicar" onPress={applyFilters} />
              <Button title="Limpar" onPress={clearFilters} />
              <Button title="Fechar" onPress={closeModal} />
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
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  iconButton: {
    padding: 8,
  },
  sectionContainer: {
    marginVertical: 8,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  item: {
    marginVertical: 4,
  },
  categoryItem: {
    fontSize: 16,
  },
  noData: {
    fontSize: 16,
    color: 'grey',
  },
  transactionItemContainer: {
    marginVertical: 4,
  },
  transactionItem: {
    fontSize: 16,
  },
  tableContainer: {
    marginVertical: 16,
  },
  table: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tableHeader: {
    fontWeight: 'bold',
  },
  tableCell: {
    flex: 1,
    textAlign: 'right',
  },
  total: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  balancePositive: {
    color: 'green',
  },
  balanceNegative: {
    color: 'red',
  },
  balanceZero: {
    color: 'black',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
});

export default DashboardScreen;
