import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Card } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useTransactions } from "../context/TransactionContext";
import { useAccounts } from "../context/AccountContext";
import { useCategories } from "../context/CategoryContext";
import Icon from "react-native-vector-icons/FontAwesome";
import { styles } from "../styles/screens/HomeScreenStyles";

const HomeScreen = () => {
  const navigation = useNavigation();
  const { transactions } = useTransactions();
  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [balance, setBalance] = useState(0);
  const [accountValues, setAccountValues] = useState({});
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [monthlyBalance, setMonthlyBalance] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCalculationType, setSelectedCalculationType] =
    useState("category"); // Default to 'category'

  const incomeCategories = categories.filter(
    (category) => category.type === "income"
  );
  const expenseCategories = categories.filter(
    (category) => category.type === "expense"
  );

  useEffect(() => {
    let income = 0;
    let expense = 0;
    const accountTotals = {};

    transactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.date);
      const today = new Date();

      if (transactionDate <= today) {
        const amount = parseFloat(transaction.amount);
        if (isNaN(amount)) {
          console.warn(
            `Valor inválido para a transação: ${transaction.amount}`
          );
          return;
        }

        if (transaction.type === "income") {
          income += amount;
          if (transaction.accountId) {
            accountTotals[transaction.accountId] =
              (accountTotals[transaction.accountId] || 0) + amount;
          }
        } else if (transaction.type === "expense") {
          expense += amount;
          if (transaction.accountId) {
            accountTotals[transaction.accountId] =
              (accountTotals[transaction.accountId] || 0) - amount;
          }
        }
      }
    });

    setTotalIncome(income);
    setTotalExpense(expense);
    setBalance(income - expense);

    const initialAccountValues = {};
    accounts.forEach((account) => {
      initialAccountValues[account.id] = accountTotals[account.id] || 0;
    });

    setAccountValues(initialAccountValues);
  }, [transactions, accounts]);

  useEffect(() => {
    let monthlyIncome = 0;
    let monthlyExpense = 0;

    transactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.date);
      const transactionMonth = transactionDate.getMonth();
      const transactionYear = transactionDate.getFullYear();

      if (
        transactionMonth === currentMonth &&
        transactionYear === currentYear
      ) {
        const amount = parseFloat(transaction.amount);
        if (isNaN(amount)) {
          console.warn(
            `Valor inválido para a transação: ${transaction.amount}`
          );
          return;
        }

        if (transaction.type === "income") {
          monthlyIncome += amount;
        } else if (transaction.type === "expense") {
          monthlyExpense += amount;
        }
      }
    });

    setMonthlyIncome(monthlyIncome);
    setMonthlyExpense(monthlyExpense);
    setMonthlyBalance(monthlyIncome - monthlyExpense);
  }, [transactions, currentMonth, currentYear]);

  const getAccountColor = (amount) => {
    return amount < 0 ? "red" : "blue";
  };

  const formatMonthYear = (month, year) => {
    const months = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];
    return `${months[month]} ${year}`;
  };

  const navigateToTransactions = (type) => {
    navigation.navigate("Transações", { filterType: type });
  };

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const changeMonth = (direction) => {
    if (direction === "prev") {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else if (direction === "next") {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const getCategoryTotals = (type) => {
    const filteredCategories = categories.filter(
      (category) => category.type === type
    );
    const totals = filteredCategories.map((category) => {
      const total = transactions
        .filter(
          (transaction) =>
            transaction.categoryId === category.id &&
            new Date(transaction.date).getMonth() === currentMonth &&
            new Date(transaction.date).getFullYear() === currentYear
        )
        .reduce((total, transaction) => {
          const amount = parseFloat(transaction.amount);
          if (isNaN(amount)) {
            console.warn(
              `Valor inválido para a transação: ${transaction.amount}`
            );
            return total;
          }
          return total + amount;
        }, 0);
      return { ...category, total };
    });
  
    // Filtra categorias com total maior que zero
    const filteredTotals = totals.filter(category => category.total > 0);
  
    const totalSum = filteredTotals.reduce((sum, category) => sum + category.total, 0);
    return {
      totals: filteredTotals.map((category) => ({
        ...category,
        total: category.total.toFixed(2).replace(".", ","),
      })),
      totalSum: totalSum.toFixed(2).replace(".", ","),
    };
  };
  const getAccountTotals = (type) => {
    const totals = accounts.map((account) => {
      const total = transactions
        .filter(
          (transaction) =>
            transaction.accountId === account.id &&
            transaction.type === type &&
            new Date(transaction.date).getMonth() === currentMonth &&
            new Date(transaction.date).getFullYear() === currentYear
        )
        .reduce((total, transaction) => {
          const amount = parseFloat(transaction.amount);
          if (isNaN(amount)) {
            console.warn(
              `Valor inválido para a transação: ${transaction.amount}`
            );
            return total;
          }
          return total + amount;
        }, 0);
      return { ...account, total };
    });

    const filteredTotals = totals.filter(account => account.total > 0);

  const totalSum = filteredTotals.reduce((sum, account) => sum + account.total, 0);

  return {
    totals: filteredTotals.map((account) => ({
      ...account,
      total: account.total.toFixed(2).replace(".", ","),
    })),
    totalSum: totalSum.toFixed(2).replace(".", ","),
  };
};

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.balanceContainer}>
          <Text style={[styles.balanceText]}>Saldo{'\n'}</Text>
          <Text
            style={[
              styles.balanceAmount,
              { color: balance < 0 ? "red" : "green", textAlign: "center" }, // Define a cor do saldo com base no valor e centraliza
            ]}
          >
            R$ {balance.toFixed(2).replace(".", ",")}
          </Text>
        </View>
        <View style={styles.summaryContainer}>
          <Card
            style={styles.card}
            onPress={() => navigateToTransactions("income")}
          >
            <Card.Content>
              <Text style={styles.cardTitle}>Receitas</Text>
              <Text style={styles.cardAmountIncome}>
                R$ {totalIncome.toFixed(2).replace(".", ",")}
              </Text>
            </Card.Content>
          </Card>
          <Card
            style={styles.card}
            onPress={() => navigateToTransactions("expense")}
          >
            <Card.Content>
              <Text style={styles.cardTitle}>Despesas</Text>
              <Text style={styles.cardAmountExpense}>
                R$ {totalExpense.toFixed(2).replace(".", ",")}
              </Text>
            </Card.Content>
          </Card>
        </View>
        <Card style={styles.accountsCard}>
          <Card.Content>
            <Text style={styles.accountsTitle}>Contas</Text>
            {accounts.map((account) => (
              <View key={account.id} style={styles.accountItem}>
                <Text style={styles.accountName}>{account.name}</Text>
                <Text
                  style={[
                    styles.accountAmount,
                    { color: getAccountColor(accountValues[account.id] || 0) },
                  ]}
                >
                  R${" "}
                  {(accountValues[account.id] || 0)
                    .toFixed(2)
                    .replace(".", ",")}
                </Text>
              </View>
            ))}
            <View style={styles.accountDivider} />
            <View style={styles.totalContainer}>
              <Text style={styles.totalText}>Total:</Text>
              <Text
                style={[
                  styles.totalAmount,
                  {
                    color: getAccountColor(
                      Object.values(accountValues).reduce((a, b) => a + b, 0)
                    ),
                  },
                ]}
              >
                R${" "}
                {Object.values(accountValues)
                  .reduce((a, b) => a + b, 0)
                  .toFixed(2)
                  .replace(".", ",")}
              </Text>
            </View>
          </Card.Content>
        </Card>
        <Card style={styles.monthlyBalanceCard} onPress={openModal}>
          <Card.Content>
            <Text style={styles.monthlyBalanceTitle}>Balanço Mensal</Text>
            <View style={styles.monthlyBalanceContent}>
              <View style={styles.monthlyBalanceItem}>
                <Text style={styles.monthlyBalanceLabel}>Receitas:</Text>
                <Text style={styles.monthlyBalanceValue}>
                  R$ {monthlyIncome.toFixed(2).replace(".", ",")}
                </Text>
              </View>
              <View style={styles.monthlyBalanceItem}>
                <Text style={styles.monthlyBalanceLabel}>Despesas:</Text>
                <Text style={styles.monthlyBalanceValue}>
                  R$ {monthlyExpense.toFixed(2).replace(".", ",")}
                </Text>
              </View>
              <View style={styles.monthlyBalanceItem}>
                <Text style={styles.monthlyBalanceLabel}>Saldo:</Text>
                <Text
                  style={[
                    styles.monthlyBalanceValue,
                    { color: monthlyBalance < 0 ? "red" : "green" },
                  ]}
                >
                  R$ {monthlyBalance.toFixed(2).replace(".", ",")}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalBody}>
              <View style={styles.monthYearSelector}>
                <TouchableOpacity onPress={() => changeMonth("prev")}>
                  <Icon name="chevron-left" size={24} />
                </TouchableOpacity>
                <Text style={styles.monthYearText}>
                  {formatMonthYear(currentMonth, currentYear)}
                </Text>
                <TouchableOpacity onPress={() => changeMonth("next")}>
                  <Icon name="chevron-right" size={24} />
                </TouchableOpacity>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    selectedCalculationType === "category" &&
                      styles.modalButtonSelected,
                  ]}
                  onPress={() => setSelectedCalculationType("category")}
                >
                  <Text style={styles.modalButtonText}>Por Categoria</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    selectedCalculationType === "account" &&
                      styles.modalButtonSelected,
                  ]}
                  onPress={() => setSelectedCalculationType("account")}
                >
                  <Text style={styles.modalButtonText}>Por Conta</Text>
                </TouchableOpacity>
              </View>
              <ScrollView>
                {selectedCalculationType === "category" ? (
                  <View>
                    <Text style={styles.modalTitle}>
                      Balanço
                      <Text style={styles.modalBalanceTotal}>
                        {"\n"}R${" "}
                        {parseFloat(getCategoryTotals("income").totalSum) -
                          parseFloat(getCategoryTotals("expense").totalSum)}
                      </Text>
                    </Text>

                    <View style={styles.balanceContainer}>
                      <View style={styles.column}>
                        <Text style={styles.modalSectionTitle}>Receitas</Text>
                        <Text style={styles.movementTextIncome}>
                          R$ {getCategoryTotals("income").totalSum}
                        </Text>
                        {getCategoryTotals("income").totals.map((category) => (
                          <Text key={category.id}>
                            {category.name}
                            {"\n"}
                            <Text style={styles.incomeTotal}>
                              R$ {category.total}
                            </Text>
                          </Text>
                        ))}
                      </View>
                      <View style={styles.column}>
                        <Text style={styles.modalSectionTitle}>Despesas</Text>
                        <Text style={styles.movementTextExpense}>
                          R$ {getCategoryTotals("expense").totalSum}
                        </Text>
                        {getCategoryTotals("expense").totals.map((category) => (
                          <Text key={category.id}>
                            {category.name}
                            {"\n"}
                            <Text style={styles.expenseTotal}>
                              R$ {category.total}
                            </Text>
                          </Text>
                        ))}
                      </View>
                    </View>
                  </View>
                ) : (
                  <View>
                    <Text style={styles.modalTitle}>
                      Balanço
                      <Text style={styles.modalBalanceTotal}>
                        {"\n"}R${" "}
                        {parseFloat(getAccountTotals("income").totalSum) -
                          parseFloat(getAccountTotals("expense").totalSum)}
                      </Text>
                    </Text>
                    <View style={styles.balanceContainer}>
                      <View style={styles.column}>
                        <Text style={styles.modalSectionTitle}>Receitas</Text>
                        <Text style={styles.movementTextIncome}>
                          R$ {getAccountTotals("income").totalSum}
                        </Text>
                        {getAccountTotals("income").totals.map((account) => (
                          <Text key={account.id}>
                            {account.name}
                            {"\n"}
                            <Text style={styles.incomeTotal}>
                              R$ {account.total}
                            </Text>
                          </Text>
                        ))}
                      </View>
                      <View style={styles.column}>
                        <Text style={styles.modalSectionTitle}>Despesas</Text>
                        <Text style={styles.movementTextExpense}>
                          R$ {getAccountTotals("expense").totalSum}
                        </Text>
                        {getAccountTotals("expense").totals.map((account) => (
                          <Text key={account.id}>
                            {account.name}
                            {"\n"}
                            <Text style={styles.expenseTotal}>
                              R$ {account.total}
                            </Text>
                          </Text>
                        ))}
                      </View>
                    </View>
                  </View>
                )}
              </ScrollView>

              <TouchableOpacity
                onPress={closeModal}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default HomeScreen;
