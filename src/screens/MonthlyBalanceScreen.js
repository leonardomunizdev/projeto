import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTransactions } from '../context/TransactionContext';
import { useAccounts } from '../context/AccountContext';

const screenWidth = Dimensions.get('window').width;

const MonthlyBalanceScreen = ({ route }) => {
  const navigation = useNavigation();
  const { month, year } = route.params;
  const { transactions } = useTransactions();
  const { accounts } = useAccounts();

  const [currentMonth, setCurrentMonth] = useState(month);
  const [currentYear, setCurrentYear] = useState(year);
  const [balanceByCategory, setBalanceByCategory] = useState({});
  const [balanceByAccount, setBalanceByAccount] = useState({});
  
  useEffect(() => {
    let incomeByCategory = {};
    let expenseByCategory = {};
    let balanceByAccount = {};

    transactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.date);
      const transactionMonth = transactionDate.getMonth();
      const transactionYear = transactionDate.getFullYear();

      if (transactionMonth === currentMonth && transactionYear === currentYear) {
        const amount = parseFloat(transaction.amount);
        if (isNaN(amount)) {
          console.warn(`Valor inválido para a transação: ${transaction.amount}`);
          return;
        }

        if (transaction.type === 'income') {
          incomeByCategory[transaction.category] = (incomeByCategory[transaction.category] || 0) + amount;
          if (transaction.accountId) {
            balanceByAccount[transaction.accountId] = (balanceByAccount[transaction.accountId] || 0) + amount;
          }
        } else if (transaction.type === 'expense') {
          expenseByCategory[transaction.category] = (expenseByCategory[transaction.category] || 0) + amount;
          if (transaction.accountId) {
            balanceByAccount[transaction.accountId] = (balanceByAccount[transaction.accountId] || 0) - amount;
          }
        }
      }
    });

    setBalanceByCategory({ income: incomeByCategory, expense: expenseByCategory });
    setBalanceByAccount(balanceByAccount);
  }, [transactions, currentMonth, currentYear]);

  const formatMonthYear = (month, year) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${months[month]} ${year}`;
  };

  const handleMonthChange = (direction) => {
    const newDate = new Date(currentYear, currentMonth + direction, 1);
    setCurrentMonth(newDate.getMonth());
    setCurrentYear(newDate.getFullYear());
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => handleMonthChange(-1)}>
            <Text style={styles.monthChangeButton}>{"<"}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{formatMonthYear(currentMonth, currentYear)}</Text>
          <TouchableOpacity onPress={() => handleMonthChange(1)}>
            <Text style={styles.monthChangeButton}>{">"}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.balanceByCategory}>
          <Text style={styles.sectionTitle}>Receitas por Categoria</Text>
          {Object.entries(balanceByCategory.income || {}).map(([category, amount]) => (
            <View key={category} style={styles.categoryItem}>
              <Text style={styles.categoryName}>{category}</Text>
              <Text style={styles.categoryAmount}>
                R$ {amount.toFixed(2).replace('.', ',')}
              </Text>
            </View>
          ))}
          <Text style={styles.sectionTitle}>Despesas por Categoria</Text>
          {Object.entries(balanceByCategory.expense || {}).map(([category, amount]) => (
            <View key={category} style={styles.categoryItem}>
              <Text style={styles.categoryName}>{category}</Text>
              <Text style={[styles.categoryAmount, styles.expenseAmount]}>
                R$ {amount.toFixed(2).replace('.', ',')}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.balanceByAccount}>
          <Text style={styles.sectionTitle}>Saldo por Conta</Text>
          {Object.entries(balanceByAccount || {}).map(([accountId, amount]) => {
            const account = accounts.find(a => a.id === accountId);
            return (
              <View key={accountId} style={styles.accountItem}>
                <Text style={styles.accountName}>{account ? account.name : 'Conta Desconhecida'}</Text>
                <Text style={[styles.accountAmount, amount < 0 && styles.expenseAmount]}>
                  R$ {amount.toFixed(2).replace('.', ',')}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  arrowButton: {
    padding: 8,
  },
  arrowText: {
    fontSize: 24,
    color: '#333',
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    width: '48%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  balanceContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  incomeContainer: {
    flex: 1,
    marginRight: 8,
  },
  expenseContainer: {
    flex: 1,
    marginLeft: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  summaryItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
});

export default MonthlyBalanceScreen;
