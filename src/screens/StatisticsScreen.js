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
import statisticsStyles from "../styles/screens/StatisticsScreenStyles";
import moment from "moment";
import { Ionicons } from "@expo/vector-icons";
import ExportModal from "../components/modals/options/ExportModal";

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
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);

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
      ? statisticsStyles.balancePositive
      : filteredBalance < 0
        ? statisticsStyles.balanceNegative
        : statisticsStyles.balanceZero;

  return (
    <ScrollView contentContainerStyle={statisticsStyles.container}>
      <View style={statisticsStyles.headerContainer}>
        <Text style={statisticsStyles.header}>Relatório</Text>

        <View style={{ flexDirection: 'row', paddingTop: 20 }}>
          <TouchableOpacity onPress={openModal} style={statisticsStyles.iconButton}>
            <Icon name="filter-list" size={24} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsExportModalVisible(true)} style={statisticsStyles.iconButton}>
            <Icon name="download" size={24} color="#000" />
          </TouchableOpacity>
        </View>

      </View>

      {selectedType === "all" || selectedType === "income" ? (
        <View style={[statisticsStyles.sectionContainer, statisticsStyles.table]}>
          <Text style={statisticsStyles.sectionHeader}>Receitas por Categoria</Text>
          <View style={statisticsStyles.tableRow}>
            <Text style={statisticsStyles.tableHeader}>Categoria</Text>
            <Text style={statisticsStyles.tableHeader}>Percentual</Text>
            <Text style={statisticsStyles.tableHeader}>Valor(R$)</Text>
          </View>
          {incomeCategories.length > 0 ? (
            incomeCategories.map((item) => (
              <View style={statisticsStyles.tableRow} key={item.id}>
                <Text style={statisticsStyles.tableCell}>{item.name}</Text>
                <Text style={statisticsStyles.tableCell}>
                  ({item.percentage.toFixed(2)}%)
                </Text>
                <Text style={statisticsStyles.tableCell}>
                  {formatNumberBR(item.total)}
                </Text>
              </View>
            ))
          ) : (
            <Text style={statisticsStyles.noData}>Nenhuma receita por categoria.</Text>
          )}
        </View>
      ) : null}

      {selectedType === "all" || selectedType === "expense" ? (
        <View style={[statisticsStyles.sectionContainer, statisticsStyles.table]}>
          <Text style={statisticsStyles.sectionHeader}>Despesas por Categoria</Text>
          <View style={statisticsStyles.tableRow}>
            <Text style={statisticsStyles.tableHeader}>Categoria</Text>
            <Text style={statisticsStyles.tableHeader}>Percentual</Text>
            <Text style={statisticsStyles.tableHeader}>Valor(R$)</Text>
          </View>
          {expenseCategories.length > 0 ? (
            expenseCategories.map((item) => (
              <View style={statisticsStyles.tableRow} key={item.id}>
                <Text style={statisticsStyles.tableCell}>{item.name}</Text>
                <Text style={statisticsStyles.tableCell}>
                  ({item.percentage.toFixed(2)}%)
                </Text>
                <Text style={statisticsStyles.tableCell}>
                  {formatNumberBR(item.total)}
                </Text>
              </View>
            ))
          ) : (
            <Text style={statisticsStyles.noData}>Nenhuma despesa por categoria.</Text>
          )}
        </View>
      ) : null}

      {selectedType === "all" || selectedType === "income" ? (
        <View style={[statisticsStyles.sectionContainer, statisticsStyles.table]}>
          <Text style={statisticsStyles.sectionHeader}>Receitas</Text>

          <View style={statisticsStyles.tableRow}>
            <Text style={statisticsStyles.tableHeader}>Conta</Text>
            <Text style={statisticsStyles.tableHeader}>Valor(R$)</Text>
            <Text style={statisticsStyles.tableHeader}>Categoria</Text>
            <Text style={statisticsStyles.tableHeader}>Data</Text>
          </View>

          {filteredTransactions.filter(
            (transaction) => transaction.type === "income"
          ).length > 0 ? (
            filteredTransactions
              .filter((transaction) => transaction.type === "income")
              .map((item) => (
                <View style={statisticsStyles.transactionItemContainer} key={item.id}>
                  <View style={statisticsStyles.tableRow}>
                    <Text style={statisticsStyles.tableCell}>{item.accountName}</Text>
                    <Text style={statisticsStyles.tableCell}>
                      {formatNumberBR(item.amount)}
                      {item.isRecurring && <Text>{getCurrentInstallment(item)}</Text>}
                    </Text>
                    <Text style={statisticsStyles.tableCell}>{item.categoryName}</Text>
                    <Text style={statisticsStyles.tableCell}>
                      {formatDateToBrazilian(item.date)}
                    </Text>
                  </View>
                </View>
              ))
          ) : (
            <Text style={statisticsStyles.noData}>Nenhuma receita encontrada.</Text>
          )}
        </View>
      ) : null}

      {selectedType === "all" || selectedType === "expense" ? (
        <View style={[statisticsStyles.sectionContainer, statisticsStyles.table]}>
          <Text style={statisticsStyles.sectionHeader}>Despesas</Text>
          <View style={statisticsStyles.tableRow}>
            <Text style={statisticsStyles.tableHeader}>Conta</Text>
            <Text style={statisticsStyles.tableHeader}>Valor</Text>
            <Text style={statisticsStyles.tableHeader}>Categoria</Text>
            <Text style={statisticsStyles.tableHeader}>Data</Text>
          </View>

          {filteredTransactions.filter(
            (transaction) => transaction.type === "expense"
          ).length > 0 ? (
            filteredTransactions
              .filter((transaction) => transaction.type === "expense")
              .map((item) => (
                <View style={statisticsStyles.transactionItemContainer} key={item.id}>
                  <View style={statisticsStyles.tableRow}>
                    <Text style={statisticsStyles.tableCell}>{item.accountName}</Text>
                    <Text style={statisticsStyles.tableCell}>
                      {formatNumberBR(item.amount)}
                      {item.isRecurring && <Text>{getCurrentInstallment(item)}</Text>}
                    </Text>
                    <Text style={statisticsStyles.tableCell}>{item.categoryName}</Text>
                    <Text style={statisticsStyles.tableCell}>
                      {formatDateToBrazilian(item.date)}
                    </Text>
                  </View>
                </View>
              ))
          ) : (
            <Text style={statisticsStyles.noData}>Nenhuma despesa encontrada.</Text>
          )}
        </View>
      ) : null}

      <View style={[statisticsStyles.sectionContainer, statisticsStyles.table]}>
        <Text style={statisticsStyles.sectionHeader}>Visão Geral</Text>

        <View style={statisticsStyles.tableRow}>
          <Text style={statisticsStyles.tableHeader}>Visão geral</Text>
          <Text style={statisticsStyles.tableHeader}>Receitas</Text>
          <Text style={statisticsStyles.tableHeader}>Despesas</Text>
        </View>
        <View style={statisticsStyles.tableRow}>
          <Text style={statisticsStyles.tableCell}>Quantidade</Text>
          <Text style={statisticsStyles.tableCell}>{quantityRevenues}</Text>
          <Text style={statisticsStyles.tableCell}>{quantityExpenses}</Text>
        </View>
        <View style={statisticsStyles.tableRow}>
          <Text style={statisticsStyles.tableCell}>Total</Text>
          <Text style={statisticsStyles.tableCell}>{formatNumberBR(totalRevenues.toFixed(2))}</Text>
          <Text style={statisticsStyles.tableCell}>{formatNumberBR(totalExpenses.toFixed(2))}</Text>
        </View>
        <View style={statisticsStyles.tableRow}>
          <Text style={statisticsStyles.tableCell}>Média por Dia</Text>
          <Text style={statisticsStyles.tableCell}>{formatNumberBR(avgRevenuePerDay.toFixed(2))}</Text>
          <Text style={statisticsStyles.tableCell}>{formatNumberBR(avgExpensePerDay.toFixed(2))}</Text>
        </View>
        <View style={statisticsStyles.balanceRow}>
          <Text style={[statisticsStyles.tableCell, statisticsStyles.balanceLabel]}>
            Fluxo de caixa
          </Text>
          <Text style={[statisticsStyles.tableCell, balanceColor]}>
            R$ {formatNumberBR(filteredBalance.toFixed(2))}
          </Text>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={statisticsStyles.modalContainer}>
          <View style={statisticsStyles.modalContent}>
            <Text style={statisticsStyles.modalTitle}>Filtros</Text>
            <TouchableOpacity
              style={statisticsStyles.closeButton}
              onPress={closeModal}
            >
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
            <Text style={statisticsStyles.filterLabel}>Tipo de Transação</Text>
            <Picker
              selectedValue={selectedType}
              style={statisticsStyles.picker}
              onValueChange={(itemValue) => setSelectedType(itemValue)}
            >
              <Picker.Item label="Todas" value="all" />
              <Picker.Item label="Receitas" value="income" />
              <Picker.Item label="Despesas" value="expense" />
            </Picker>

            <Text style={statisticsStyles.filterLabel}>Categoria</Text>
            <Picker
              selectedValue={selectedCategory}
              style={statisticsStyles.picker}
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

            <Text style={statisticsStyles.filterLabel}>Conta</Text>
            <Picker
              selectedValue={selectedAccount}
              style={statisticsStyles.picker}
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

            <Text style={statisticsStyles.filterLabel}>Data de Início</Text>
            <TouchableOpacity onPress={showStartDatePicker}>
              <TextInput
                style={statisticsStyles.dateInput}
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

            <Text style={statisticsStyles.filterLabel}>Data de Fim</Text>
            <TouchableOpacity onPress={showEndDatePicker}>
              <TextInput
                style={statisticsStyles.dateInput}
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

            <View style={statisticsStyles.modalButtonsContainer}>
              <TouchableOpacity onPress={closeModal} style={statisticsStyles.modalButton}>
                <Text style={statisticsStyles.modalButtonText}>Aplicar Filtros </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={clearFilters}
                style={statisticsStyles.modalButton}
              >
                <Text style={statisticsStyles.modalButtonText}>Limpar Filtros</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <ExportModal
        visible={isExportModalVisible}
        onClose={() => setIsExportModalVisible(false)}
      />
    </ScrollView>
  );
};

export default DashboardScreen;
