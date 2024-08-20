import React, { useState, useEffect } from 'react';
import { TextInput, TouchableOpacity, Modal, View, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useCategories } from '../../../context/CategoryContext';
import { useTransactions } from '../../../context/TransactionContext';
import { useAccounts } from '../../../context/AccountContext';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import styles from '../../../styles/screens/StatisticsScreenStyles';

const ExportModal = ({ visible, onClose }) => {

  const { categories } = useCategories();
  const { transactions } = useTransactions();
  const { accounts } = useAccounts();
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);
  const [filteredBalance, setFilteredBalance] = useState(0);

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedAccount('all');
    setSelectedType('all');
    setStartDate(null);
    setEndDate(null);
  };
  const formatDateToBrazilian = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Lembre-se que os meses são indexados a partir de 0
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const showStartDatePicker = () => setStartDatePickerVisible(true);
  const hideStartDatePicker = () => setStartDatePickerVisible(false);

  const showEndDatePicker = () => setEndDatePickerVisible(true);
  const hideEndDatePicker = () => setEndDatePickerVisible(false);

  const applyFilters = () => {
    return transactions.filter((transaction) => {
      const matchCategory = selectedCategory === 'all' || transaction.categoryId === selectedCategory;
      const matchAccount = selectedAccount === 'all' || transaction.accountId === selectedAccount;
      const matchType = selectedType === 'all' || transaction.type === selectedType;

      const matchStartDate = !startDate || new Date(transaction.date) >= startDate;
      const matchEndDate = !endDate || new Date(transaction.date) <= endDate;

      return matchCategory && matchAccount && matchType && matchStartDate && matchEndDate;
    });
  };

  // Filtra e calcula os dados para a visão geral
  const filteredTransactions = applyFilters();

  // Calcular saldo filtrado
  useEffect(() => {
    const balance = filteredTransactions.reduce((total, transaction) => {
      return transaction.type === 'income' ? total + transaction.amount : total - transaction.amount;
    }, 0);
    setFilteredBalance(balance);
  }, [filteredTransactions]);

  const totalRevenues = filteredTransactions
    .filter(transaction => transaction.type === 'income')
    .reduce((total, transaction) => total + transaction.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(transaction => transaction.type === 'expense')
    .reduce((total, transaction) => total + transaction.amount, 0);

  const quantityRevenues = filteredTransactions.filter(transaction => transaction.type === 'income').length;
  const quantityExpenses = filteredTransactions.filter(transaction => transaction.type === 'expense').length;

  // Função para calcular o número de dias únicos entre as transações filtradas
  const calculateUniqueDays = (transactions) => {
    const uniqueDays = new Set(transactions.map(transaction => formatDateToBrazilian(transaction.date)));
    return uniqueDays.size;
  };

  // Calcular média diária com base nos dias únicos
  const avgRevenuePerDay = totalRevenues > 0 ? totalRevenues / calculateUniqueDays(filteredTransactions.filter(transaction => transaction.type === 'income')) : 0;
  const avgExpensePerDay = totalExpenses > 0 ? totalExpenses / calculateUniqueDays(filteredTransactions.filter(transaction => transaction.type === 'expense')) : 0;


  const calculateCategoryTotals = (type) => {
    return categories
      .filter(cat => cat.type === type)
      .map(cat => {
        const totalForCategory = filteredTransactions
          .filter(transaction => transaction.categoryId === cat.id && transaction.type === type)
          .reduce((total, transaction) => total + transaction.amount, 0);

        return {
          ...cat,
          total: totalForCategory,
          percentage: (totalForCategory / (type === 'expense' ? totalExpenses : totalRevenues)) * 100,
        };
      })
      .filter(cat => cat.total > 0);
  };

  const expenseCategories = calculateCategoryTotals('expense');
  const incomeCategories = calculateCategoryTotals('income');


  const generatePDF = async () => {
    const formatCurrency = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

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
            ${categories.map(cat => `
              <tr>
                <td>${cat.name}</td>
                <td>${cat.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td>${cat.percentage.toFixed(2)}%</td>
              </tr>
            `).join('')}
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
            ${transactions.map(transaction => `
              <tr>
                <td>${new Date(transaction.date).toLocaleDateString('pt-BR')}</td>
                <td>${transaction.categoryName}</td>
                <td>${transaction.accountName}</td>
                <td>${formatCurrency(transaction.amount)}</td>
              </tr>
            `).join('')}
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
            ${formatCategory(incomeCategories, 'Receitas por Categoria')}
          </div>
          <div class="section">
            ${formatCategory(expenseCategories, 'Despesas por Categoria')}
          </div>
          <div class="section">
            ${formatTransactions(filteredTransactions.filter(t => t.type === 'income'), 'Receitas')}
          </div>
          <div class="section">
            ${formatTransactions(filteredTransactions.filter(t => t.type === 'expense'), 'Despesas')}
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
                  <td class="${filteredBalance > 0 ? 'positive' : 'negative'}">${formatCurrency(filteredBalance)}</td>
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
      console.error('Erro ao gerar PDF:', error);
    }
  };





  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Exportar Relátorio</Text>

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
            {categories.map(category => (
              <Picker.Item key={category.id} label={category.name} value={category.id} />
            ))}
          </Picker>

          <Text style={styles.filterLabel}>Conta</Text>
          <Picker
            selectedValue={selectedAccount}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedAccount(itemValue)}
          >
            <Picker.Item label="Todas" value="all" />
            {accounts.map(account => (
              <Picker.Item key={account.id} label={account.name} value={account.id} />
            ))}
          </Picker>

          <Text style={styles.filterLabel}>Data de Início</Text>
          <TouchableOpacity onPress={showStartDatePicker}>
            <TextInput
              style={styles.dateInput}
              value={startDate ? startDate.toLocaleDateString() : ''}
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
              value={endDate ? endDate.toLocaleDateString() : ''}
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
            <TouchableOpacity onPress={generatePDF} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Exportar </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={clearFilters} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Limpar Filtros</Text>
            </TouchableOpacity>

          </View>
        </View>
      </View>
    </Modal>
  );
};


export default ExportModal;
