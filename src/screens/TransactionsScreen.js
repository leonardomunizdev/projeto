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
import HomeStyles from "../styles/screens/HomeScreenStyles";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { IconButton } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

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
  const navigation = useNavigation();
  const { transactions, removeTransaction } = useTransactions();
  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const route = useRoute();

  const [filterType, setFilterType] = useState(
    route.params?.filterType || undefined
  );
  const [filterAccount, setFilterAccount] = useState(
    route.params?.filterAccount || undefined
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
  const [selectedAccount, setSelectedAccount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const handleFilterSelection = (filterType, value) => {
    setAppliedFilters((prevFilters) => ({
      ...prevFilters,
      [filterType]: value,
    }));
  };
  const removeFilter = (filterType) => {
    setAppliedFilters((prevFilters) => ({
      ...prevFilters,
      [filterType]: null,
    }));
  };

  const toggleModal = () => {
    setFilterModalVisible(false);
  };
  const [appliedFilters, setAppliedFilters] = useState({
    type: filterType,
    account: filterAccount,
    category: null,
  });

  useFocusEffect(
    useCallback(() => {
      const { filterType: receivedFilter, filterAccount: AccountFilter } = route.params || {};

      setAppliedFilters({
        type: receivedFilter,
        account: AccountFilter,
        category: null,
      });

      return () => {
        setAppliedFilters({
          type: undefined,
          account: undefined,
          category: null,
        });
      };
    }, [route.params?.filterType, route.params?.filterAccount])
  );

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
      const categoryFilterMatches =
        !appliedFilters.category ||
        getCategoryName(transaction.categoryId) === appliedFilters.category;
        
      const descriptionMatches = transaction.description
        .toLowerCase()
        .includes(searchText.toLowerCase());
        
      const categoryMatches = getCategoryName(transaction.categoryId)
        .toLowerCase()
        .includes(searchText.toLowerCase());
  
      // Nova lógica de filtragem de contas
      const accountName = getAccountName(transaction.accountId).toLowerCase();
      
      const accountMatches = accountName.includes(searchText.toLowerCase());
      const accountFilterMatches = !appliedFilters.account ||
        (appliedFilters.account.toLowerCase() === accountName ||
          (accountName.includes(appliedFilters.account.toLowerCase()) &&
           searchText.toLowerCase() !== accountName));
      
      return (
        moment(transaction.date, "YYYY-MM-DD").isSame(selectedMonth, "month") &&
        (!appliedFilters.type || transaction.type === appliedFilters.type) &&
        accountFilterMatches &&
        categoryFilterMatches &&
        (descriptionMatches || categoryMatches || accountMatches)
      );
    });
  };
  



  useFocusEffect(
    useCallback(() => {
      const { filterType: receivedFilter, filterAccount: AccountFilter } = route.params || {};

      setFilterType(receivedFilter);
      setFilterAccount(AccountFilter);

      return () => {
        setFilterType(undefined);
        setFilterAccount(undefined);
      };
    }, [route.params?.filterType, route.params?.filterAccount])
  );



  const clearAllFilters = () => {


    setAppliedFilters({
      type: null,
      account: null,
      category: null,
    });
    setSelectedAccount(""); // Resetando o filtro da conta no modal
    setSelectedCategory(""); // Resetando o filtro da categoria no modal
  };


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
    index > 0 ? moment(filteredTransactions[index - 1].date).format("YYYY-MM-DD") : null;
    const currentDate = moment(item.date).format("YYYY-MM-DD");
    const isNewDay = previousDate !== currentDate;

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

    <View style={HomeStyles.container}>

      <View style={HomeStyles.monthYearSelector}>
        <TouchableOpacity
          onPress={() => changeMonth(-1)}
          style={TransactionsStyles.navButton}
        >
          <Icon name="chevron-left" size={24} />
        </TouchableOpacity>
        <Text style={HomeStyles.monthYearText}>
          {selectedMonth.format("MMMM YYYY")}
        </Text>
        <TouchableOpacity
          onPress={() => changeMonth(1)}
          style={TransactionsStyles.navButton}
        >
          <Icon name="chevron-right" size={24} />
        </TouchableOpacity>
      </View>

      <View style={{}}>
        <TextInput
          style={TransactionsStyles.searchInput}
          placeholder="Pesquisar por descrição, Conta ou Categoria"
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity onPress={() => setFilterModalVisible(true)} style={{ position: 'absolute', marginTop: '0.1%', marginLeft: '80%', paddingLeft: '10%' }}>
          <Ionicons name="filter-circle-outline" size={40} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={TransactionsStyles.filtersContainer}>
        {appliedFilters.type && (
          <View style={TransactionsStyles.filterItem}>
            <TouchableOpacity onPress={() => removeFilter('type')} style={TransactionsStyles.removeFilterButton}>
            <Text style={[TransactionsStyles.filterText, { color: 'red' }]}>
              {appliedFilters.type === 'expense' ? 'Despesas' : appliedFilters.type === 'income' ? 'Receitas' : appliedFilters.type}   X
            </Text>
            </TouchableOpacity>
          </View>
        )}

        {appliedFilters.account && (
          <View style={TransactionsStyles.filterItem}>
            <TouchableOpacity onPress={() => removeFilter('account')} style={TransactionsStyles.removeFilterButton}>
            <Text style={TransactionsStyles.filterText}>{appliedFilters.account}  X</Text>
            </TouchableOpacity>
          </View>
        )}

        {appliedFilters.category && (
          <View style={TransactionsStyles.filterItem}>
            <TouchableOpacity onPress={() => removeFilter('category')} style={TransactionsStyles.removeFilterButton}>
            <Text style={TransactionsStyles.filterText}>{appliedFilters.category}   X </Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>


      <FlatList
        data={filteredTransactions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={TransactionsStyles.listContent}
      />




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
      <Modal visible={filterModalVisible} animationType="slide" transparent={true}>
  <View style={TransactionsStyles.filterCurrentModal}>
    <View style={TransactionsStyles.filterContainerModal}>
      <Text style={TransactionsStyles.filterTitleModal}>
        Selecione Filtros
      </Text>

      {/* Type Filter */}
      <Text style={TransactionsStyles.filterSubTitleModal}>
        Tipo
      </Text>
      <View style={TransactionsStyles.filterTypeContainerModal}>
        <TouchableOpacity 
          style={TransactionsStyles.filterButtonExpenseModal} 
          onPress={() => handleFilterSelection("type", "expense")}
        >
          <Text style={TransactionsStyles.filterButtonTextModal}>Despesa</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={TransactionsStyles.filterButtonIncomeModal} 
          onPress={() => handleFilterSelection("type", "income")}
        >
          <Text style={TransactionsStyles.filterButtonTextModal}>Receita</Text>
        </TouchableOpacity>
      </View>

      {/* Account Filter */}
      <Text style={TransactionsStyles.filterSubTitleModal}>
        Conta
      </Text>
      <Picker
        selectedValue={selectedAccount}
        onValueChange={(itemValue) => {
          setSelectedAccount(itemValue);
          handleFilterSelection("account", itemValue);
        }}
        style={TransactionsStyles.filterPickerModal}
      >
        <Picker.Item label="Selecione uma conta" value="" />
        {accounts.map((account) => (
          <Picker.Item key={account.id} label={account.name} value={account.name} />
        ))}
      </Picker>

      {/* Category Filter */}
      <Text style={TransactionsStyles.filterSubTitleModal}>
        Categoria
      </Text>
      <Picker
        selectedValue={selectedCategory}
        onValueChange={(itemValue) => {
          setSelectedCategory(itemValue);
          handleFilterSelection("category", itemValue);
        }}
        style={TransactionsStyles.filterPickerModal}
      >
        <Picker.Item label="Selecione uma categoria" value="" />
        {categories.map((category) => (
          <Picker.Item key={category.id} label={category.name} value={category.name} />
        ))}
      </Picker>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TouchableOpacity 
          onPress={() => setFilterModalVisible(false)} 
          style={TransactionsStyles.filterCloseButtonModal}
        >
          <Text style={TransactionsStyles.filterButtonTextModal}>Fechar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={clearAllFilters}
          style={TransactionsStyles.filterClearButtonModal}
        >
          <Text style={TransactionsStyles.filterButtonTextModal}>Limpar Filtros</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

    </View>
  );
};

export default TransactionsScreen;
