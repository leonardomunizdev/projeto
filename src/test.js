import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Modal, TextInput, FlatList, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Corrigido para usar Ionicons
import { useAccounts } from '../context/AccountContext';
import { useCategories } from '../context/CategoryContext';
import { useTransactions } from '../context/TransactionContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RFPercentage, RFValue } from 'react-native-responsive-fontsize'; // Importando para ajustar o tamanho da fonte
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const OptionsScreen = () => {
  const [isAccountModalVisible, setIsAccountModalVisible] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isClearDataConfirmVisible, setIsClearDataConfirmVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newAccountName, setNewAccountName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedCategoryType, setSelectedCategoryType] = useState('income');
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState('all'); // Adiciona estado para tipo de transação
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);
  const [filteredBalance, setFilteredBalance] = useState(0);
  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);
  const { transactions } = useTransactions();

  const { accounts, addAccount, removeAccount } = useAccounts();
  const { categories, addCategory, removeCategory } = useCategories();


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

  const handleAddAccount = () => {
    if (newAccountName.trim()) {
      addAccount(newAccountName);
      setNewAccountName('');
    }
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim() && selectedCategoryType) {
      addCategory(newCategoryName, selectedCategoryType);
      setNewCategoryName('');
    }
  };

  const handleRemoveAccount = (id) => {
    setSelectedAccount(id);
    setIsConfirmModalVisible(true);
  };

  const confirmRemoveAccount = () => {
    if (selectedAccount) {
      removeAccount(selectedAccount);
      setSelectedAccount(null);
      setIsConfirmModalVisible(false);
    }
  };

  const cancelRemoveAccount = () => {
    setSelectedAccount(null);
    setIsConfirmModalVisible(false);
  };

  const handleRemoveCategory = (id) => {
    setSelectedCategory(id);
    setIsConfirmModalVisible(true);
  };

  const confirmRemoveCategory = () => {
    if (selectedCategory) {
      removeCategory(selectedCategory);
      setSelectedCategory(null);
      setIsConfirmModalVisible(false);
    }
  };

  const clearAllData = async () => {
    try {
      await AsyncStorage.clear();
      Alert.alert('Dados Limpos', 'Todos os dados foram removidos com sucesso.');
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao tentar limpar os dados.');
      console.error('Failed to clear AsyncStorage', error);
    }
  };

  const confirmClearData = () => {
    setIsClearDataConfirmVisible(true);
  };

  const handleClearData = () => {
    clearAllData();
    setIsClearDataConfirmVisible(false);
  };

  const cancelClearData = () => {
    setIsClearDataConfirmVisible(false);
  };
  const handleExport = async () => {
    try {
      const pdfUri = await generatePdf();  // Gere o PDF
      await sharePdf(pdfUri);  // Compartilhe o PDF
      setIsExportModalVisible(false);
    } catch (error) {
      console.error("Erro ao exportar relatório", error);
      Alert.alert("Erro", "Ocorreu um erro ao tentar exportar o relatório.");
    }
  };

  const sharePdf = async (pdfUri) => {
    try {
      await Sharing.shareAsync(pdfUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Compartilhar PDF',
      });
    } catch (error) {
      console.error("Erro ao compartilhar o PDF", error);
      Alert.alert("Erro", "Ocorreu um erro ao tentar compartilhar o PDF.");
    }
  };
  const generatePdf = async () => {
    const htmlContent = `
    <html>
      <head>
        <style>
          /* Estilos aqui */
          .headerContainer { text-align: center; margin-bottom: 20px; }
          .header { font-size: 24px; font-weight: bold; }
          .sectionContainer { margin: 20px 0; }
          .sectionHeader { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
          .item { margin-bottom: 5px; }
          .categoryItem { font-size: 16px; }
          .noData { color: #999; }
          .table { width: 100%; border-collapse: collapse; }
          .tableRow { border-bottom: 1px solid #ddd; }
          .tableHeader { font-weight: bold; text-align: left; padding: 8px; }
          .tableCell { padding: 8px; }
          .balanceLabel { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="headerContainer">
          <div class="header">Relatório</div>
        </div>
        <!-- Conteúdo do relatório aqui -->
        <!-- Substitua os seguintes exemplos pelos dados reais do seu relatório -->
        <div class="sectionContainer">
          <div class="sectionHeader">Receitas por Categoria</div>
          <div class="item">Categoria A (30.00%) 300.00</div>
          <div class="item">Categoria B (70.00%) 700.00</div>
        </div>
        <div class="sectionContainer">
          <div class="sectionHeader">Despesas por Categoria</div>
          <div class="item">Categoria X (50.00%) 500.00</div>
          <div class="item">Categoria Y (50.00%) 500.00</div>
        </div>
        <div class="sectionContainer">
          <div class="sectionHeader">Receitas</div>
          <div class="item">01/08/2024 / Categoria A / 100.00</div>
        </div>
        <div class="sectionContainer">
          <div class="sectionHeader">Despesas</div>
          <div class="item">01/08/2024 / Categoria X / (50.00)</div>
        </div>
        <div class="sectionContainer">
          <div class="sectionHeader">Visão Geral</div>
          <table class="table">
            <tr class="tableRow">
              <th class="tableHeader">Visão geral</th>
              <th class="tableHeader">Receitas</th>
              <th class="tableHeader">Despesas</th>
            </tr>
            <tr class="tableRow">
              <td class="tableCell">Quantidade</td>
              <td class="tableCell">10</td>
              <td class="tableCell">5</td>
            </tr>
            <tr class="tableRow">
              <td class="tableCell">Total</td>
              <td class="tableCell">1000.00</td>
              <td class="tableCell">500.00</td>
            </tr>
            <tr class="tableRow">
              <td class="tableCell">Média por Dia</td>
              <td class="tableCell">50.00</td>
              <td class="tableCell">25.00</td>
            </tr>
            <tr class="tableRow">
              <td class="tableCell balanceLabel">Fluxo de caixa</td>
              <td class="tableCell balanceLabel" style="color: green;">500.00</td>
            </tr>
          </table>
        </div>
      </body>
    </html>
  `;

    // Gere o PDF
    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    return uri;
  };

  const filteredCategories = categories.filter(category =>
    !selectedCategoryType || category.type === selectedCategoryType
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Text style={styles.title}>Opções</Text>
      <TouchableOpacity style={styles.optionButton} onPress={() => setIsAccountModalVisible(true)}>
        <Ionicons name="wallet" size={RFValue(24)} color="black" />
        <Text style={styles.optionText}>Gerir Contas</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.optionButton} onPress={() => setIsCategoryModalVisible(true)}>
        <Ionicons name="list" size={RFValue(24)} color="black" />
        <Text style={styles.optionText}>Gerir Categorias</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.optionButton}>
        <Ionicons name="download" size={24} color="black" />
        <Text style={styles.optionText}>Baixar Notas Fiscais</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.optionButton}>
        <Ionicons name="folder-open" size={RFValue(24)} color="black" />
        <Text style={styles.optionText}>Importar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.optionButton} onPress={() => setIsExportModalVisible(true)}>
        <Ionicons name="folder" size={RFValue(24)} color="black" />
        <Text style={styles.optionText}>Exportar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.optionButton}>
        <Ionicons name="stats-chart" size={RFValue(24)} color="black" />
        <Text style={styles.optionText}>Gráficos</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.optionButton} onPress={confirmClearData}>
        <Ionicons name="trash" size={RFValue(24)} color="red" />
        <Text style={styles.optionText}>Limpar Todos os Dados</Text>
      </TouchableOpacity>

      {/* Modal de Contas */}
      <Modal
        visible={isAccountModalVisible}
        animationType="slide"
        onRequestClose={() => setIsAccountModalVisible(false)}
        transparent={true}
      >
        <View style={styles.fullScreenModal}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsAccountModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Gerir Contas</Text>
            <TextInput
              style={styles.input}
              value={newAccountName}
              onChangeText={setNewAccountName}
              placeholder="Nome da nova conta"
            />
            <Button title="Adicionar Conta" onPress={handleAddAccount} />
            <FlatList
              data={accounts}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.accountItem}>
                  <Text style={styles.accountName}>{item.name}</Text>
                  <TouchableOpacity onPress={() => handleRemoveAccount(item.id)}>
                    <Text style={styles.removeButton}>Remover</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>


      {/* Modal de Categorias */}
      <Modal
        visible={isCategoryModalVisible}
        animationType="slide"
        onRequestClose={() => setIsCategoryModalVisible(false)}
        transparent={true}
      >
        <View style={styles.fullScreenModal}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsCategoryModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Gerir Categorias</Text>
            <View style={styles.categoryButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  selectedCategoryType === 'income' && styles.incomeButton,
                ]}
                onPress={() => setSelectedCategoryType('income')}
              >
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategoryType === 'income' && styles.incomeButtonText,
                ]}>Receita</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  selectedCategoryType === 'expense' && styles.expenseButton,
                ]}
                onPress={() => setSelectedCategoryType('expense')}
              >
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategoryType === 'expense' && styles.expenseButtonText,
                ]}>Despesa</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholder="Nome da nova categoria"
            />
            <Button title="Adicionar Categoria" onPress={handleAddCategory} />
            <FlatList
              data={filteredCategories}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.categoryItem}>
                  <Text style={styles.categoryName}>{item.name}</Text>
                  <TouchableOpacity onPress={() => handleRemoveCategory(item.id)}>
                    <Text style={styles.removeButton}>Remover</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
      <Modal></Modal>
      {/* Modal de Confirmação */}
      <Modal
        visible={isConfirmModalVisible}
        animationType="slide"
        onRequestClose={cancelRemoveAccount}
        transparent={true}
      >
        <View style={styles.fullScreenModal}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.confirmTitle}>Confirmar Exclusão</Text>
            <Text style={styles.confirmText}>
              Tem certeza que deseja apagar esta {selectedAccount ? 'conta' : 'categoria'}? Todas as movimentações associadas também serão excluídas.
            </Text>
            <View style={styles.buttonContainer}>
              <Button title="Cancelar" onPress={cancelRemoveAccount} />
              <Button title="Excluir" onPress={selectedAccount ? confirmRemoveAccount : confirmRemoveCategory} color="red" />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Confirmação de Limpeza de Dados */}
      <Modal
        visible={isClearDataConfirmVisible}
        animationType="slide"
        onRequestClose={cancelClearData}
        transparent={true}
      >
        <View style={styles.fullScreenModal}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.confirmTitle}>Confirmar Limpeza de Dados</Text>
            <Text style={styles.confirmText}>
              Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.
            </Text>
            <View style={styles.buttonContainer}>
              <Button title="Cancelar" onPress={cancelClearData} />
              <Button title="Limpar" onPress={handleClearData} color="red" />
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={isExportModalVisible}
        animationType="slide"
        onRequestClose={() => setIsExportModalVisible(false)}
        transparent={true}
      >
        <View style={styles.fullScreenModal}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsExportModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>


            <Text style={styles.modalTitle}>Exportar Relatório</Text>
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
                <TouchableOpacity onPress={clearFilters} style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>Limpar Filtros</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={closeModal} style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>Fechar </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <Button
            title="Exportar Agora"
            onPress={handleExport}
          />
        </View>
      
    </Modal>
    </KeyboardAvoidingView >
  );
};


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#f4f4f4',
  },
  title: {
    fontSize: RFPercentage(4), // Ajusta o tamanho da fonte com base no tamanho da tela
    fontWeight: 'bold',
    marginBottom: 45,
    marginTop: 35,
    color: '#333',
    textAlign: 'center',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  optionText: {
    fontSize: RFValue(16), // Ajusta o tamanho da fonte com base no tamanho da tela
    marginLeft: 12,
    color: '#333',
  },
  fullScreenModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '100%', // Use percentuais para responsividade
    height: '100%',
    maxWidth: 600, // Define um máximo para telas grandes
    backgroundColor: 'white',
    padding: 20,
  },
  modalTitle: {
    fontSize: RFValue(24),
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    marginBottom: 16,
    fontSize: RFValue(16),
    color: '#333',
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  accountName: {
    fontSize: RFValue(20),
    color: '#333',
    fontWeight: 'bold',
  },
  removeButton: {
    color: '#e74c3c',
    fontWeight: '500',
  },
  categoryName: {
    fontWeight: 'bold',
    fontSize: RFValue(20),
  },
  categoryButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  incomeButton: {
    backgroundColor: 'blue',
  },
  expenseButton: {
    backgroundColor: 'red',
  },
  categoryButtonText: {
    fontSize: RFValue(16),
    fontWeight: '500',
    color: '#333',
  },
  incomeButtonText: {
    color: 'white',
  },
  expenseButtonText: {
    color: 'white',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  confirmModalContent: {
    width: '90%',
    maxWidth: 600,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  confirmTitle: {
    fontSize: RFValue(22),
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  confirmText: {
    fontSize: RFValue(16),
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
});

export default OptionsScreen;
