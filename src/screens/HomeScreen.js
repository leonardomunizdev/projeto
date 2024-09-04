import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal, Switch } from "react-native";
import { useTransactions } from "../context/TransactionContext";
import { useAccounts } from "../context/AccountContext";
import Icon from "react-native-vector-icons/FontAwesome";
import { HomeStyles } from "../styles/screens/HomeScreenStyles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HelpModal from '../components/modals/options/HelpModal';
import BalanceModal from '../components/modals/home/BalanceModal';
import SelectedCardsModal from '../components/modals/home/selectedCardsModal';
import MonthLimitModal from '../components/modals/home/MonthLimitModal';
import { BalanceCard, AbstractCard, SpendingLimitCard, AccountsCard, MonthlyBalanceCard } from '../components/modals/home/Cards';
import useCardVisibility from '../hooks/useCardVisibility.';
import AccountBalanceModal from "../components/modals/home/AccountBalanceModal";
const HomeScreen = () => {
  const { transactions } = useTransactions();
  const { accounts } = useAccounts();
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
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [amountLeft, setAmountLeft] = useState(0);
  const [accumulatedBalance, setAccumulatedBalance] = useState(0);
  const [cardVisibility, setCardVisibility] = useCardVisibility();
  const [selectedCardsModalVisible, setSelectedCardsModalVisible] = useState(false);
  const [monthlyBalances, setMonthlyBalances] = useState({});
  const [displayedBalance, setDisplayedBalance] = useState(0);
  const [balanceLabel, setBalanceLabel] = useState('Saldo');
  const [refresh, setRefresh] = useState(false);
  const [savedGoal, setSavedGoal] = useState("");
  const [accountCardsVisible, setAccountCardsVisible] = useState(false);
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [incomeCount, setIncomeCount] = useState(0);
  const [expenseCount, setExpenseCount] = useState(0);


  const handleOpenAccountModal = (account) => {
    const accountName = account.name || 'Conta Desconhecida';
    const balance = accountValues[account.id] || 0;

    setSelectedAccount({
      name: accountName,
      balance: balance
    });

    setAccountModalVisible(true);
  };


  useEffect(() => {
    const loadGoal = async () => {
      try {
        const goal = await AsyncStorage.getItem('spendingGoal');
        if (goal !== null) {
          setSavedGoal(goal);
        }
      } catch (error) {
        console.error("Erro ao carregar a meta de gastos", error);
      }
    };

    loadGoal();
  }, []);

  const handleSaveGoal = async (goal) => {
    try {
      await AsyncStorage.setItem('spendingGoal', goal);
      setSavedGoal(goal);
    } catch (error) {
      console.error("Erro ao salvar a meta de gastos", error);
    }
  };




  useEffect(() => {
    const currentKey = `${currentYear}-${currentMonth}`;
    const initialBalance = monthlyBalances[currentKey] || 0;
    setDisplayedBalance(currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear() ? balance : initialBalance);
    setBalanceLabel(currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear() ? 'Saldo' : 'Saldo Previsto');
  }, [currentMonth, currentYear, monthlyBalances, balance]);
  useEffect(() => {
    const saveCurrentMonthBalance = async () => {
      try {
        const currentKey = `${currentYear}-${currentMonth}`;
        await AsyncStorage.setItem('currentMonthBalance', JSON.stringify(monthlyBalances[currentKey] || 0));
      } catch (error) {
        console.error('Erro ao salvar o saldo do mês atual', error);
      }
    };

    saveCurrentMonthBalance();
  }, [currentMonth, currentYear, monthlyBalances]);

  useEffect(() => {
    const loadCurrentMonthBalance = async () => {
      try {
        const savedBalance = await AsyncStorage.getItem('currentMonthBalance');
        if (savedBalance !== null) {
          setDisplayedBalance(parseFloat(savedBalance));
        }
      } catch (error) {
        console.error('Erro ao carregar o saldo do mês atual', error);
      }
    };

    loadCurrentMonthBalance();
  }, []);

  useEffect(() => {
    let income = 0;
    let expense = 0;
    let monthlyIncome = 0;
    let monthlyExpense = 0;
    const accountTotals = {};
    const today = new Date();
    const balances = {};

    transactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.date);
      const transactionMonth = transactionDate.getMonth();
      const transactionYear = transactionDate.getFullYear();
      const amount = parseFloat(transaction.amount);

      if (isNaN(amount)) {
        console.warn(`Valor inválido para a transação: ${transaction.amount}`);
        return;
      }

      // Calcular acumulado de cada conta somente até o mês selecionado
      const isInSelectedRange =
        transactionYear < currentYear ||
        (transactionYear === currentYear && transactionMonth <= currentMonth);

      if (isInSelectedRange) {
        if (transaction.type === "income") {
          accountTotals[transaction.accountId] = (accountTotals[transaction.accountId] || 0) + amount;
        } else if (transaction.type === "expense") {
          accountTotals[transaction.accountId] = (accountTotals[transaction.accountId] || 0) - amount;
        }

        // Armazenando saldos mensais
        const balanceKey = `${transactionYear}-${transactionMonth}`;
        if (!balances[balanceKey]) {
          balances[balanceKey] = 0;
        }
        if (transaction.type === "income") {
          balances[balanceKey] += amount;
        } else if (transaction.type === "expense") {
          balances[balanceKey] -= amount;
        }
      }

      // Calcular total de renda e despesas acumuladas até o mês atual
      if (transactionDate <= today) {
        if (transaction.type === "income") {
          income += amount;
        } else if (transaction.type === "expense") {
          expense += amount;
        }
      }

      // Mensal
      if (transactionMonth === currentMonth && transactionYear === currentYear) {
        if (transaction.type === "income") {
          monthlyIncome += amount;
        } else if (transaction.type === "expense") {
          monthlyExpense += amount;
        }
      }
    });

    // Atualizando estados
    setTotalIncome(income);
    setTotalExpense(expense);
    setBalance(income - expense);
    setMonthlyIncome(monthlyIncome);
    setMonthlyExpense(monthlyExpense);
    setMonthlyBalance(monthlyIncome - monthlyExpense);

    const spendingGoalValue = parseFloat(savedGoal) || 0;
    const remaining = spendingGoalValue - monthlyExpense;
    setAmountLeft(remaining);

    // Atualizando os valores das contas com o total acumulado até o mês selecionado
    setAccountValues(accountTotals);

    // Calcular saldo acumulado considerando todos os meses até o mês selecionado
    const accumulated = Object.keys(balances).reduce((acc, key) => acc + balances[key], 0);
    setAccumulatedBalance(accumulated);

    // Armazenar os saldos mensais
    setMonthlyBalances(balances);
  }, [transactions, accounts, currentMonth, currentYear, savedGoal]);


  console.log("sss", savedGoal);



  console.log("aconr", parseFloat(accounts.initialAccountValues));

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



  const formatMonthYear = (month, year) => {
    const months = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
    ];
    return `${months[month]} ${year}`;
  };

  const changeMonth = (direction) => {
    let newMonth = currentMonth;
    let newYear = currentYear;

    // Salvar o saldo do mês atual antes de mudar
    if (direction === "prev" || direction === "next") {
      const currentKey = `${currentYear}-${currentMonth}`;
      if (currentMonth === new Date().getMonth() && newYear === new Date().getFullYear()) {
        // Se estamos no mês atual, não precisamos alterar o saldo acumulado
        setDisplayedBalance(balance); // Mostra o saldo do mês atual
        setBalanceLabel('Saldo');
      } else {
        // Ajustar o saldo baseado no histórico
        const currentBalance = monthlyBalances[currentKey] || 0;
        if (direction === "next") {
          setDisplayedBalance((prevBalance) => prevBalance + currentBalance);
        } else if (direction === "prev") {
          setDisplayedBalance((prevBalance) => prevBalance - currentBalance);
        }
      }
    }

    // Atualizar o mês e o ano
    if (direction === "prev") {
      if (currentMonth === 0) {
        newMonth = 11;
        newYear = currentYear - 1;
      } else {
        newMonth = currentMonth - 1;
      }
    } else if (direction === "next") {
      if (currentMonth === 11) {
        newMonth = 0;
        newYear = currentYear + 1;
      } else {
        newMonth = currentMonth + 1;
      }
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);

    // Atualizar o saldo exibido e o rótulo ao mudar para um mês futuro ou passado
    const newKey = `${newYear}-${newMonth}`;
    if (newMonth === new Date().getMonth() && newYear === new Date().getFullYear()) {
      setBalanceLabel('Saldo');
      setDisplayedBalance(balance); // Zerar o saldo acumulado e mostrar o saldo atual
    } else {
      const newBalance = monthlyBalances[newKey] || 0;
      setDisplayedBalance(newBalance);
      setBalanceLabel('Saldo Previsto');
    }
  };

  const formatToBRL = (value) => {
    const numberValue = parseFloat(value);
    if (isNaN(numberValue)) {
      return "R$ 0,00";
    }
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numberValue);
  };


  const toggleCardVisibility = (cardName) => {
    setCardVisibility(prevState => ({
      ...prevState,
      [cardName]: !prevState[cardName]
    }));
  };






  const goalColor = amountLeft < 0 ? "red" : "blue";

  return (

    <View style={HomeStyles.container}>

      <ScrollView contentContainerStyle={HomeStyles.scrollViewContent}>

        <View style={    {backgroundColor: '#ece9e8', borderRadius: 35, marginBottom: 20}}>
          
          <View style={HomeStyles.monthYearSelector}>

            <TouchableOpacity style={[
              { paddingRight: '10%', padding: 20, borderRadius: 20  } // Aumentando a área de contato
            ]} onPress={() => changeMonth("prev")}>
              <Icon name="chevron-left" size={24} />
            </TouchableOpacity>
            <Text style={HomeStyles.monthYearText}>
              {formatMonthYear(currentMonth, currentYear)}
            </Text>
            <TouchableOpacity style={[
              { paddingLeft: '10%', padding: 20, borderRadius: 20 } // Aumentando a área de contato
            ]}
              onPress={() => changeMonth("next")}>
              <Icon name="chevron-right" size={24} />
            </TouchableOpacity>
          </View>


          <BalanceCard
            balance={displayedBalance}
            balanceColor={displayedBalance < 0 ? 'red' : 'blue'}
            formatToBRL={formatToBRL}
            label={balanceLabel}
            onLongPress={() => setSelectedCardsModalVisible(true)}
            accountValues={accountValues}
          />


          <AbstractCard
            monthlyIncome={monthlyIncome}
            monthlyExpense={monthlyExpense}
            formatToBRL={formatToBRL}
            onLongPress={() => setSelectedCardsModalVisible(true)}
            accountValues={accountValues}

          />
        </View>
        {cardVisibility.SpendingLimitCard &&
          <SpendingLimitCard
            savedGoal={savedGoal}
            monthlyExpense={monthlyExpense}
            amountLeft={amountLeft}
            goalColor={goalColor}
            formatToBRL={formatToBRL}
            visible={() => setGoalModalVisible(true)}
            onLongPress={() => setSelectedCardsModalVisible(true)}
          />}

        {cardVisibility.AccountsCard &&
          <AccountsCard
            accounts={accounts}
            accountValues={accountValues}
            formatToBRL={formatToBRL}
            HomeStyles={HomeStyles}
            onLongPress={() => setSelectedCardsModalVisible(true)}
            onPress={handleOpenAccountModal}
          />}

        {cardVisibility.MonthlyBalanceCard &&
          <MonthlyBalanceCard
            monthlyIncome={monthlyIncome}
            monthlyExpense={monthlyExpense}
            monthlyBalance={monthlyBalance}
            formatToBRL={formatToBRL}
            HomeStyles={HomeStyles}
            visible={() => setModalVisible(true)}
            onLongPress={() => setSelectedCardsModalVisible(true)}
          />}

      </ScrollView>

      <MonthLimitModal
        visible={goalModalVisible}
        onClose={() => setGoalModalVisible(false)}
        onSaveGoal={handleSaveGoal}
        savedGoal={savedGoal}
      />
      <BalanceModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        selectedMonth={currentMonth}
        selectedYear={currentYear}

      />
      <HelpModal
        visible={helpModalVisible}
        onClose={() => setHelpModalVisible(false)}
      />

      <SelectedCardsModal
        visible={selectedCardsModalVisible}
        onClose={() => setSelectedCardsModalVisible(false)}
        cardVisibility={cardVisibility}
        toggleCardVisibility={toggleCardVisibility}
      />

      <AccountBalanceModal
        visible={accountModalVisible}
        onClose={() => setAccountModalVisible(false)}
        accountName={selectedAccount?.name || ''}
        balance={selectedAccount?.balance || 0}
      />


    </View>
  );
};

export default HomeScreen;
