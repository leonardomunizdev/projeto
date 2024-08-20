import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useTransactions } from "../context/TransactionContext";
import { useCategories } from "../context/CategoryContext";
import { useAccounts } from "../context/AccountContext";
import { formatToBRL } from "../utils/formatUtils"; // Supondo que você tenha um arquivo de utilitários para formatação

const FilterScreen = ({ route }) => {
  const { filterType, filterValue } = route.params; // Recebe os parâmetros da navegação
  const { transactions } = useTransactions();
  const { categories } = useCategories();
  const { accounts } = useAccounts();

  const getFilteredTransactions = () => {
    return transactions.filter((transaction) => {
      if (filterType === "category") {
        return transaction.categoryId === filterValue;
      } else if (filterType === "account") {
        return transaction.accountId === filterValue;
      }
      return false;
    });
  };

  const filteredTransactions = getFilteredTransactions();

  const getTotalAmount = (transactions) => {
    return transactions.reduce((total, transaction) => total + parseFloat(transaction.amount), 0);
  };

  const filterName = filterType === "category" 
    ? categories.find(category => category.id === filterValue)?.name 
    : accounts.find(account => account.id === filterValue)?.name;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{filterName}</Text>
      <ScrollView>
        {filteredTransactions.map((transaction) => (
          <View key={transaction.id} style={styles.transaction}>
            <Text>{transaction.description}</Text>
            <Text>{formatToBRL(parseFloat(transaction.amount))}</Text>
          </View>
        ))}
        <View style={styles.totalContainer}>
          <Text>Total:</Text>
          <Text>{formatToBRL(getTotalAmount(filteredTransactions))}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  transaction: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  totalContainer: {
    marginTop: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
});

export default FilterScreen;
