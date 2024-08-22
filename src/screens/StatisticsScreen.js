import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Button,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useCategories } from "../context/CategoryContext";
import { useTransactions } from "../context/TransactionContext";
import { useAccounts } from "../context/AccountContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import styles from "../styles/screens/StatisticsScreenStyles";
import moment from "moment";

const DashboardScreen = () => {
  const { categories } = useCategories();
  const { transactions } = useTransactions();
  const { accounts } = useAccounts(); // Adiciona contas do contexto
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState("all"); // Adiciona estado para tipo de transação

  // Estados para os filtros
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);
  const [filteredBalance, setFilteredBalance] = useState(0); // Novo estado para o saldo filtrado

  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedAccount("all");
    setSelectedType("all");
    setStartDate(null);
    setEndDate(null);
  };

  const showStartDatePicker = () => setStartDatePickerVisible(true);
  const hideStartDatePicker = () => setStartDatePickerVisible(false);

  const showEndDatePicker = () => setEndDatePickerVisible(true);
  const hideEndDatePicker = () => setEndDatePickerVisible(false);

  const formatDateToBrazilian = (dateString) => {
    // Cria um novo objeto Date a partir da string de data
    const date = new Date(dateString);

    // Ajusta a data para a data correta removendo a parte do fuso horário
    date.setHours(date.getHours() + date.getTimezoneOffset() / 60);

    // Formata a data para o formato brasileiro
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Lembre-se que os meses são indexados a partir de 0
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const getCurrentInstallment = (item) => {
    if (
      !item.isRecurring ||
      !item.startDate ||
      !item.date ||
      !item.recorrenceCount
    ) {
      return "";
    }

    const startDate = moment(item.startDate, "YYYY-MM-DD");
    const transactionDate = moment(item.date, "YYYY-MM-DD");
    const totalInstallments = item.recorrenceCount;

    // Calcula a diferença em meses entre a data de início e a data da transação
    let monthsDifference = transactionDate.diff(startDate, "months");

    // Lógica para calcular o número da parcela
    let installmentNumber;

    if (transactionDate.isSame(startDate, "month")) {
      installmentNumber = monthsDifference + 1; // Subtrai 1 se for o mesmo mês da startDate
    } else {
      installmentNumber = monthsDifference + 2; // Soma 2 caso contrário
    }

    // Garante que o número da parcela não exceda o total de parcelas
    if (installmentNumber > totalInstallments) {
      installmentNumber = totalInstallments;
    }

    return ` (${installmentNumber}/${totalInstallments})`;
  };

  const formatNumberBR = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const applyFilters = () => {
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date).getTime();
      const matchCategory =
        selectedCategory === "all" ||
        transaction.categoryId === selectedCategory;
      const matchAccount =
        selectedAccount === "all" || transaction.accountId === selectedAccount;
      const matchType =
        selectedType === "all" || transaction.type === selectedType;

      const matchStartDate =
        !startDate || transactionDate >= new Date(startDate).getTime();
      const matchEndDate =
        !endDate || transactionDate <= new Date(endDate).getTime();

      return (
        matchCategory &&
        matchAccount &&
        matchType &&
        matchStartDate &&
        matchEndDate
      );
    });
  };

  // Filtra e calcula os dados para a visão geral
  const filteredTransactions = applyFilters();

  // Calcular saldo filtrado
  useEffect(() => {
    const balance = filteredTransactions.reduce((total, transaction) => {
      return transaction.type === "income"
        ? total + transaction.amount
        : total - transaction.amount;
    }, 0);
    setFilteredBalance(balance);
  }, [filteredTransactions]);

  const totalRevenues = filteredTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const totalExpenses = filteredTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const quantityRevenues = filteredTransactions.filter(
    (transaction) => transaction.type === "income"
  ).length;
  const quantityExpenses = filteredTransactions.filter(
    (transaction) => transaction.type === "expense"
  ).length;

  // Função para calcular o número de dias únicos entre as transações filtradas
  const calculateUniqueDays = (transactions) => {
    const uniqueDays = new Set(
      transactions.map((transaction) => formatDateToBrazilian(transaction.date))
    );
    return uniqueDays.size;
  };

  // Calcular média diária com base nos dias únicos
  const avgRevenuePerDay =
    totalRevenues > 0
      ? totalRevenues /
        calculateUniqueDays(
          filteredTransactions.filter(
            (transaction) => transaction.type === "income"
          )
        )
      : 0;
  const avgExpensePerDay =
    totalExpenses > 0
      ? totalExpenses /
        calculateUniqueDays(
          filteredTransactions.filter(
            (transaction) => transaction.type === "expense"
          )
        )
      : 0;

  const calculateCategoryTotals = (type) => {
    return categories
      .filter((cat) => cat.type === type)
      .map((cat) => {
        const totalForCategory = filteredTransactions
          .filter(
            (transaction) =>
              transaction.categoryId === cat.id && transaction.type === type
          )
          .reduce((total, transaction) => total + transaction.amount, 0);

        return {
          ...cat,
          total: totalForCategory,
          percentage:
            (totalForCategory /
              (type === "expense" ? totalExpenses : totalRevenues)) *
            100,
        };
      })
      .filter((cat) => cat.total > 0);
  };

  const expenseCategories = calculateCategoryTotals("expense");
  const incomeCategories = calculateCategoryTotals("income");

  const balanceColor =
    filteredBalance > 0
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

      {selectedType === "all" || selectedType === "income" ? (
        <View style={[styles.sectionContainer, styles.table]}>
          <Text style={styles.sectionHeader}>Receitas por Categoria</Text>
          <View style={styles.tableRow}>
            <Text style={styles.tableHeader}>Categoria</Text>
            <Text style={styles.tableHeader}>Percentual</Text>
            <Text style={styles.tableHeader}>Valor(R$)</Text>
          </View>
          {incomeCategories.length > 0 ? (
            incomeCategories.map((item) => (
              <View style={styles.tableRow} key={item.id}>
                <Text style={styles.tableCell}>{item.name}</Text>
                <Text style={styles.tableCell}>
                  ({item.percentage.toFixed(2)}%)
                </Text>
                <Text style={styles.tableCell}>
                  {formatNumberBR(item.total)}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noData}>Nenhuma receita por categoria.</Text>
          )}
        </View>
      ) : null}

      {selectedType === "all" || selectedType === "expense" ? (
        <View style={[styles.sectionContainer, styles.table]}>
          <Text style={styles.sectionHeader}>Despesas por Categoria</Text>
          <View style={styles.tableRow}>
            <Text style={styles.tableHeader}>Categoria</Text>
            <Text style={styles.tableHeader}>Percentual</Text>
            <Text style={styles.tableHeader}>Valor(R$)</Text>
          </View>
          {expenseCategories.length > 0 ? (
            expenseCategories.map((item) => (
              <View style={styles.tableRow} key={item.id}>
                <Text style={styles.tableCell}>{item.name}</Text>
                <Text style={styles.tableCell}>
                  ({item.percentage.toFixed(2)}%)
                </Text>
                <Text style={styles.tableCell}>
                  {formatNumberBR(item.total)}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noData}>Nenhuma despesa por categoria.</Text>
          )}
        </View>
      ) : null}

      {selectedType === "all" || selectedType === "income" ? (
        <View style={[styles.sectionContainer, styles.table]}>
          <Text style={styles.sectionHeader}>Receitas</Text>

          <View style={styles.tableRow}>
            <Text style={styles.tableHeader}>Conta</Text>
            <Text style={styles.tableHeader}>Valor(R$)</Text>
            <Text style={styles.tableHeader}>Categoria</Text>
            <Text style={styles.tableHeader}>Data</Text>
          </View>

          {filteredTransactions.filter(
            (transaction) => transaction.type === "income"
          ).length > 0 ? (
            filteredTransactions
              .filter((transaction) => transaction.type === "income")
              .map((item) => (
                <View style={styles.transactionItemContainer} key={item.id}>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCell}>{item.accountName}</Text>
                    <Text style={styles.tableCell}>
                      {formatNumberBR(item.amount)} 
                      {item.isRecurring && <Text>{getCurrentInstallment(item)}</Text>}
                    </Text>
                    <Text style={styles.tableCell}>{item.categoryName}</Text>
                    <Text style={styles.tableCell}>
                      {formatDateToBrazilian(item.date)}
                    </Text>
                  </View>
                </View>
              ))
          ) : (
            <Text style={styles.noData}>Nenhuma receita encontrada.</Text>
          )}
        </View>
      ) : null}

      {selectedType === "all" || selectedType === "expense" ? (
        <View style={[styles.sectionContainer, styles.table]}>
          <Text style={styles.sectionHeader}>Despesas</Text>
          <View style={styles.tableRow}>
            <Text style={styles.tableHeader}>Conta</Text>
            <Text style={styles.tableHeader}>Valor</Text>
            <Text style={styles.tableHeader}>Categoria</Text>
            <Text style={styles.tableHeader}>Data</Text>
          </View>

          {filteredTransactions.filter(
            (transaction) => transaction.type === "expense"
          ).length > 0 ? (
            filteredTransactions
              .filter((transaction) => transaction.type === "expense")
              .map((item) => (
                <View style={styles.transactionItemContainer} key={item.id}>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCell}>{item.accountName}</Text>
                    <Text style={styles.tableCell}>
                      {formatNumberBR(item.amount)}
                      {item.isRecurring && <Text>{getCurrentInstallment(item)}</Text>}
                    </Text>
                    <Text style={styles.tableCell}>{item.categoryName}</Text>
                    <Text style={styles.tableCell}>
                      {formatDateToBrazilian(item.date)}
                    </Text>
                  </View>
                </View>
              ))
          ) : (
            <Text style={styles.noData}>Nenhuma despesa encontrada.</Text>
          )}
        </View>
      ) : null}

      <View style={[styles.sectionContainer, styles.table]}>
        <Text style={styles.sectionHeader}>Visão Geral</Text>

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
          <Text style={[styles.tableCell, styles.balanceLabel]}>
            Fluxo de caixa
          </Text>
          <Text style={[styles.tableCell, balanceColor]}>
            {filteredBalance.toFixed(2)}
          </Text>
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
              {categories.map((category) => (
                <Picker.Item
                  key={category.id}
                  label={category.name}
                  value={category.id}
                />
              ))}
            </Picker>

            <Text style={styles.filterLabel}>Conta</Text>
            <Picker
              selectedValue={selectedAccount}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedAccount(itemValue)}
            >
              <Picker.Item label="Todas" value="all" />
              {accounts.map((account) => (
                <Picker.Item
                  key={account.id}
                  label={account.name}
                  value={account.id}
                />
              ))}
            </Picker>

            <Text style={styles.filterLabel}>Data de Início</Text>
            <TouchableOpacity onPress={showStartDatePicker}>
              <TextInput
                style={styles.dateInput}
                value={startDate ? startDate.toLocaleDateString() : ""}
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
                value={endDate ? endDate.toLocaleDateString() : ""}
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
              <TouchableOpacity
                onPress={clearFilters}
                style={styles.modalButton}
              >
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

export default DashboardScreen;
