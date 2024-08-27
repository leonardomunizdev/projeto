import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal, TextInput
  // Importa AsyncStorage
} from "react-native";
import { Card } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useTransactions } from "../context/TransactionContext";
import { useAccounts } from "../context/AccountContext";
import { useCategories } from "../context/CategoryContext";
import Icon from "react-native-vector-icons/FontAwesome";
import { HomeStyles } from "../styles/screens/HomeScreenStyles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HelpModal from '../components/modals/options/HelpModal';
import { MaterialIcons } from "@expo/vector-icons";

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
  const [selectedCalculationType, setSelectedCalculationType] = useState("category"); 
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [spendingGoal, setSpendingGoal] = useState("");
  const [savedGoal, setSavedGoal] = useState(0);
  const [goalColor, setGoalColor] = useState("blue");
  const [amountLeft, setAmountLeft] = useState(0);

  useEffect(() => {
    const loadGoal = async () => {
      try {
        const goal = await AsyncStorage.getItem('spendingGoal');
        if (goal !== null) {
          setSavedGoal(convertToAmerican(goal));
        }
      } catch (error) {
        console.error("Erro ao carregar a meta de gastos", error);
      }
    };

    loadGoal();
  }, []);

  const saveGoal = async () => {
    try {
      await AsyncStorage.setItem('spendingGoal', spendingGoal);
      setSavedGoal(convertToAmerican(spendingGoal));
      setGoalModalVisible(false);
    } catch (error) {
      console.error("Erro ao salvar a meta de gastos", error);
    }
  };
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

    const spendingGoalValue = parseFloat(savedGoal) || 0;
    const remaining = spendingGoalValue - monthlyExpense;
    setAmountLeft(remaining);

    // Atualiza a cor com base na meta
    if (remaining < 0) {
      setGoalColor("red");
    } else {
      setGoalColor("blue");
    }
  }, [transactions, currentMonth, currentYear, savedGoal]);


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



  // Exemplo de código na tela inicial
  const navigateToAddTransaction = (imageUri) => {
    navigation.navigate("AddTransactionScreen", { imageUri });
  };

  // Chame essa função quando precisar navegar, passando a URI da imagem

  const formatToBRL = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value);
  };

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

  const calculateBarColor = (percentage) => {
    if (percentage < 50) {
      return "blue"; // Começa azul
    } else if (percentage < 75) {
      return "orange"; // Vai mudando para laranja
    } else {
      return "red"; // Fica vermelho ao se aproximar da meta
    }
  };
  const renderProgressBar = () => {
    const spendingGoalValue = parseFloat(savedGoal) || 0;
    const percentage = (monthlyExpense / spendingGoalValue) * 100;
    const barColor = calculateBarColor(percentage);

    return (
      <View style={HomeStyles.progressBarContainer}>
        <View style={[HomeStyles.progressBar, { width: `${percentage}%`, backgroundColor: barColor }]} />
      </View>
    );
  };

  const navigateToTransactions = (type) => {
    navigation.navigate("Transações", { filterType: type });
  };

  const navigateToAddTransactionsAccount = (accountId) => {
    navigation.navigate('AddTransactionScreen', { accountId });
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


  const formatValue = (value) => {
    // Remove caracteres não numéricos
    value = value.replace(/\D/g, '');

    // Certifique-se de que o valor tenha no mínimo 3 dígitos
    value = value.padStart(3, '0');

    // Separa a parte inteira da parte decimal
    const integerPart = value.slice(0, -2);
    const decimalPart = value.slice(-2);

    // Formata a parte inteira com pontos de milhar
    const formattedInteger = integerPart
      .split('')
      .reverse()
      .reduce((acc, digit, index) => {
        return digit + (index && index % 3 === 0 ? '.' : '') + acc;
      }, '');

    // Combina a parte inteira e a parte decimal
    return `${formattedInteger},${decimalPart}`;
  };




  const handleChange = (text) => {
    const formattedValue = formatValue(text);
    const cleanedValue = formattedValue.replace(/^0+(?!,)/, '');
    setSpendingGoal(cleanedValue);

  };

  const convertToAmerican = (value) => {
    // Remove caracteres não numéricos
    value = value.replace(/\D/g, '');

    // Adiciona zeros à esquerda, se necessário
    value = value.padStart(3, '0');

    // Adiciona pontos e vírgulas conforme necessário
    const integerPart = value.slice(0, -2); // Parte inteira
    const decimalPart = value.slice(-2);   // Parte decimal

    // Combina a parte inteira e a parte decimal para o formato americano
    return `${integerPart}.${decimalPart}`;
  }
    return (
      <View style={HomeStyles.container}>
        <ScrollView contentContainerStyle={HomeStyles.scrollViewContent}>
          <View style={HomeStyles.balanceContainer}>
            <View style={HomeStyles.textContainer}>
              <Text style={HomeStyles.balanceText}>Saldo</Text>
              <Text style={[HomeStyles.balanceAmount, { color: balanceColor }]}>
                {formatToBRL(parseFloat(balance.toFixed(2).replace(".", ",")))}
              </Text>
            </View>
          </View>

          <View style={HomeStyles.summaryContainer}>
            <Card
              style={HomeStyles.card}
              onPress={() => navigateToTransactions("income")}
            >
              <Card.Content>
                <Text style={HomeStyles.cardTitle}>Receitas</Text>
                <Text style={HomeStyles.cardAmountIncome}>
                  {formatToBRL(parseFloat(totalIncome.toFixed(2).replace(".", ",")))}
                </Text>
              </Card.Content>
            </Card>
            <Card
              style={HomeStyles.card}
              onPress={() => navigateToTransactions("expense")}
            >
              <Card.Content>
                <Text style={HomeStyles.cardTitle}>Despesas</Text>
                <Text style={HomeStyles.cardAmountExpense}>
                  {formatToBRL(parseFloat(totalExpense.toFixed(2).replace(".", ",")))}
                </Text>
              </Card.Content>
            </Card>
          </View>
          
          <Card style={HomeStyles.accountsCard} onPress={() => setGoalModalVisible(true)}>
            <Card.Content>
              <Text style={HomeStyles.cardTitle}>Meta de Gastos Mensais</Text>

              <View style={HomeStyles.monthlyBalanceItem}>

                <Text style={{ fontSize: 16 }}>
                  Meta:
                </Text>

                <Text>{formatToBRL(parseFloat(savedGoal))}</Text>
              </View>
              <View style={HomeStyles.monthlyBalanceItem}>

                <Text style={{ fontSize: 16 }}>
                  Gasto Mensal:
                </Text>
                <Text style={{ color: 'red' }}>{formatToBRL(monthlyExpense)}</Text>
              </View>
              {renderProgressBar()}

              <Text style={{ color: goalColor, fontSize: 16 }}>
                {amountLeft < 0
                  ? `A meta foir Excedida em ${formatToBRL(Math.abs(amountLeft))}`
                  : `Falta ${formatToBRL(amountLeft)} para alcançar a meta`}
              </Text>

            </Card.Content>
          </Card>

          <Card style={HomeStyles.accountsCard}>
            <Card.Content>
              <Text style={HomeStyles.accountsTitle}>Contas</Text>
              {accounts.map((account) => (
                <View key={account.id} style={HomeStyles.accountItem}>

                  <Text style={HomeStyles.accountName}>{account.name} {'\n'}

                    <Text
                      style={[
                        HomeStyles.accountAmount,
                        { color: getAccountColor(accountValues[account.id] || 0) },
                      ]}
                    >
                      {formatToBRL(parseFloat((accountValues[account.id] || 0)
                        .toFixed(2)
                        .replace(".", ",")))}


                    </Text>
                  </Text>


                  <TouchableOpacity onPress={() => navigateToAddTransactionsAccount(account.id)} style={HomeStyles.addButton}>
                    <MaterialIcons name="add" size={30} color="blue" />
                  </TouchableOpacity>
                </View>
              ))}
              <View style={HomeStyles.accountDivider} />
              <View style={HomeStyles.totalContainer}>
                <Text style={HomeStyles.totalText}>Total:</Text>
                <Text
                  style={[
                    HomeStyles.totalAmount,
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

          <Card style={HomeStyles.monthlyBalanceCard} onPress={openModal}>
            <Card.Content>
              <Text style={HomeStyles.monthlyBalanceTitle}>Balanço Mensal</Text>
              <View style={HomeStyles.monthlyBalanceContent}>
                <View style={HomeStyles.monthlyBalanceItem}>
                  <Text style={HomeStyles.monthlyBalanceLabel}>Receitas:</Text>
                  <Text style={HomeStyles.monthlyBalanceValue}>
                    {formatToBRL(parseFloat(monthlyIncome.toFixed(2).replace(".", ",")))}
                  </Text>
                </View>
                <View style={HomeStyles.monthlyBalanceItem}>
                  <Text style={HomeStyles.monthlyBalanceLabel}>Despesas:</Text>
                  <Text style={HomeStyles.monthlyBalanceValue}>
                    {formatToBRL(parseFloat(monthlyExpense.toFixed(2).replace(".", ",")))}
                  </Text>
                </View>
                <View style={HomeStyles.accountDivider} />

                <View style={HomeStyles.monthlyBalanceItem}>
                  <Text style={HomeStyles.monthlyBalanceLabel}>Balanço:</Text>
                  <Text
                    style={[
                      HomeStyles.monthlyBalanceValue,
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
        <Modal
          visible={goalModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setGoalModalVisible(false)}
        >
          <View style={HomeStyles.ModalGoalsContainer}>
            <View style={HomeStyles.ModalGoalsContent}>
              <Text style={HomeStyles.ModalGoalsTitle}>Configurar Meta de Gastos</Text>
              <TextInput
                style={HomeStyles.ModalGoalsInput}
                placeholder="Digite a meta de gastos"
                keyboardType="numeric"
                value={spendingGoal}
                onChangeText={handleChange}
              />
              <View style={HomeStyles.ModalGoalsButtons}>
                <TouchableOpacity style={HomeStyles.ModalGoalsSaveButton} onPress={saveGoal}>
                  <Text style={HomeStyles.ModalGoalsSaveButtonText}>Salvar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={HomeStyles.ModalGoalsCancelButton} onPress={() => setGoalModalVisible(false)}>
                  <Text style={HomeStyles.ModalGoalsCancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        {/* Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={HomeStyles.modalContainer}>
            <View style={HomeStyles.modalContent}>
              <View style={HomeStyles.modalBody}>
                <View style={HomeStyles.buttonContainer}>
                  <TouchableOpacity
                    style={[
                      HomeStyles.modalButton,
                      selectedCalculationType === "category" &&
                      HomeStyles.modalButtonSelected,
                    ]}
                    onPress={() => setSelectedCalculationType("category")}
                  >
                    <Text style={HomeStyles.modalButtonText}>Por Categoria</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      HomeStyles.modalButton,
                      selectedCalculationType === "account" &&
                      HomeStyles.modalButtonSelected,
                    ]}
                    onPress={() => setSelectedCalculationType("account")}
                  >
                    <Text style={HomeStyles.modalButtonText}>Por Conta</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView>
                  {selectedCalculationType === "category" ? (
                    <View>
                      <View style={HomeStyles.balanceContainer}>
                        <View style={HomeStyles.column}>
                          <Text style={HomeStyles.modalSectionTitle}>Receitas</Text>
                          <Text style={HomeStyles.movementTextIncome}>
                            {formatToBRL(parseFloat(getCategoryTotals("income").totalSum))}
                          </Text>
                          {getCategoryTotals("income").totals.map((category) => (
                            <Text key={category.id}>
                              {category.name}
                              {"\n"}
                              <Text style={HomeStyles.incomeTotal}>
                                {formatToBRL(parseFloat(category.total))}
                              </Text>
                            </Text>
                          ))}
                        </View>
                        <View style={HomeStyles.column}>
                          <Text style={HomeStyles.modalSectionTitle}>Despesas</Text>
                          <Text style={HomeStyles.movementTextExpense}>
                            {formatToBRL(parseFloat(getCategoryTotals("expense").totalSum))}
                          </Text>
                          {getCategoryTotals("expense").totals.map((category) => (
                            <Text key={category.id}>
                              {category.name}
                              {"\n"}
                              <Text style={HomeStyles.expenseTotal}>
                                {formatToBRL(parseFloat(category.total))}
                              </Text>
                            </Text>
                          ))}
                        </View>
                      </View>
                    </View>
                  ) : (
                    <View>
                      <View style={HomeStyles.balanceContainer}>
                        <View style={HomeStyles.column}>
                          <Text style={HomeStyles.modalSectionTitle}>Receitas</Text>
                          <Text style={HomeStyles.movementTextIncome}>
                            {formatToBRL(parseFloat(getAccountTotals("income").totalSum))}
                          </Text>
                          {getAccountTotals("income").totals.map((account) => (
                            <Text key={account.id}>
                              {account.name}
                              {"\n"}
                              <Text style={HomeStyles.incomeTotal}>
                                {formatToBRL(parseFloat(account.total))}
                              </Text>
                            </Text>
                          ))}
                        </View>
                        <View style={HomeStyles.column}>
                          <Text style={HomeStyles.modalSectionTitle}>Despesas</Text>
                          <Text style={HomeStyles.movementTextExpense}>
                            {formatToBRL(parseFloat(getAccountTotals("expense").totalSum))}
                          </Text>
                          {getAccountTotals("expense").totals.map((account) => (
                            <Text key={account.id}>
                              {account.name}
                              {"\n"}
                              <Text style={HomeStyles.expenseTotal}>
                                {formatToBRL(parseFloat(account.total))}
                              </Text>
                            </Text>
                          ))}
                        </View>
                      </View>
                    </View>
                  )}
                </ScrollView>
                <View style={HomeStyles.balanceRow}>
                  <Text style={HomeStyles.modalTitle}>Balanço</Text>
                  <Text style={HomeStyles.modalBalanceTotal}>
                    {formatToBRL(parseFloat(getCategoryTotals("income").totalSum) -
                      parseFloat(getCategoryTotals("expense").totalSum))}
                  </Text>
                </View>

                <View style={HomeStyles.monthYearSelector}>
                  <TouchableOpacity onPress={() => changeMonth("prev")}>
                    <Icon name="chevron-left" size={24} />
                  </TouchableOpacity>
                  <Text style={HomeStyles.monthYearText}>
                    {formatMonthYear(currentMonth, currentYear)}
                  </Text>
                  <TouchableOpacity onPress={() => changeMonth("next")}>
                    <Icon name="chevron-right" size={24} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={closeModal}
                  style={HomeStyles.modalCloseButton}
                >
                  <Text style={HomeStyles.modalCloseText}>Fechar</Text>
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
