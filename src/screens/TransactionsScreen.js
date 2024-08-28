import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import {
  useRoute,
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";
import { useTransactions } from "../context/TransactionContext";
import { useAccounts } from "../context/AccountContext";
import { useCategories } from "../context/CategoryContext";
import { TransactionsStyles } from "../styles/screens/TransactionsScreenStyles";
import moment from "moment";
import "moment/locale/pt-br";
import EditTransactionModal from "../components/modals/Transactions/EditTransactionModal";
import TransactionDetailsModal from "../components/modals/Transactions/TransactionDetailsModal";
import { Alert } from "react-native";

// FORMATA OS VALORES PARA REAIS(BRL)
const formatCurrency = (value) => {
  const numberValue = parseFloat(value);
  if (isNaN(numberValue)) {
    return "R$ 0,00";
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numberValue);
};
//////////////////////////////////////////////////

const TransactionsScreen = () => {
  const { transactions, removeTransaction } = useTransactions();
  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const route = useRoute();

  const [filterType, setFilterType] = useState(
    route.params?.filterType || undefined
  );
  const [selectedMonth, setSelectedMonth] = useState(moment().startOf("month"));
  const [searchText, setSearchText] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [transactionToEdit, setTransactionToEdit] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [transactionDetailsModalVisible, setTransactionDetailsModalVisible] =
    useState(false);


  const handleEdit = (transaction) => {
    setTransactionToEdit(transaction);
    setEditModalVisible(true);
  };

  // FUNÇÕES PARA PEGAR OS NOMES DAS CONTAS E DAS CATEGORIAS
  const getAccountName = (accountId) => {
    const account = accounts.find((acc) => acc.id === accountId);
    return account ? account.name : "Conta desconhecida";
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Categoria desconhecida";
  };
  //////////////////////////////////////////////////
  // CONTROLE DE FILTROS
  const applyFilter = (transactions) => {
    return transactions.filter((transaction) => {
      const descriptionMatches = transaction.description
        .toLowerCase()
        .includes(searchText.toLowerCase());
      const categoryMatches = getCategoryName(transaction.categoryId)
        .toLowerCase()
        .includes(searchText.toLowerCase());
      const accountMatches = getAccountName(transaction.accountId)
        .toLowerCase()
        .includes(searchText.toLowerCase());

      return (
        moment(transaction.date, "YYYY-MM-DD").isSame(selectedMonth, "month") &&
        (!filterType || transaction.type === filterType) &&
        (descriptionMatches || categoryMatches || accountMatches)
      );
    });
  };

  useFocusEffect(
    useCallback(() => {
      const { filterType: receivedFilter } = route.params || {};
      if (receivedFilter) {
        setFilterType(receivedFilter);
      } else {
        setFilterType(undefined);
      }

      return () => {
        setFilterType(undefined);
      };
    }, [route.params?.filterType])
  );

  const filteredTransactions = applyFilter(transactions).sort((a, b) =>
    moment(a.date).diff(moment(b.date))
  );
  //////////////////////////////////////////////////

  // FUNÇÃO PARA MUDANÇA DE MÊS
  const changeMonth = (direction) => {
    setSelectedMonth((prevMonth) => prevMonth.clone().add(direction, "month"));
  };
  //////////////////////////////////////////////////
  

  // FUNÇÃO PARA CONTAGEM DE PARECLAS
  //////////////////////////////////////////////////

  // FUNÇÕES PARA DELETAR TRANSAÇÕES
  const handleDelete = (transaction) => {
    setCurrentTransaction(transaction);
    setModalVisible(true);
    setModalType(transaction.isRecurring ? "recurring" : "single");
  };

  const removeAllRecurringTransactions = () => {
    const { recurrenceId } = currentTransaction;
    const transactionsToRemove = transactions.filter(
      (transaction) => transaction.recurrenceId === recurrenceId
    );
    transactionsToRemove.forEach((transaction) =>
      removeTransaction(transaction.id)
    );
    setModalVisible(false);
  };

  const removePreviousRecurringTransactions = () => {
    const { recurrenceId, date } = currentTransaction;

    const transactionsToRemove = transactions.filter(
      (transaction) =>
        transaction.recurrenceId === recurrenceId &&
        moment(transaction.date).isBefore(date, "day")
    );
    transactionsToRemove.forEach((transaction) =>
      removeTransaction(transaction.id)
    );
    setModalVisible(false);
  };

  const removeFutureRecurringTransactions = () => {
    const { recurrenceId, date } = currentTransaction;

    const transactionsToRemove = transactions.filter(
      (transaction) =>
        transaction.recurrenceId === recurrenceId &&
        moment(transaction.date).isAfter(date, "day")
    );
    transactionsToRemove.forEach((transaction) =>
      removeTransaction(transaction.id)
    );
    setModalVisible(false);
  };
  const confirmDelete = () => {
    Alert.alert(
      "Confirmar Exclusão",
      "Você tem certeza de que deseja excluir esta transação?",
      [
        {
          text: "Cancelar",
          onPress: () => console.log("Cancelado"),
          style: "cancel",
        },
        {
          text: "Excluir",
          onPress: removeTransactionById,
          style: "destructive",
        },
      ]
    );
  };
  const confirmRemoveAllRecurringTransactions = () => {
    Alert.alert(
      "Confirmar Exclusão",
      "Você tem certeza de que deseja excluir todas as parcelas desta transação recorrente?",
      [
        {
          text: "Cancelar",
          onPress: () => console.log("Cancelado"),
          style: "cancel",
        },
        {
          text: "Excluir",
          onPress: removeAllRecurringTransactions,
          style: "destructive",
        },
      ]
    );
  };

  const confirmRemovePreviousRecurringTransactions = () => {
    Alert.alert(
      "Confirmar Exclusão",
      "Você tem certeza de que deseja excluir todas as parcelas anteriores a esta transação recorrente?",
      [
        {
          text: "Cancelar",
          onPress: () => console.log("Cancelado"),
          style: "cancel",
        },
        {
          text: "Excluir",
          onPress: removePreviousRecurringTransactions,
          style: "destructive",
        },
      ]
    );
  };

  const confirmRemoveFutureRecurringTransactions = () => {
    Alert.alert(
      "Confirmar Exclusão",
      "Você tem certeza de que deseja excluir todas as parcelas futuras desta transação recorrente?",
      [
        {
          text: "Cancelar",
          onPress: () => console.log("Cancelado"),
          style: "cancel",
        },
        {
          text: "Excluir",
          onPress: removeFutureRecurringTransactions,
          style: "destructive",
        },
      ]
    );
  };

  const confirmRemoveCurrentTransaction = () => {
    Alert.alert(
      "Confirmar Exclusão",
      "Você tem certeza de que deseja excluir esta parcela da transação recorrente?",
      [
        {
          text: "Cancelar",
          onPress: () => console.log("Cancelado"),
          style: "cancel",
        },
        {
          text: "Excluir",
          onPress: removeTransactionById,
          style: "destructive",
        },
      ]
    );
  };

  const removeTransactionById = () => {
    if (currentTransaction) {
      const { id } = currentTransaction;
      removeTransaction(id);
      setModalVisible(false);
    } else {
      console.error("Nenhuma transação selecionada para remoção.");
    }
  };

  //////////////////////////////////////////////////

  // FUNÇÃO DE FORMATAÇÃO DE DATA
  const formatDayOfWeek = (date) => {
    return moment(date, "YYYY-MM-DD").format("dddd, DD/MM/YYYY");
  };
  //////////////////////////////////////////////////

  const getCurrentInstallment = (transaction) => {
    if (
      !transaction.isRecurring ||
      !transaction.startDate ||
      !transaction.date ||
      !transaction.recorrenceCount ||
      !transaction.recurrenceType
    ) {
      return '';
    }
  
    const startDate = moment(transaction.startDate, "YYYY-MM-DD");
    const transactionDate = moment(transaction.date, "YYYY-MM-DD");
    const totalInstallments = transaction.recorrenceCount;
  
    let installmentNumber;
  
    // Verifica se a recorrência é mensal
    if (transaction.recurrenceType === 'month') {
      const monthsDifference = transactionDate.diff(startDate, "months");
      if (transactionDate.isSame(startDate, "month")) {
        installmentNumber = monthsDifference + 1;
      } else {
        installmentNumber = monthsDifference + 2;
      }
  
      if (installmentNumber > totalInstallments) {
        installmentNumber = totalInstallments;
      }
  
      return `Parcela ${totalInstallments}`;
  
    // Verifica se a recorrência é semanal
    } else if (transaction.recurrenceType === 'week') {
      return `Parcela  ${totalInstallments}`;
    }
  
    return '';
  };
  
  
  


const handleTransactionPress = (transaction) => {

  
  setCurrentTransaction(transaction);
  setTransactionDetailsModalVisible(true);
};
  
  
  
  
  // RENDERIZAÇÃO DAS TRANSAÇÕES
  const renderItem = ({ item, index }) => {
    const dayOfWeek = formatDayOfWeek(item.date);
    const previousDate =
      index > 0 ? filteredTransactions[index - 1].date : null;
    const isNewDay = previousDate !== item.date;
  
    const recurrenceInfo = getCurrentInstallment(item);
    console.log(item.amount);
    return (
      
      <View>
        {isNewDay && <Text style={TransactionsStyles.dateHeader}>{dayOfWeek}</Text>}
        <TouchableOpacity
          style={[
            TransactionsStyles.item,
            item.type === "expense" ? TransactionsStyles.expenseItem : TransactionsStyles.incomeItem,
          ]}
          // Permite edição ao clicar na transação
          onPress={() => handleTransactionPress(item)}
          onLongPress={() => handleDelete(item)}
        >
          <View>
            <View style={TransactionsStyles.row}>
              <Text style={[TransactionsStyles.description]}>{item.description}</Text>
              <Text style={TransactionsStyles.amount}>{formatCurrency(item.amount)}</Text>
            </View>
            <View style={TransactionsStyles.row}>
              <Text style={TransactionsStyles.category}>
                {getCategoryName(item.categoryId)} | {getAccountName(item.accountId)}
              </Text>
            </View>
            {item.isRecurring && (
              <Text style={TransactionsStyles.installment}>{recurrenceInfo}</Text>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };
  
  {
    /*/////////////////////////////////////////////////////////////////////////////////////////// */
  }

  return (
    
    <View style={TransactionsStyles.container}>
      <View style={TransactionsStyles.footer}>
        <TouchableOpacity
          onPress={() => changeMonth(-1)}
          style={TransactionsStyles.navButton}
        >
          <Text style={TransactionsStyles.navButtonText}>Anterior</Text>
        </TouchableOpacity>
        <Text style={TransactionsStyles.footerTitle}>
          {selectedMonth.format("MMMM YYYY")}
        </Text>
        <TouchableOpacity
          onPress={() => changeMonth(1)}
          style={TransactionsStyles.navButton}
        >
          <Text style={TransactionsStyles.navButtonText}>Próximo</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={TransactionsStyles.searchInput}
        placeholder="Pesquisar por descrição, Conta ou Categoria"
        value={searchText}
        onChangeText={setSearchText}
      />

      <FlatList
        data={filteredTransactions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={TransactionsStyles.listContent}
      />

      

      {/*  MODAL DE EXCLUSÃO DE TRANSAÇÕES  */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={TransactionsStyles.modalContainer}>
          <View style={TransactionsStyles.modalContent}>
            {modalType === "recurring" ? (
              <>
                <Text style={TransactionsStyles.modalTitle}>
                  Excluir transações recorrentes
                </Text>

                <TouchableOpacity
                  onPress={confirmRemoveAllRecurringTransactions}
                  style={TransactionsStyles.modalButton}
                >
                  <Text style={TransactionsStyles.modalButtonText}>Todas as parcelas</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={confirmRemovePreviousRecurringTransactions}
                  style={TransactionsStyles.modalButton}
                >
                  <Text style={TransactionsStyles.modalButtonText}>
                    Parcelas anteriores
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={confirmRemoveFutureRecurringTransactions}
                  style={TransactionsStyles.modalButton}
                >
                  <Text style={TransactionsStyles.modalButtonText}>Parcelas futuras</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={confirmRemoveCurrentTransaction}
                  style={TransactionsStyles.modalButton}
                >
                  <Text style={TransactionsStyles.modalButtonText}>Esta parcela</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={TransactionsStyles.modalTitle}>Gerir transação</Text>

                <TouchableOpacity
                  onPress={() => handleEdit(currentTransaction)}
                  style={TransactionsStyles.modalButton}
                >
                  <Text style={TransactionsStyles.modalButtonText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={confirmDelete}
                  style={TransactionsStyles.modalButton}
                >
                  <Text style={TransactionsStyles.modalButtonText}>Excluir</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={[TransactionsStyles.modalButton, TransactionsStyles.cancelButton]}
            >
              <Text style={TransactionsStyles.modalButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {transactionToEdit && (
        <EditTransactionModal
          isVisible={editModalVisible}
          onClose={() => setEditModalVisible(false)}
          transaction={transactionToEdit || {}} // Passa um objeto vazio se transactionToEdit for undefined
        />
      )}
      <TransactionDetailsModal
        visible={transactionDetailsModalVisible}
        onClose={() => setTransactionDetailsModalVisible(false)}
        transaction={currentTransaction}
      />
      {/*/////////////////////////////////////////////////////////////////////////////////////////// */}
    </View>
  );
};

export default TransactionsScreen;
