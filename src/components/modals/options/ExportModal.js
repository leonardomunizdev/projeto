import React, { useState, useEffect } from 'react';
import { TextInput, TouchableOpacity, StyleSheet, Modal, View, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useCategories } from '../../../context/CategoryContext';
import { useTransactions } from '../../../context/TransactionContext';
import { useAccounts } from '../../../context/AccountContext';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';


const ExportModal = ({ visible, onClose}) => {

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

  const avgRevenuePerDay = quantityRevenues > 0 ? totalRevenues / quantityRevenues : 0;
  const avgExpensePerDay = quantityExpenses > 0 ? totalExpenses / quantityExpenses : 0;

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

  const balanceColor = filteredBalance > 0 
    ? styles.balancePositive 
    : filteredBalance < 0 
    ? styles.balanceNegative 
    : styles.balanceZero;

    const generatePDF = async () => {
      // Supondo que você tenha as variáveis `totalRevenues`, `totalExpenses`, `filteredBalance`, `avgRevenuePerDay`, `avgExpensePerDay`, `expenseCategories`, e `incomeCategories` já definidas.
    
      // Dados de exemplo para receitas por categoria
      const categoryReports = `
        <div class="section">
          <h2>Receitas por Categoria</h2>
          <p><strong>Investimento (100,00%)</strong> 2615,00</p>
          <div class="section">
            <h3>Receitas</h3>
            <p>06 ago., 2024 Investimento(2/5) 950,00</p>
            <p>05 ago., 2024 Investimento 99,00</p>
            <p>05 ago., 2024 Investimento(1/2) 566,00</p>
            <p>05 ago., 2024 Investimento 500,00</p>
            <p>05 ago., 2024 Investimento(1/2) 500,00</p>
          </div>
          <div class="section">
            <h3>Visão Geral</h3>
            <p><strong>Receitas:</strong> 5</p>
            <p><strong>Média (Dia):</strong> 187,00</p>
            <p><strong>Total:</strong> 2.615,00</p>
            <p><strong>Fluxo de Caixa (Receitas - Despesas):</strong> 2.615,00</p>
          </div>
        </div>
      `;
    
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; }
              h1 { text-align: center; }
              h2 { margin-bottom: 10px; }
              h3 { margin-top: 10px; }
              .section { margin: 20px; }
              .balance { font-size: 20px; text-align: right; }
              .positive { color: green; }
              .negative { color: red; }
              .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              .table th, .table td { border: 1px solid #ddd; padding: 8px; }
              .table th { background-color: #f2f2f2; }
              p { margin: 5px 0; }
            </style>
          </head>
          <body>
            <h1>Relatório Financeiro</h1>
            <div class="section">
              <h2>Resumo</h2>
              <p><strong>Total de Receitas:</strong> ${totalRevenues.toFixed(2)}</p>
              <p><strong>Total de Despesas:</strong> ${totalExpenses.toFixed(2)}</p>
              <p><strong>Saldo Filtrado:</strong> <span class="${filteredBalance > 0 ? 'positive' : filteredBalance < 0 ? 'negative' : ''}">
                ${filteredBalance.toFixed(2)}
              </span></p>
              <p><strong>Receitas Diárias Médias:</strong> ${avgRevenuePerDay.toFixed(2)}</p>
              <p><strong>Despesas Diárias Médias:</strong> ${avgExpensePerDay.toFixed(2)}</p>
            </div>
            ${categoryReports}
            <div class="section">
              <h2>Categorias de Despesas</h2>
              <table class="table">
                <thead>
                  <tr>
                    <th>Categoria</th>
                    <th>Total</th>
                    <th>Percentual</th>
                  </tr>
                </thead>
                <tbody>
                  ${expenseCategories.map(cat => `
                    <tr>
                      <td>${cat.name}</td>
                      <td>${cat.total.toFixed(2)}</td>
                      <td>${cat.percentage.toFixed(2)}%</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            <div class="section">
              <h2>Categorias de Receitas</h2>
              <table class="table">
                <thead>
                  <tr>
                    <th>Categoria</th>
                    <th>Total</th>
                    <th>Percentual</th>
                  </tr>
                </thead>
                <tbody>
                  ${incomeCategories.map(cat => `
                    <tr>
                      <td>${cat.name}</td>
                      <td>${cat.total.toFixed(2)}</td>
                      <td>${cat.percentage.toFixed(2)}%</td>
                    </tr>
                  `).join('')}
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
        console.error('Error generating or sharing PDF:', error);
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
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  header: {
    paddingTop: 25,
    fontSize: 35,
    fontWeight: 'bold',
    textAlign: 'center',
    justifyContent: 'center'
  },
  iconButton: {
    padding: 8,
    backgroundColor: 'silver',
    borderRadius: 100,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    backgroundColor: 'silver'
  },
  item: {
    marginBottom: 8,
  },
  categoryItem: {
    fontSize: 16,
    color: '#333',
  },
  noData: {
    fontSize: 16,
    color: '#999',
  },
  transactionItemContainer: {
    marginBottom: 8,
  },
  transactionItem: {
    fontSize: 16,
    color: '#333',
  },
  tableContainer: {
    marginTop: 16,
  },
  table: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tableHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  tableCell: {
    fontSize: 16,
    flex: 1,
  },
  balanceRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  balanceLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 2,
  },
  balancePositive: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'green',
    flex: 1,
    textAlign: 'right',
  },
  balanceNegative: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'red',
    flex: 1,
    textAlign: 'right',
  },
  balanceZero: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  filterLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 16,
  },
  dateInput: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'blue',
    borderRadius: 5,
    marginHorizontal: 5,
    marginBottom: 10,
  },
  modalButtonText: {
    fontSize: 16,
    color: 'white',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
});

export default ExportModal;
