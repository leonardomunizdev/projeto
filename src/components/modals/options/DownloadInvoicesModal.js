import React, { useState, useEffect } from 'react';
import { Modal, View, Text, Button, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useTransactions } from '../../../context/TransactionContext';
import { useCategories } from '../../../context/CategoryContext'; // Importe o contexto de categorias
import { useAccounts } from '../../../context/AccountContext'; // Importe o contexto de contas
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import styles from '../../../styles/screens/StatisticsScreenStyles'; // Importe seus estilos aqui
import { Ionicons } from '@expo/vector-icons';

const DownloadInvoicesModal = ({ visible, onClose }) => {
  const { transactions } = useTransactions();
  const { categories } = useCategories(); // Use o contexto de categorias
  const { accounts } = useAccounts(); // Use o contexto de contas

  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);

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
    return transactions.filter(transaction => {
      const matchType = selectedType === 'all' || transaction.type === selectedType;
      const matchCategory = selectedCategory === 'all' || transaction.categoryId === selectedCategory;
      const matchAccount = selectedAccount === 'all' || transaction.accountId === selectedAccount;
      const matchStartDate = !startDate || new Date(transaction.date) >= startDate;
      const matchEndDate = !endDate || new Date(transaction.date) <= endDate;
      return matchType && matchCategory && matchAccount && matchStartDate && matchEndDate;
    });
  };

  const generatePDFWithInvoices = async () => {
    const filteredTransactions = applyFilters();
    let htmlContent = `
      <h1>Notas Fiscais</h1>
      <p>Aqui estão as notas fiscais exportadas:</p>
      <hr />
      <style>
        img {
          width: 100%;
          max-width: 500px;
          height: auto;
          margin-bottom: 10px;
        }
      </style>
    `;

    for (const transaction of filteredTransactions) {
      htmlContent += `
        <h3>${transaction.description} - ${transaction.date}</h3>`

      if (transaction.attachments && transaction.attachments.length > 0) {
        htmlContent += `<p>Anexos:</p><ul>`;
        for (const attachment of transaction.attachments) {
          try {
            // Converte a imagem para Base64
            const imageBase64 = await FileSystem.readAsStringAsync(attachment, { encoding: FileSystem.EncodingType.Base64 });
            htmlContent += `<li><img src="data:image/png;base64,${imageBase64}" /></li>`;
          } catch (error) {
            console.error(`Erro ao ler o arquivo ${attachment}:`, error);
            htmlContent += `<li>Erro ao carregar imagem.</li>`;
          }
        }
        htmlContent += `</ul>`;
      }
      htmlContent += `<hr />`;
    }

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error('Erro ao gerar o PDF:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
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

          <Text style={styles.modalTitle}>Baixar Notas Fiscais</Text>

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

            <TouchableOpacity onPress={generatePDFWithInvoices} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Exportar NF's</Text>
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

export default DownloadInvoicesModal;
