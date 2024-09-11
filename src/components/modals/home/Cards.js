// src/components/Cards.js

import React, { useState, useTransition } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { Card } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import HomeStyles from "../../../styles/screens/HomeScreenStyles";
import { useNavigation } from "@react-navigation/native";
import { useCreditCards } from "../../../context/CreditCardContext";
import { useTransactions } from "../../../context/TransactionContext";
import { useAccounts } from "../../../context/AccountContext";
import CreditCardModal from "../options/CreditCardModal";
import moment from "moment";

export const BalanceCard = ({
  balance,
  balanceColor,
  formatToBRL,
  label,
  accountValues,
}) => (
  <View style={HomeStyles.balanceContainer}>
    <View style={HomeStyles.textContainer}>
      <Text style={HomeStyles.balanceText}>{label}</Text>
      <Text
        style={[
          HomeStyles.balanceAmount,
          {
            color:
              Object.values(accountValues).reduce((a, b) => a + b, 0) < 0
                ? "red"
                : "blue",
          },
        ]}
      >
        {formatToBRL(
          parseFloat(Object.values(accountValues).reduce((a, b) => a + b, 0))
        )}
      </Text>
    </View>
  </View>
);

export const AbstractCard = ({
  monthlyIncome,
  monthlyExpense,
  formatToBRL,
  onLongPress,
}) => {
  const navigation = useNavigation();

  const navigateToTransactions = (type) => {
    navigation.navigate("Transações", { filterType: type });
  };

  return (
    <View style={HomeStyles.summaryContainer}>
      <Card
        style={HomeStyles.card}
        onPress={() => navigateToTransactions("income")}
        onLongPress={onLongPress}
      >
        <Card.Content>
          <View style={HomeStyles.summaryItemContainer}>
            <Text style={HomeStyles.summaryItemTitle}>Receitas do Mês</Text>
            <Text style={[HomeStyles.summaryItemAmount, { color: "blue" }]}>
              {formatToBRL(monthlyIncome)}
            </Text>
          </View>
        </Card.Content>
      </Card>
      <Card
        style={HomeStyles.card}
        onPress={() => navigateToTransactions("expense")}
        onLongPress={onLongPress}
      >
        <Card.Content>
          <View style={HomeStyles.summaryItemContainer}>
            <Text style={HomeStyles.summaryItemTitle}>Despesas do Mês</Text>
            <Text style={[HomeStyles.summaryItemAmount, { color: "red" }]}>
              {formatToBRL(monthlyExpense)}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
};

export const SpendingLimitCard = ({
  savedGoal,
  monthlyExpense,

  amountLeft,
  goalColor,
  formatToBRL,
  visible,
  onLongPress,
}) => {
  const calculateBarColor = (percentage) => {
    if (percentage < 50) {
      return "blue";
    } else if (percentage < 75) {
      return "orange";
    } else {
      return "red";
    }
  };

  const renderProgressBar = () => {
    const spendingGoalValue = parseFloat(savedGoal) || 0;
    const percentage = (monthlyExpense / spendingGoalValue) * 100;
    const barColor = calculateBarColor(percentage);

    return (
      <View style={HomeStyles.progressBarContainer}>
        <View
          style={[
            HomeStyles.progressBar,
            { width: `${percentage}%`, backgroundColor: barColor },
          ]}
        />
      </View>
    );
  };

  return (
    <Card
      style={HomeStyles.accountsCard}
      onPress={visible}
      onLongPress={onLongPress}
    >
      <Card.Content>
        <Text style={HomeStyles.cardTitle}>Limite de Gastos Mensais</Text>
        {parseFloat(savedGoal) === 0 ? (
          <Text style={{ fontSize: 16 }}>Limite não definido</Text>
        ) : (
          <>
            <View style={HomeStyles.monthlyBalanceItem}>
              <Text style={{ fontSize: 16 }}>Limite:</Text>
              <Text>{formatToBRL(parseFloat(savedGoal))}</Text>
            </View>
            <View style={HomeStyles.monthlyBalanceItem}>
              <Text style={{ fontSize: 16 }}>Gasto Mensal:</Text>
              <Text style={{ color: "red" }}>
                {formatToBRL(monthlyExpense)}
              </Text>
            </View>
            {renderProgressBar()}
            <Text style={{ color: goalColor, fontSize: 16 }}>
              {amountLeft < 0
                ? `O limite foi excedido em ${formatToBRL(
                  Math.abs(amountLeft)
                )}`
                : `Falta ${formatToBRL(amountLeft)} para alcançar o limite`}
            </Text>
          </>
        )}
      </Card.Content>
    </Card>
  );
};

export const AccountsCard = ({
  accounts,
  accountValues,
  formatToBRL,
  HomeStyles,
  onLongPress,
  onPress,
}) => {
  const navigation = useNavigation();

  const navigateToAddTransactionsAccount = (accountId, activateSwitch) => {
    navigation.navigate("AddTransactionScreen", { accountId, activateSwitch });
  };
  
  const navigateToTransactions = (account) => {
    navigation.navigate("Transações", { filterAccount: account });
  };
  const getCreditSubAccounts = (debitAccountId) => {
    return accounts.filter(
      (account) => account.type === "Credito" && account.debitAccountId === debitAccountId
    );
  };

  const calculateDebitAccountBalance = (account) => {
    const debitBalance = accountValues[account.id] || 0;
    const creditSubAccounts = getCreditSubAccounts(account.id);
    
    // Soma o saldo das subcontas de crédito associadas
    const creditSubAccountsBalance = creditSubAccounts.reduce((sum, creditAccount) => {
      return sum + (accountValues[creditAccount.id] || 0);
    }, 0);

    // Retorna o saldo da conta de débito mais o saldo das subcontas de crédito
    return debitBalance + creditSubAccountsBalance;
  };

  const totalDebitBalance = accounts
    .filter((account) => account.type === "Debito")
    .reduce((total, account) => total + calculateDebitAccountBalance(account), 0);

  return (
    <>
      <Card style={HomeStyles.accountsCard} onLongPress={onLongPress}>
        <Card.Content>
          <Text style={HomeStyles.accountsTitle}>Contas</Text>
          {accounts
            .filter((account) => account.type === "Debito")
            .map((account) => {
              const totalBalance = calculateDebitAccountBalance(account);
              console.log("dedbito", calculateDebitAccountBalance(account));

              return (
                <TouchableOpacity
                  key={account.id}
                  onPress={() => navigateToTransactions(account.name)}
                >
                  <View style={HomeStyles.accountItem}>
                    <Text style={HomeStyles.accountName}>
                      {account.name}
                      {"\n"}
                      <Text
                        style={[
                          HomeStyles.accountAmount,
                          {
                            color: totalBalance < 0 ? "red" : "blue",
                          },
                        ]}
                      >
                        {formatToBRL(totalBalance)}
                      </Text>
                    </Text>
                    <TouchableOpacity
                      onPress={() => navigateToAddTransactionsAccount(account.id, false)} // Aqui o switch será desativado
                      style={HomeStyles.addButton}
                    >
                      <MaterialIcons name="add" size={30} color="blue" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          <View style={HomeStyles.accountDivider} />
          <View style={HomeStyles.totalContainer}>
            <Text style={HomeStyles.totalText}>Total:</Text>
            <Text
              style={[
                HomeStyles.totalAmount,
                {
                  color:
                    Object.values(accountValues).reduce((a, b) => a + b, 0) < 0
                      ? "red"
                      : "blue",
                },
              ]}
            >
              {formatToBRL(totalDebitBalance)}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </>
  );
};


export const MonthlyBalanceCard = ({
  monthlyIncome,
  monthlyExpense,
  monthlyBalance,
  formatToBRL,
  HomeStyles,
  visible,
  onLongPress,
}) => (
  <Card
    style={HomeStyles.accountsCard}
    onPress={visible}
    onLongPress={onLongPress}
  >
    <Card.Content>
      <Text style={HomeStyles.monthlyBalanceTitle}>Balanço Mensal</Text>
      <View style={HomeStyles.accountDivider} />
      <View style={HomeStyles.monthlyBalanceContent}>
        <View style={HomeStyles.monthlyBalanceItem}>
          <Text style={HomeStyles.monthlyBalanceLabel}>Receitas:</Text>
          <Text style={[HomeStyles.monthlyBalanceValue, { color: "blue" }]}>
            {formatToBRL(parseFloat(monthlyIncome.toFixed(2)))}
          </Text>
        </View>
        <View style={HomeStyles.monthlyBalanceItem}>
          <Text style={HomeStyles.monthlyBalanceLabel}>Despesas:</Text>
          <Text style={[HomeStyles.monthlyBalanceValue, { color: "red" }]}>
            {formatToBRL(parseFloat(monthlyExpense.toFixed(2)))}
          </Text>
        </View>
        <View style={HomeStyles.accountDivider} />
        <View style={HomeStyles.monthlyBalanceItem}>
          <Text style={HomeStyles.monthlyBalanceLabel}>Balanço:</Text>
          <Text
            style={[
              HomeStyles.monthlyBalanceValue,
              { color: monthlyBalance < 0 ? "red" : "blue" },
            ]}
          >
            {formatToBRL(parseFloat(monthlyBalance.toFixed(2)))}
          </Text>
        </View>
      </View>
    </Card.Content>
  </Card>
);

export const CreditCard = ({
  cardName,
  dueDate,
  formatToBRL,
  onPress,
  onLongPress,
  creditCards,
  accountValues,
  accounts,
  currentMonth,
  currentYear,
}) => {
  const [isCreditCardModalVisible, setCreditCardModalVisible] = useState(false);
  const { calculateAccountTransactionsTotal } = useTransactions();
  const navigation = useNavigation();

  const navigateToTransactions = (account) => {
    navigation.navigate("Transações", { filterAccount: account });
  };
  const navigateToAddTransactionsAccount = (accountId, activateSwitch) => {
    navigation.navigate("AddTransactionScreen", { accountId, activateSwitch });
  };

  const calculatePercentage = (limit, usedLimit) => {
    const percentage = (Math.abs(usedLimit) / Math.abs(limit)) * 100;
    return Math.min(percentage, 100); // Garante que o valor não exceda 100%
  };

  const renderProgressBar = (percentage) => {
    const progressBarWidth = `${percentage}%`;

    return (
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBar, { width: progressBarWidth }]} />
          <Text style={styles.progressText}>{`${percentage.toFixed(2)}%`}</Text>
        </View>
      </View>
    );
  };

  // Função para calcular o total usado em todos os cartões de crédito
  const totalCreditUsed = accounts
    .filter((account) => account.type === "Credito")
    .reduce((total, account) => {
      const usedLimit =
        calculateAccountTransactionsTotal(account.id, currentMonth, currentYear) || 0;
      return total + usedLimit;
    }, 0);

  return (
    <>
      <Card
        style={HomeStyles.accountsCard}
        onPress={onPress}
        onLongPress={onLongPress}
      >
        <Card.Content>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={[HomeStyles.cardTitle, { marginBottom: 15 }]}>
              Cartões de Crédito
            </Text>
          </View>

          {accounts
            .filter((account) => account.type === "Credito")
            .map((account) => {
              const limit = account.initialBalance;
              const usedLimit =
                calculateAccountTransactionsTotal(account.id, currentMonth, currentYear) || 0;
              const availableBalance = account.initialBalance + usedLimit;
              const percentage = calculatePercentage(limit, usedLimit);

              return (
                <TouchableOpacity
                  key={account.id}
                  onPress={() => navigateToTransactions(account.name)}
                >
                  <View style={HomeStyles.accountItem}>
                    <Text
                      style={[
                        styles.cardLabel,
                        { fontSize: 15, fontWeight: "bold" },
                      ]}
                    >
                      {account.name}:
                      <Text style={{ fontSize: 12, fontWeight: "300" }}>
                        Fecha dia {moment(account.dueDate).format("DD")}{" "}
                      </Text>
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        navigateToAddTransactionsAccount(account.id, true)
                      }
                      style={HomeStyles.addButton}
                    >
                      <MaterialIcons name="add" size={30} color="blue" />
                    </TouchableOpacity>
                  </View>
                  {renderProgressBar(percentage)}
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={[styles.cardLabel, { textAlign: "right" }]}>
                      Disponível: {formatToBRL(availableBalance)}
                    </Text>
                    <Text style={[styles.cardLabel, { textAlign: "right" }]}>
                      Usado: {formatToBRL(usedLimit)}
                    </Text>
                  </View>
                  <View style={HomeStyles.accountDivider} />
                </TouchableOpacity>
              );
            })}

          {/* Exibição do total dos créditos usados */}
          <View style={HomeStyles.totalContainer}>
            <Text style={HomeStyles.totalText}>Total Usado:</Text>
            <Text
              style={[
                HomeStyles.totalAmount,
                {
                  color: totalCreditUsed < 0 ? "red" : "blue",
                },
              ]}
            >
              {formatToBRL(totalCreditUsed)}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </>
  );
};


const styles = StyleSheet.create({
  progressBarContainer: {
    width: "100%",
    padding: 10,
  },
  progressBarBackground: {
    height: 20,
    backgroundColor: "white", // Cor de fundo da barra
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "orange", // Cor da parte preenchida da barra
    position: "absolute",
    top: 0,
    left: 0,
    borderRadius: 10,
  },
  progressText: {
    color: "black", // Cor do texto (pode ser ajustada para visibilidade)
    fontWeight: "bold",
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -10 }], // Centraliza verticalmente o texto
  },
});

export default CreditCard;
