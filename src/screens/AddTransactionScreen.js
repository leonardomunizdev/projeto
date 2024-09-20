import React, { useState, useEffect } from "react";
import {
  Image,
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format, addMonths, addWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Switch } from "react-native-elements";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTransactions } from "../context/TransactionContext";
import { useAccounts } from "../context/AccountContext";
import { useCategories } from "../context/CategoryContext";
import UUID from "react-native-uuid";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons } from "@expo/vector-icons";
import addTransactionsStyles from "../styles/screens/addTransactionsScreenStyles";
import AccountModal from "../components/modals/options/AccountModal";
import CategoryModal from "../components/modals/options/CategoryModal";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
export const getButtonColor = (type) => {
  return type === "expense" ? "red" : "blue";
};

const AddTransactionScreen = () => {
  const navigation = useNavigation();
  const { addTransaction } = useTransactions();
  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const { transactions } = useTransactions();
  const [accountValues, setAccountValues] = useState({});
  const [transactionType, setTransactionType] = useState("expense");

  const [amount, setAmount] = useState("0,00");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [expenseCategory, setExpenseCategory] = useState("");
  const [incomeCategory, setIncomeCategory] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("Selecione uma conta");
  const [selectedCategory, setSelectedCategory] = useState(
    "Selecione uma categoria"
  );
  const [accountName, setAccountName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [isCredit, setIsCredit] = useState(false);
  const [recurrence, setRecurrence] = useState({ count: "", unit: "month" });
  const [recurrenceInfo, setRecurrenceInfo] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showRecurrenceModal, setShowRecurrenceModal] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isAccountModalVisible, setIsAccountModalVisible] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedCategoryType, setSelectedCategoryType] = useState("expense");
  const route = useRoute();
  const { activateSwitch } = route.params || {};
  const { selectedType } = route.params || {};

  useEffect(() => {
    if (activateSwitch !== undefined) {
      setIsCredit(activateSwitch);
      setTransactionType("expense");
      navigation.navigate("AddTransactionScreen", { transactionType: "expense" });

    }
  }, [activateSwitch]);

  const toggleSwitch = () => {
    setIsCredit((previousValue) => !previousValue);
  };

  useEffect(() => {
    if (route.params?.handleSaveAndNavigate) {
      handleSaveAndNavigate();
    }
  }, [route.params]);

  useEffect(() => {
    if (route.params?.selectedType) {
      setSelectedCategoryType(selectedType);
    }
  }, [route.params]);

  useEffect(() => {
    if (route.params?.imageUri) {
      setAttachments([route.params.imageUri]);
    }
  }, [route.params?.imageUri]);

  useEffect(() => {
    if (route.params?.accountId) {
      const selectedAccountId = route.params.accountId;
      const account = accounts.find((acc) => acc.id === selectedAccountId);
      if (account) {
        setSelectedAccount(account.id);
        setAccountName(account.name);
      }
    }
  }, [route.params?.accountId, accounts]);

  useEffect(() => {
    setShowRecurrenceModal(isRecurring);
  }, [isRecurring]);

  const generateRecurringTransactions = (transaction, recurrenceId) => {
    const transactions = [];
    let nextDate = new Date(date); // Data inicial
    let currentRecurrenceCount = 1; // Inicia o contador de recorrência

    for (let i = 0; i < recurrence.count; i++) {
      transactions.push({
        ...transaction,
        id: UUID.v4(),
        recurrenceId,
        date: format(nextDate, "yyyy-MM-dd", { locale: ptBR }),
        isRecurring,
        recorrenceCount: `${currentRecurrenceCount} de ${recurrence.count}`,
      });

      if (recurrence.unit === "month") {
        nextDate = addMonths(nextDate, 1);
      } else if (recurrence.unit === "week") {
        nextDate = addWeeks(nextDate, 1);
      }

      currentRecurrenceCount += 1; // Incrementa o contador de recorrência
    }

    return transactions;
  };
  const calculateUsedLimit = (accountId) => {
    const creditTransactions = transactions.filter(
      (transaction) => transaction.accountId === accountId && transaction.type === "expense"
    );
    const usedLimit = creditTransactions.reduce((acc, transaction) => acc + transaction.amount, 0);
    return usedLimit;
  };

  const handleSaveAndNavigate = async () => {
    if (!description || !amount || !selectedAccount || !selectedCategory) {
      Alert.alert("Erro", "Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const amountParsed = parseFloat(convertToAmerican(amount));
    if (isNaN(amountParsed) || amountParsed <= 0) {
      Alert.alert("Erro", "O valor deve ser um número positivo.");
      console.log(amount);
      return;
    }

    // Verificação do limite do cartão de crédito
    const selectedAccountData = accounts.find(account => account.id === selectedAccount);
    if (selectedAccountData && selectedAccountData.type === 'Credito') {
      const limit = selectedAccountData.initialBalance;
      const usedLimit = calculateUsedLimit(selectedAccountData.id);  // Usar a função para calcular o limite usado
      console.log("Limite usado: ", usedLimit);
      if (amountParsed > (limit - usedLimit)) {
        Alert.alert("Erro", "Não há limite suficiente no cartão de crédito para essa transação.");
        return;
      }
    }


    const recurrenceId = UUID.v4();
    const baseTransaction = {
      id: UUID.v4(),
      type: transactionType,
      description,
      amount: amountParsed,
      date: format(date, "yyyy-MM-dd", { locale: ptBR }),
      startDate: date,
      accountId: selectedAccount,
      accountName,
      categoryId:
        transactionType === "expense" ? expenseCategory : incomeCategory,
      categoryName,
      isRecurring,
      recurrenceId,
      attachments,
      recorrenceCount: isRecurring ? recurrence.count : null,
      recurrenceType: isRecurring ? recurrence.unit : null,
    };

    const transactions = isRecurring
      ? generateRecurringTransactions(baseTransaction, recurrenceId)
      : [baseTransaction];

    transactions.forEach((transaction) => {
      addTransaction(transaction);
    });

    try {
      await AsyncStorage.setItem("lastTransactionType", transactionType);
    } catch (error) {
      console.error("Failed to save last transaction type", error);
    }

    // Resetar todos os campos
    setAmount("");
    setDescription("");
    setDate(new Date());
    setExpenseCategory(""); // Limpar a categoria de despesa
    setIncomeCategory(""); // Limpar a categoria de receita
    setSelectedAccount(""); // Limpar a conta selecionada
    setAccountName("");
    setSelectedCategory(""); // Limpar a categoria selecionada
    setIsRecurring(false);
    setRecurrence({ count: "", unit: "month" });
    setRecurrenceInfo("");
    setAttachments([]);
  };


  useEffect(() => {
    const loadLastTransactionType = async () => {
      try {
        const lastType = await AsyncStorage.getItem("lastTransactionType");
        if (lastType) {
          setTransactionType(lastType);
        }
      } catch (error) {
        console.error("Failed to load last transaction type", error);
      }
    };

    loadLastTransactionType();
  }, []);

  const handleIncrement = () => {
    setRecurrence((prevRecurrence) => ({
      ...prevRecurrence,
      count: (parseInt(prevRecurrence.count, 10) || 0) + 1,
    }));
  };

  const handleDecrement = () => {
    setRecurrence((prevRecurrence) => ({
      ...prevRecurrence,
      count: Math.max((parseInt(prevRecurrence.count, 10) || 0) - 1, 0),
    }));
  };

  const handleRecurrenceCountChange = (text) => {
    const parsedValue = parseInt(text, 10);
    if (!isNaN(parsedValue) && parsedValue > 0) {
      setRecurrence((prevRecurrence) => ({
        ...prevRecurrence,
        count: parsedValue,
      }));
    } else {
      setRecurrence((prevRecurrence) => ({ ...prevRecurrence, count: "" }));
    }
  };

  const handleTransactionTypeChange = async (type) => {
    setTransactionType(type);
    setExpenseCategory("");
    setIncomeCategory("");
    if (type === "income") {
      setIsCredit(false);
      setExpenseCategory("");
      setIncomeCategory("");
    }
    // Salvar o tipo de transação no AsyncStorage
    try {
      await AsyncStorage.setItem("lastTransactionType", type);
    } catch (error) {
      console.error("Failed to save last transaction type", error);
    }

    navigation.navigate("AddTransactionScreen", { transactionType: type });
  };

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === "ios");
    setDate(currentDate);
  };

  const handleAccountChange = (itemValue) => {
    setSelectedAccount(itemValue);
    const account = accounts.find((acc) => acc.id === itemValue);
    setAccountName(account ? account.name : "");
  };

  const handleValueChange = (itemValue) => {
    if (transactionType === "expense") {
      setExpenseCategory(itemValue);
      handleCategoryChange(itemValue);
    } else {
      setIncomeCategory(itemValue);
      handleCategoryChange(itemValue);
    }
  };

  const handleCategoryChange = (itemValue) => {
    setSelectedCategory(itemValue);
    const category = categories.find((cat) => cat.id === itemValue);
    setCategoryName(category ? category.name : "");
  };

  const filteredCategories = categories.filter(
    (cat) => cat.type === transactionType
  );

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result); // Adicione isto para verificar o retorno

    if (!result.canceled) {
      setAttachments([...attachments, result.assets[0].uri]);
    }
  };

  const renderAttachments = () => {
    return attachments.map((attachment, index) => (
      <View key={index} style={addTransactionsStyles.attachmentItem}>
        <Image
          source={{ uri: attachment }}
          style={addTransactionsStyles.attachmentImage}
          onError={(error) => console.log("Image failed to load", error)}
        />
        <MaterialIcons
          name="delete"
          size={24}
          color="red"
          onPress={() => {
            const updatedAttachments = [...attachments];
            updatedAttachments.splice(index, 1);
            setAttachments(updatedAttachments);
          }}
        />
      </View>
    ));
  };

  const formatValue = (value) => {
    // Remove caracteres não numéricos
    value = value.replace(/\D/g, "");

    // Certifique-se de que o valor tenha no mínimo 3 dígitos
    value = value.padStart(3, "0");

    // Separa a parte inteira da parte decimal
    const integerPart = value.slice(0, -2);
    const decimalPart = value.slice(-2);

    // Formata a parte inteira com pontos de milhar
    const formattedInteger = integerPart
      .split("")
      .reverse()
      .reduce((acc, digit, index) => {
        return digit + (index && index % 3 === 0 ? "." : "") + acc;
      }, "");

    // Combina a parte inteira e a parte decimal
    return `${formattedInteger},${decimalPart}`;
  };

  const handleChange = (text) => {
    const formattedValue = formatValue(text);
    const cleanedValue = formattedValue.replace(/^0+(?!,)/, "");
    setAmount(cleanedValue);
  };

  const convertToAmerican = (value) => {
    // Remove caracteres não numéricos
    value = value.replace(/\D/g, "");

    // Adiciona zeros à esquerda, se necessário
    value = value.padStart(3, "0");

    // Adiciona pontos e vírgulas conforme necessário
    const integerPart = value.slice(0, -2); // Parte inteira
    const decimalPart = value.slice(-2); // Parte decimal

    // Combina a parte inteira e a parte decimal para o formato americano
    return `${integerPart}.${decimalPart}`;
  };

  const getButtonColor = () => {
    return transactionType === "expense" ? "red" : "blue";
  };
  const getButtonStyle = (type) => ({
    ...addTransactionsStyles.transactionButton,
    backgroundColor:
      transactionType === type ? (type === "expense" ? "red" : "blue") : "#ddd",
  });
  const getButtonRecurringStyle = (type) => ({
    ...addTransactionsStyles.transactionButton,
    backgroundColor: recurrence.unit === type ? getButtonColor() : "#CCCCCC",
  });
  const getStyleButtons = () => ({
    backgroundColor: getButtonColor(),
    padding: 10,
    margin: 5,
    borderRadius: 5,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
    color: "white",
    switchThumbColor: "red",
  });

  return (
    <KeyboardAvoidingView style={addTransactionsStyles.container}>
      <ScrollView
        contentContainerStyle={addTransactionsStyles.scrollViewContent}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={addTransactionsStyles.formContainer}>
            <Text style={addTransactionsStyles.title}>Adicionar Transação</Text>

            <View style={addTransactionsStyles.transactionTypeContainer}>
              <TouchableOpacity
                style={getButtonStyle("income")}
                onPress={() => handleTransactionTypeChange("income")}
              >
                <Text style={addTransactionsStyles.transactionButtonText}>
                  Receita
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={getButtonStyle("expense")}
                onPress={() => handleTransactionTypeChange("expense")}
              >
                <Text style={addTransactionsStyles.transactionButtonText}>
                  Despesa
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={addTransactionsStyles.input}
              placeholder="Descrição"
              value={description}
              onChangeText={setDescription}
            />
            <TextInput
              style={addTransactionsStyles.input}
              placeholder="Valor"
              keyboardType="numeric"
              value={amount}
              onChangeText={handleChange}
            />
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <TextInput
                style={[getStyleButtons()]}
                placeholder="Data"
                value={format(date, "dd/MM/yyyy", { locale: ptBR })}
                editable={false}
                pointerEvents="none"
              />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode="date"
                display="default"
                onChange={onChange}
              />
            )}

            {transactionType === "expense" && (
              <View style={addTransactionsStyles.switchContainer}>
                <Text style={addTransactionsStyles.switchText}>
                  Cartão de Credito
                </Text>
                <Switch
                  value={isCredit}
                  onValueChange={toggleSwitch}
                  trackColor={{ false: "silver", true: getButtonColor() }}
                  thumbColor={isCredit ? getButtonColor() : "silver"}
                />
              </View>
            )}

            {!isCredit && (
              <View style={addTransactionsStyles.pickerContainer}>
                <Picker
                  selectedValue={selectedAccount}
                  onValueChange={handleAccountChange}
                  style={addTransactionsStyles.picker}
                >
                  <Picker.Item label="Selecione uma conta" value="" />
                  {accounts
                    .filter((account) => account.type === "Debito")
                    .map((account) => (
                      <Picker.Item
                        key={account.id}
                        label={account.name}
                        value={account.id}
                      />
                    ))}
                </Picker>
                <TouchableOpacity
                  onPress={() => setIsAccountModalVisible(true)}
                  style={addTransactionsStyles.addButton}
                >
                  <MaterialIcons
                    name="add"
                    size={24}
                    style={[{ color: getButtonColor(), padding: 10 }]}
                  />
                </TouchableOpacity>
              </View>
            )}
            {isCredit && (
              <View style={addTransactionsStyles.pickerContainer}>
                <Picker
                  selectedValue={selectedAccount}
                  onValueChange={handleAccountChange}
                  style={addTransactionsStyles.picker}
                >
                  <Picker.Item label="Selecione uma conta" value="" />
                  {accounts
                    .filter((account) => account.type === "Credito")
                    .map((account) => (
                      <Picker.Item
                        key={account.id}
                        label={account.name}
                        value={account.id}
                      />
                    ))}
                </Picker>
                <TouchableOpacity
                  onPress={() => setIsAccountModalVisible(true)}
                  style={addTransactionsStyles.addButton}
                >
                  <MaterialIcons
                    name="add"
                    size={24}
                    style={[{ color: getButtonColor(), padding: 10 }]}
                  />
                </TouchableOpacity>
              </View>
            )}
            <View style={addTransactionsStyles.pickerContainer}>
              <Picker
                selectedValue={selectedCategory}
                onValueChange={handleValueChange}
                style={addTransactionsStyles.picker}
              >
                <Picker.Item label="Selecione uma categoria" value="" />
                {filteredCategories.map((category) => (
                  <Picker.Item
                    key={category.id}
                    label={category.name}
                    value={category.id}
                  />
                ))}
              </Picker>
              <TouchableOpacity
                onPress={() => setIsCategoryModalVisible(true)}
                style={addTransactionsStyles.addButton}
              >
                <MaterialIcons
                  name="add"
                  size={24}
                  style={[{ color: getButtonColor(), padding: 10 }]}
                />
              </TouchableOpacity>
            </View>

            <View style={addTransactionsStyles.switchContainer}>
              <Text style={addTransactionsStyles.switchText}>Repetir</Text>
              <Switch
                value={isRecurring}
                onValueChange={(value) => setIsRecurring(value)}
                trackColor={{ false: "silver", true: getButtonColor() }}
                thumbColor={isRecurring ? getButtonColor() : "silver"}
              />
            </View>

            {isRecurring && (
              <View style={addTransactionsStyles.recurrenceContainer}>
                <View style={addTransactionsStyles.recurrenceLabelContainer}>
                  <View style={addTransactionsStyles.recurrenceControls}>
                    <TouchableOpacity
                      style={addTransactionsStyles.recurrenceButton}
                      onPress={handleDecrement}
                    >
                      <Ionicons name={"chevron-down-outline"} />
                    </TouchableOpacity>

                    <TextInput
                      style={addTransactionsStyles.recurrenceInput}
                      placeholder="0"
                      value={recurrence.count.toString()}
                      keyboardType="numeric"
                      onChangeText={handleRecurrenceCountChange}
                    />

                    <TouchableOpacity
                      style={addTransactionsStyles.recurrenceButton}
                      onPress={handleIncrement}
                    >
                      <Ionicons name={"chevron-up-outline"} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={addTransactionsStyles.recurrenceButtonContainer}>

                  <TouchableOpacity
                    style={[getButtonRecurringStyle("week")]}
                    onPress={() =>
                      setRecurrence((prevRecurrence) => ({
                        ...prevRecurrence,
                        unit: "week",
                      }))
                    }
                  >
                    <Text style={addTransactionsStyles.recurrenceButtonText}>
                      Diario
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[getButtonRecurringStyle("week")]}
                    onPress={() =>
                      setRecurrence((prevRecurrence) => ({
                        ...prevRecurrence,
                        unit: "week",
                      }))
                    }
                  >
                    <Text style={addTransactionsStyles.recurrenceButtonText}>
                      Semanal
                    </Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={[getButtonRecurringStyle("month")]}
                  onPress={() =>
                    setRecurrence((prevRecurrence) => ({
                      ...prevRecurrence,
                      unit: "month",
                    }))
                  }
                >
                  <Text style={addTransactionsStyles.recurrenceButtonText}>
                    Mensal
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={addTransactionsStyles.switchContainer}>
              <Text style={addTransactionsStyles.switchText}>
                Agendar
              </Text>
              <Switch
                value={isCredit}
                onValueChange={toggleSwitch}
                trackColor={{ false: "silver", true: getButtonColor() }}
                thumbColor={isCredit ? getButtonColor() : "silver"}
              />
            </View>
            <View style={addTransactionsStyles.attachmentContainer}>
              <TouchableOpacity onPress={pickImage} style={[getStyleButtons()]}>
                <Text style={addTransactionsStyles.addAttachmentButtonText}>
                  Adicionar Anexo
                </Text>
              </TouchableOpacity>
              <View style={addTransactionsStyles.attachmentList}>
                {renderAttachments()}
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
        <View>
          <AccountModal
            visible={isAccountModalVisible}
            onClose={() => setIsAccountModalVisible(false)}
            newAccountName={newAccountName}
            setNewAccountName={setNewAccountName}
          />
          <CategoryModal
            visible={isCategoryModalVisible}
            onClose={() => setIsCategoryModalVisible(false)}
            newCategoryName={newCategoryName}
            setNewCategoryName={setNewCategoryName}
            selectedCategoryType={selectedCategoryType}
            setSelectedCategoryType={setSelectedCategoryType}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Estilos para o componente AddTransactionScreen

export default AddTransactionScreen;
