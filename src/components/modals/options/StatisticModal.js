
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
import { useCategories } from "../../../context/CategoryContext";
import { useTransactions } from "../../../context/TransactionContext";
import { useAccounts } from "../../../context/AccountContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import moment from "moment";
import statisticsStyles from "../../../styles/screens/StatisticsScreenStyles";
import { Ionicons } from "@expo/vector-icons";
import ExportModal from "./ExportModal";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

const StatisticsModal = ({ visible, onClose }) => {
    const { categories } = useCategories();
    const { transactions } = useTransactions();
    const { accounts } = useAccounts();

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedType, setSelectedType] = useState("all");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedAccount, setSelectedAccount] = useState("all");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
    const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);
    const [filteredBalance, setFilteredBalance] = useState(0);
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

        const date = new Date(dateString);
        date.setHours(date.getHours() + date.getTimezoneOffset() / 60);

        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
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

        return ` (${totalInstallments})`;
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

    const filteredTransactions = applyFilters();

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

    const calculateUniqueDays = (transactions) => {
        const uniqueDays = new Set(
            transactions.map((transaction) => formatDateToBrazilian(transaction.date))
        );
        return uniqueDays.size;
    };

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

    const generatePDF = async () => {
        const formatCurrency = (value) =>
            value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

        const formatCategory = (categories, title) => {
            return `
            <table class="table">
              <thead>
                <tr>
                  <th colspan="3" style="text-align: center; font-size: 26">${title}</th>
                </tr>
                <tr>
                  <th>Categoria</th>
                  <th>Total</th>
                  <th>Percentual</th>
                </tr>
              </thead>
              <tbody>
                ${categories
                    .map(
                        (cat) => `
                  <tr>
                    <td>${cat.name}</td>
                    <td>${cat.total.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                        })}</td>
                    <td>${cat.percentage.toFixed(2)}%</td>
                  </tr>
                `
                    )
                    .join("")}
              </tbody>
            </table>
          `;
        };

        const formatTransactions = (transactions, title) => {
            return `
            <table class="table">
              <thead>
              <tr>
                  <th colspan="4" style="text-align: center; font-size: 26">${title}</th>
              </tr>
                <tr>
                  <th>Data</th>
                  <th>Categoria</th>
                  <th>Conta</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                ${transactions
                    .map((transaction) => {
                        const installmentInfo = transaction.isRecurring
                            ? ` (${getCurrentInstallment(transaction)})`
                            : "";
                        return `
                  <tr>
                    <td>${new Date(transaction.date).toLocaleDateString(
                            "pt-BR"
                        )}</td>
                    <td>${transaction.categoryName}</td>
                    <td>${transaction.accountName}</td>
                    <td>${formatCurrency(transaction.amount)} ${installmentInfo}</td>
                  </tr>
                `;
                    })
                    .join("")}
              </tbody>
            </table>
          `;
        };

        const htmlContent = `
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { text-align: center; }
                h3 { margin-top: 20px; text-align: center; }
                .section { margin: 20px 0; }
                .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                .table th { text-align: center; background-color: #f2f2f2; }
                .table td { text-align: left; }
                .positive { color: green; }
                .negative { color: red; }
              </style>
            </head>
            <body>
              <h1>Relatório Financeiro</h1>
              <div class="section">
                ${formatCategory(incomeCategories, "Receitas por Categoria")}
              </div>
              <div class="section">
                ${formatCategory(expenseCategories, "Despesas por Categoria")}
              </div>
              <div class="section">
                ${formatTransactions(
            filteredTransactions.filter((t) => t.type === "income"),
            "Receitas"
        )}
              </div>
              <div class="section">
                ${formatTransactions(
            filteredTransactions.filter((t) => t.type === "expense"),
            "Despesas"
        )}
              </div>
              <div class="section">
                <table class="table">
                  <tbody>
                    <tr>
                      <th colspan="2"; style="text-align: center; font-size: 26"> Visão Geral</th>
    
                    </tr>
                    <tr>
                      <td>Quantidade de Receitas</td>
                      <td>${quantityRevenues}</td>
                    </tr>
                    <tr>
                      <td>Quantidade de Despesas</td>
                      <td>${quantityExpenses}</td>
                    </tr>
                    <tr>
                      <td>Média de Receita por Dia</td>
                      <td>${avgRevenuePerDay.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td>Média de Despesa por Dia</td>
                      <td>${avgExpensePerDay.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td>Total de Receitas</td>
                      <td>${formatCurrency(totalRevenues)}</td>
                    </tr>
                    <tr>
                      <td>Total de Despesas</td>
                      <td>${formatCurrency(totalExpenses)}</td>
                    </tr>
                    <tr>
                      <td>Fluxo de Caixa</td>
                      <td class="${filteredBalance > 0 ? "positive" : "negative"
            }">${formatCurrency(filteredBalance)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </body>
          </html>
        `;

        try {
            const { uri } = await Print.printToFileAsync({ html: htmlContent });
            await Sharing.shareAsync(uri);
        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
        }
    };

    const balanceColor =
        filteredBalance > 0
            ? statisticsStyles.balancePositive
            : filteredBalance < 0
                ? statisticsStyles.balanceNegative
                : statisticsStyles.balanceZero;

    return (
        <>
            <Modal
                animationType="slide"
                transparent={true}
                visible={visible}
                onRequestClose={onClose}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <ScrollView>
                            <View style={statisticsStyles.headerContainer}>
                                <Text style={statisticsStyles.header}>Relatório</Text>
                                <View style={{ justifyContent: 'flex-end', flexDirection: 'row', paddingTop: 20 }}>
                                <TouchableOpacity onPress={openModal} style={statisticsStyles.iconButton}>
                                        <Icon name="filter-list" size={24} color="#000" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={onClose} style={statisticsStyles.iconButton}>
                                        <Icon name="close" size={24} color="#000" />
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
                        </ScrollView>
                    </View>
                </View>
            </Modal >

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
                            <Ionicons name="close" size={45} color="black" />
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
                        <TouchableOpacity
                            onPress={generatePDF}
                            style={{
                                alignItems: 'center',
                                padding: 10,
                                backgroundColor: 'blue',
                                borderRadius: 5,
                                marginHorizontal: 5,
                                marginBottom: 10,
                            }}
                        >
                            <Text style={statisticsStyles.modalButtonText}>Baixar Relatorio</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </>
    );

}


const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        flex: 1,
        width: '100%',
        backgroundColor: '#fff',
        padding: 20,
    },
});
export default StatisticsModal;
