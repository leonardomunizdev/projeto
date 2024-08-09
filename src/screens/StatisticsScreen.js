import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCategories } from '../context/CategoryContext';
import { useTransactions } from '../context/TransactionContext';

const DashboardScreen = () => {
  const { categories } = useCategories();
  const { transactions, calculateTotalBalance } = useTransactions();

  // Filtra e calcula os dados para a visão geral
  const totalRevenues = transactions
    .filter(transaction => transaction.type === 'income')
    .reduce((total, transaction) => total + transaction.amount, 0);

  const totalExpenses = transactions
    .filter(transaction => transaction.type === 'expense')
    .reduce((total, transaction) => total + transaction.amount, 0);

  const quantityRevenues = transactions.filter(transaction => transaction.type === 'income').length;
  const quantityExpenses = transactions.filter(transaction => transaction.type === 'expense').length;

  const avgRevenuePerDay = quantityRevenues > 0 ? totalRevenues / quantityRevenues : 0;
  const avgExpensePerDay = quantityExpenses > 0 ? totalExpenses / quantityExpenses : 0;

  // Calcula porcentagens e totais por categoria
  const calculateCategoryTotals = (type) => {
    return categories
      .filter(cat => cat.type === type)
      .map(cat => {
        const totalForCategory = transactions
          .filter(transaction => transaction.categoryId === cat.id && transaction.type === type)
          .reduce((total, transaction) => total + transaction.amount, 0);

        return {
          ...cat,
          total: totalForCategory,
          percentage: (totalForCategory / (type === 'expense' ? totalExpenses : totalRevenues)) * 100,
        };
      });
  };

  const expenseCategories = calculateCategoryTotals('expense');
  const incomeCategories = calculateCategoryTotals('income');

  const totalBalance = calculateTotalBalance();
  const balanceColor = totalBalance === 0 
  ? styles.balanceZero 
  : totalBalance < 0 
  ? styles.balanceNegative 
  : styles.balancePositive;


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Relatório</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="menu" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>Receitas por Categoria</Text>
        {incomeCategories.map(item => (
          <View style={styles.item} key={item.id}>
            <Text style={styles.categoryItem}>
              {item.name} ({item.percentage.toFixed(2)}%) {item.total.toFixed(2)}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>Despesas por Categoria</Text>
        {expenseCategories.map(item => (
          <View style={styles.item} key={item.id}>
            <Text style={styles.categoryItem}>
              {item.name} ({item.percentage.toFixed(2)}%) {item.total.toFixed(2)}
            </Text>
          </View>
        ))}
      </View>


      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>Receitas</Text>
        {transactions.filter(transaction => transaction.type === 'income').map(item => (
          <View style={styles.transactionItemContainer} key={item.id}>
            <Text style={styles.transactionItem}>
              {item.date}  /  {item.categoryName}  /  {item.amount.toFixed(2)}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>Despesas</Text>
        {transactions.filter(transaction => transaction.type === 'expense').map(item => (
          <View style={styles.transactionItemContainer} key={item.id}>
            <Text style={styles.transactionItem}>
              {item.date}  /  {item.categoryName}  /  ({item.amount.toFixed(2)})
            </Text>
          </View>
        ))}
      </View>



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
            <Text style={styles.tableCell}>Média (Dia)</Text>
            <Text style={styles.tableCell}>{avgRevenuePerDay.toFixed(2)}</Text>
            <Text style={styles.tableCell}>{avgExpensePerDay.toFixed(2)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Total</Text>
            <Text style={styles.tableCell}>{totalRevenues.toFixed(2)}</Text>
            <Text style={styles.tableCell}>{totalExpenses.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.total}>
        Fluxo de Caixa: <Text style={balanceColor}>{totalBalance.toFixed(2)}</Text>
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    flexGrow: 1, // Garantir que o conteúdo possa rolar
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Centraliza o conteúdo horizontalmente
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#e0e0e0', // Cor de fundo cinza para o cabeçalho
    marginBottom: 12,
  },
  header: {
    fontSize: 24, // Aumenta o tamanho da fonte do cabeçalho
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center', // Garante que o texto esteja centralizado
    flex: 1, // Faz com que o texto ocupe o espaço disponível
  },
  iconButton: {
    padding: 8,
    backgroundColor: '#fff', // Fundo branco para o ícone
    borderRadius: 50, // Torna o fundo circular
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    backgroundColor: '#e0e0e0',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoryItem: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  transactionItemContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  transactionItem: {
    fontSize: 16,
    color: '#333',
  },
  tableContainer: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 10,
  },
  table: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  tableHeader: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  tableCell: {
    flex: 1,
    fontSize: 16,
    color: '#555',
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  balancePositive: {
    color: '#4caf50', // Cor verde para saldo positivo
  },
  balanceNegative: {
    color: '#f44336', // Cor vermelha para saldo negativo
  },
  balanceZero: {
    color: 'black',
  },
});

export default DashboardScreen;
