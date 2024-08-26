import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Modal,
   // Importa AsyncStorage
} from "react-native";
import { Card } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useTransactions } from "../context/TransactionContext";
import { useAccounts } from "../context/AccountContext";
import { useCategories } from "../context/CategoryContext";
import Icon from "react-native-vector-icons/FontAwesome";
import { styles } from "../styles/screens/HomeScreenStyles";
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as Linking from 'expo-linking';
import AsyncStorage from "@react-native-async-storage/async-storage";
import HelpModal from '../components/modals/options/HelpModal';


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
  const [showModal, setShowModal] = useState(true);
  const [helpModalVisible, setHelpModalVisible] = useState(false);

  
  
  useEffect(() => {
    console.log('Modal visibility:', modalVisible); // Adicione este log
  }, [modalVisible]);
  
  useEffect(() => {
    console.log('Checking first visit...');
    const checkFirstVisit = async () => {
      try {
        const hasVisited = await AsyncStorage.getItem('hasVisitedHomeScreen');
        if (hasVisited === null) {
          // Usuário está visitando pela primeira vez
          setHelpModalVisible(true);
          await AsyncStorage.setItem('hasVisitedHomeScreen', 'true');
        }
      } catch (error) {
        console.error('Erro ao acessar o AsyncStorage', error);
      }
    };
  
    checkFirstVisit();
  }, []);
  
  useEffect(() => {
    const handleOpenURL = async (event) => {
      const { url } = event;

      if (url) {
        // Verifique se a URL é válida e se é uma imagem
        if (url.startsWith('http') && url.match(/\.(jpeg|jpg|gif|png)$/)) {
          console.log('Image URL:', url);
          // Navegue para a tela de adição de transações e passe a URL da imagem
          navigation.navigate('AddTransactionScreen', { imageUrl: url });
        } else {
          console.log('URL não é uma imagem válida:', url);
        }
      } else {
        console.log('Nenhuma URL recebida.');
      }
    };

    // Adicione o listener para URLs compartilhadas
    const subscription = Linking.addEventListener('url', handleOpenURL);

    // Verifique se há uma URL inicial quando o aplicativo é iniciado
    const getInitialURL = async () => {
      const initialURL = await Linking.getInitialURL();
      if (initialURL) {
        handleOpenURL({ url: initialURL });
      }
    };

    getInitialURL();

    return () => {
      // Remova o listener quando o componente for desmontado
      subscription.remove();
    };
  }, [navigation]);

  const formatToBRL = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value);
  };

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

  const [balanceColor, setBalanceColor] = useState("blue");

  useEffect(() => {
    setBalanceColor(balance > 0 ? "blue" : "red");
  }, [balance]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.balanceContainer}>
          <View style={styles.textContainer}>
            <Text style={styles.balanceText}>Saldo</Text>
            <Text style={[styles.balanceAmount, { color: balanceColor }]}>
              {formatToBRL(parseFloat(balance.toFixed(2).replace(".", ",")))}
            </Text>
          </View>
        </View>

        <View style={styles.summaryContainer}>
          <Card
            style={styles.card}
            onPress={() => navigateToTransactions("income")}
          >
            <Card.Content>
              <Text style={styles.cardTitle}>Receitas</Text>
              <Text style={styles.cardAmountIncome}>
                {formatToBRL(parseFloat(totalIncome.toFixed(2).replace(".", ",")))}
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
                {formatToBRL(parseFloat(totalExpense.toFixed(2).replace(".", ",")))}
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
                  {formatToBRL(parseFloat((accountValues[account.id] || 0)
                    .toFixed(2)
                    .replace(".", ",")))}
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
                {formatToBRL(parseFloat(Object.values(accountValues)
                  .reduce((a, b) => a + b, 0)
                  .toFixed(2)
                  .replace(".", ",")))}
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
                  {formatToBRL(parseFloat(monthlyIncome.toFixed(2).replace(".", ",")))}
                </Text>
              </View>
              <View style={styles.monthlyBalanceItem}>
                <Text style={styles.monthlyBalanceLabel}>Despesas:</Text>
                <Text style={styles.monthlyBalanceValue}>
                  {formatToBRL(parseFloat(monthlyExpense.toFixed(2).replace(".", ",")))}
                </Text>
              </View>
              <View style={styles.monthlyBalanceItem}>
                <Text style={styles.monthlyBalanceLabel}>Balanço:</Text>
                <Text
                  style={[
                    styles.monthlyBalanceValue,
                    { color: monthlyBalance < 0 ? "red" : "green" },
                  ]}
                >
                  {formatToBRL(parseFloat(monthlyBalance.toFixed(2).replace(".", ",")))}
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
                    <View style={styles.balanceContainer}>
                      <View style={styles.column}>
                        <Text style={styles.modalSectionTitle}>Receitas</Text>
                        <Text style={styles.movementTextIncome}>
                          {formatToBRL(parseFloat(getCategoryTotals("income").totalSum))}
                        </Text>
                        {getCategoryTotals("income").totals.map((category) => (
                          <Text key={category.id}>
                            {category.name}
                            {"\n"}
                            <Text style={styles.incomeTotal}>
                              {formatToBRL(parseFloat(category.total))}
                            </Text>
                          </Text>
                        ))}
                      </View>
                      <View style={styles.column}>
                        <Text style={styles.modalSectionTitle}>Despesas</Text>
                        <Text style={styles.movementTextExpense}>
                          {formatToBRL(parseFloat(getCategoryTotals("expense").totalSum))}
                        </Text>
                        {getCategoryTotals("expense").totals.map((category) => (
                          <Text key={category.id}>
                            {category.name}
                            {"\n"}
                            <Text style={styles.expenseTotal}>
                              {formatToBRL(parseFloat(category.total))}
                            </Text>
                          </Text>
                        ))}
                      </View>
                    </View>
                  </View>
                ) : (
                  <View>
                    <View style={styles.balanceContainer}>
                      <View style={styles.column}>
                        <Text style={styles.modalSectionTitle}>Receitas</Text>
                        <Text style={styles.movementTextIncome}>
                          {formatToBRL(parseFloat(getAccountTotals("income").totalSum))}
                        </Text>
                        {getAccountTotals("income").totals.map((account) => (
                          <Text key={account.id}>
                            {account.name}
                            {"\n"}
                            <Text style={styles.incomeTotal}>
                              {formatToBRL(parseFloat(account.total))}
                            </Text>
                          </Text>
                        ))}
                      </View>
                      <View style={styles.column}>
                        <Text style={styles.modalSectionTitle}>Despesas</Text>
                        <Text style={styles.movementTextExpense}>
                          {formatToBRL(parseFloat(getAccountTotals("expense").totalSum))}
                        </Text>
                        {getAccountTotals("expense").totals.map((account) => (
                          <Text key={account.id}>
                            {account.name}
                            {"\n"}
                            <Text style={styles.expenseTotal}>
                              {formatToBRL(parseFloat(account.total))}
                            </Text>
                          </Text>
                        ))}
                      </View>
                    </View>
                  </View>
                )}
              </ScrollView>
              <View style={styles.balanceRow}>
                <Text style={styles.modalTitle}>Balanço</Text>
                <Text style={styles.modalBalanceTotal}>
                  {formatToBRL(parseFloat(getCategoryTotals("income").totalSum) -
                    parseFloat(getCategoryTotals("expense").totalSum))}
                </Text>
              </View>

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
      <HelpModal
              visible={helpModalVisible}
              onClose={() => setHelpModalVisible(false)}
            />
    </View>
  );
};

export default HomeScreen;
