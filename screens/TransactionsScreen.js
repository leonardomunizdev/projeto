import React, { useState, useCallback } from 'react';
import { View, Text, Button, Modal, FlatList, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTransactions } from '../context/TransactionContext';
import { useAccounts } from '../context/AccountContext';
import { useCategories } from '../context/CategoryContext';
import moment from 'moment';
import 'moment/locale/pt-br';

// Função para formatar valores em reais (R$)
const formatCurrency = (value) => {
  const numberValue = parseFloat(value);
  if (isNaN(numberValue)) {
    return 'R$ 0,00'; // Valor padrão em caso de erro
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numberValue);
};

// Função para formatar datas no padrão brasileiro (dd/mm/yyyy)
const formatDate = (date) => {
  return moment(date, 'YYYY-MM-DD').format('DD/MM/YYYY');
};

const TransactionsScreen = () => {
  const { transactions, removeTransaction } = useTransactions();
  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const route = useRoute();
  const navigation = useNavigation();

  const [filterType, setFilterType] = useState(route.params?.filterType || undefined);
  const [selectedMonth, setSelectedMonth] = useState(moment().startOf('month'));

  // Estado para modais
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [currentTransaction, setCurrentTransaction] = useState(null);

  // Função para aplicar o filtro
  const applyFilter = (transactions) => {
    return transactions.filter(transaction =>
      moment(transaction.date, 'YYYY-MM-DD').isSame(selectedMonth, 'month') &&
      (!filterType || transaction.type === filterType)
    );
  };

  // Função para limpar o filtro
  const clearFilter = () => {
    setFilterType(undefined);
  };

  // Atualiza o filtro e mês selecionado quando a tela ganhar foco
  useFocusEffect(
    useCallback(() => {
      const { filterType: receivedFilter } = route.params || {};
      if (receivedFilter) {
        setFilterType(receivedFilter);
      } else {
        clearFilter();
      }

      // Retorna uma função para limpar o filtro ao sair da tela
      return () => {
        clearFilter();
      };
    }, [route.params?.filterType])
  );

  // Filtra transações para o mês selecionado e com base no tipo de filtro
  const filteredTransactions = applyFilter(transactions);

  // Função para mudar o mês
  const changeMonth = (direction) => {
    setSelectedMonth(prevMonth => prevMonth.clone().add(direction, 'month'));
  };

  // Função para calcular a parcela atual de uma transação recorrente
  const getCurrentInstallment = (transaction) => {
    if (!transaction.isRecurring || !transaction.startDate || !transaction.totalInstallments) {
      return '';
    }
  
    const startDate = moment(transaction.startDate, 'YYYY-MM-DD');
    const transactionDate = moment(transaction.date, 'YYYY-MM-DD');
    const totalInstallments = transaction.totalInstallments;
  
    // Calcular o número de parcelas
    const monthsDifference = transactionDate.diff(startDate, 'months') + 1;
    const installmentNumber = Math.min(monthsDifference, totalInstallments);
  
    return `Parcela ${installmentNumber} de ${totalInstallments}`;
  };

  // Função para obter o nome da conta com base no ID
  const getAccountName = (accountId) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account ? account.name : 'Conta desconhecida';
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Categoria desconhecida';
  };

  const handleDelete = (id, isRecurring, date, recurrenceId) => {
    setCurrentTransaction({ id, isRecurring, date, recurrenceId });
    setModalVisible(true);
    setModalType(isRecurring ? 'recurring' : 'single');
  };

  const removeAllRecurringTransactions = () => {
    const { recurrenceId } = currentTransaction;
    const transactionsToRemove = transactions.filter(transaction => transaction.recurrenceId === recurrenceId);
    console.log('Transações a remover (todas):', transactionsToRemove);
    transactionsToRemove.forEach(transaction => removeTransaction(transaction.id));
    setModalVisible(false);
  };

  const removePreviousRecurringTransactions = () => {
    const { recurrenceId, date } = currentTransaction;
    if (!isValidDate(date)) {
      console.error('Data da transação inválida:', date);
      return;
    }
  
    const transactionsToRemove = transactions.filter(transaction => 
      transaction.recurrenceId === recurrenceId && moment(transaction.date).isBefore(date, 'day')
    );
    console.log('Transações a remover (anteriores):', transactionsToRemove);
    transactionsToRemove.forEach(transaction => removeTransaction(transaction.id));
    setModalVisible(false);
  };

  const removeFutureRecurringTransactions = () => {
    const { recurrenceId, date } = currentTransaction;
    if (!isValidDate(date)) {
      console.error('Data da transação inválida:', date);
      return;
    }
  
    const transactionsToRemove = transactions.filter(transaction => 
      transaction.recurrenceId === recurrenceId && moment(transaction.date).isAfter(date, 'day')
    );
    console.log('Transações a remover (posteriores):', transactionsToRemove);
    transactionsToRemove.forEach(transaction => removeTransaction(transaction.id));
    setModalVisible(false);
  };

  const removeTransactionById = () => {
    const { id } = currentTransaction;
    removeTransaction(id);
    setModalVisible(false);
  };

  const isValidDate = (date) => moment(date, 'YYYY-MM-DD', true).isValid();

  const renderItem = ({ item }) => (
    <View style={[styles.item, item.type === 'expense' ? styles.expenseItem : styles.incomeItem]}>
      <Text style={[styles.description, item.type === 'expense' ? styles.expenseText : styles.incomeText]}>
        {item.description}
      </Text>
      <Text style={[styles.amount, item.type === 'expense' ? styles.expenseAmount : styles.incomeAmount]}>
        {formatCurrency(item.amount)}
      </Text>
      <Text style={[styles.date, item.type === 'expense' ? styles.expenseText : styles.incomeText]}>
        {formatDate(item.date)}
      </Text>
      <Text style={[styles.category, item.type === 'expense' ? styles.expenseText : styles.incomeText]}>
        Categoria: {getCategoryName(item.categoryId)}
      </Text>
      <Text style={[styles.account, item.type === 'expense' ? styles.expenseText : styles.incomeText]}>
        Conta: {getAccountName(item.accountId)}
      </Text>
      {item.isRecurring && (
        <Text style={[styles.installment, item.type === 'expense' ? styles.expenseText : styles.incomeText]}>
          {getCurrentInstallment(item)}
        </Text>
      )}
      <TouchableOpacity onPress={() => handleDelete(item.id, item.isRecurring, item.date, item.recurrenceId)} style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>Excluir</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredTransactions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
      />
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navButton}>
          <Text style={styles.navButtonText}>Anterior</Text>
        </TouchableOpacity>
        <Text style={styles.footerTitle}>
          {selectedMonth.format('MMMM YYYY')}
        </Text>
        <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navButton}>
          <Text style={styles.navButtonText}>Próximo</Text>
        </TouchableOpacity>
      </View>
      
      {/* Modal de Exclusão */}
      <Modal
  transparent={true}
  animationType="slide"
  visible={modalVisible}
  onRequestClose={() => setModalVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>
        {modalType === 'recurring' ? 'Confirmar exclusão' : 'Confirmar exclusão'}
      </Text>
      <Text style={styles.modalMessage}>
        {modalType === 'recurring' 
          ? 'Esta transação é recorrente. O que você deseja fazer?' 
          : 'Você realmente deseja excluir esta transação?'}
      </Text>
      {modalType === 'recurring' && (
        <View style={styles.modalOptions}>
          <Pressable style={[styles.modalButton, styles.optionButton]} onPress={removeAllRecurringTransactions}>
            <Text style={styles.optionButtonText}>Excluir todas as parcelas</Text>
          </Pressable>
          <Pressable style={[styles.modalButton, styles.optionButton]} onPress={removePreviousRecurringTransactions}>
            <Text style={styles.optionButtonText}>Excluir parcelas anteriores</Text>
          </Pressable>
          <Pressable style={[styles.modalButton, styles.optionButton]} onPress={removeFutureRecurringTransactions}>
            <Text style={styles.optionButtonText}>Excluir parcelas futuras</Text>
          </Pressable>
        </View>
      )}
      <Pressable style={[styles.modalButton, styles.deleteButton]} onPress={removeTransactionById}>
        <Text style={styles.deleteButtonText}>Excluir</Text>
      </Pressable>
      <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </Pressable>
    </View>
  </View>
</Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  // Adicione estilos para o modal aqui
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalMessage: {
    fontSize: 16,
    marginVertical: 10,
  },
  modalOptions: {
    marginVertical: 10,
  },
  deleteButton: {
    marginTop: 10,
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: 'white',
  },
  // Outros estilos
  container: {
    flex: 1,
    padding: 16,
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  description: {
    fontSize: 16,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
    color: '#555',
  },
  category: {
    fontSize: 14,
    color: '#555',
  },
  account: {
    fontSize: 14,
    color: '#555',
  },
  installment: {
    fontSize: 14,
    color: '#555',
  },
  expenseItem: {
    backgroundColor: '#ffe6e6',
  },
  incomeItem: {
    backgroundColor: '#e6ffe6',
  },
  expenseText: {
    color: '#cc0000',
  },
  incomeText: {
    color: '#009900',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  navButton: {
    padding: 10,
  },
  navButtonText: {
    fontSize: 16,
    color: 'blue',
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },


    // Estilo para o container do modal
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.3)', // Fundo semi-transparente
    },
    // Estilo para o conteúdo do modal
    modalContent: {
      width: '90%',
      maxWidth: 400,
      padding: 20,
      backgroundColor: '#ffffff',
      borderRadius: 15,
      shadowColor: '#000', // Sombra do modal
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 10, // Sombra para Android
      alignItems: 'center',
    },
    // Estilo para o título do modal
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#333', // Cor do texto
      marginBottom: 10,
    },
    // Estilo para a mensagem do modal
    modalMessage: {
      fontSize: 16,
      color: '#666',
      marginBottom: 20,
      textAlign: 'center',
    },
    // Estilo para o container das opções no modal
    modalOptions: {
      width: '100%',
      marginBottom: 20,
    },
    // Estilo para os botões do modal
    modalButton: {
      width: '100%',
      padding: 15,
      borderRadius: 10,
      marginVertical: 5,
      justifyContent: 'center',
      alignItems: 'center',
    },
    // Estilo para o botão de excluir
    deleteButton: {
      backgroundColor: '#ff4d4d', // Cor vermelha para exclusão
    },
    deleteButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    // Estilo para o botão de cancelar
    cancelButton: {
      backgroundColor: '#ccc', // Cor cinza para cancelar
    },
    cancelButtonText: {
      color: '#333',
      fontWeight: 'bold',
    },
    // Estilo para o botão de opção
    optionButton: {
      backgroundColor: '#007bff', // Cor azul para opções
    },
    optionButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    // Estilo para o modal interno
    modalInnerContent: {
      width: '100%',
    },
  });


export default TransactionsScreen;
