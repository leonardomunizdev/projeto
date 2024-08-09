// Importe os módulos necessários do React Native
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
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format, addMonths, addWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Switch } from "react-native-elements";
import { useNavigation } from "@react-navigation/native";
import { useTransactions } from "../context/TransactionContext";
import { useAccounts } from "../context/AccountContext";
import { useCategories } from "../context/CategoryContext";
import UUID from "react-native-uuid";
import * as ImagePicker from "expo-image-picker";
import * as Sharing from "expo-sharing";
import { MaterialIcons } from "@expo/vector-icons";

// Definição do componente AddTransactionScreen
const AddTransactionScreen = () => {
  const navigation = useNavigation();
  const { addTransaction } = useTransactions();
  const { accounts } = useAccounts();
  const { categories } = useCategories();

  const [transactionType, setTransactionType] = useState("income");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [expenseCategory, setExpenseCategory] = useState("");
  const [incomeCategory, setIncomeCategory] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [accountName, setAccountName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrence, setRecurrence] = useState({ count: "", unit: "month" });
  const [recurrenceInfo, setRecurrenceInfo] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showRecurrenceModal, setShowRecurrenceModal] = useState(false);
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    setShowRecurrenceModal(isRecurring);
  }, [isRecurring]);

  const generateRecurringTransactions = (transaction, recurrenceId) => {
    const transactions = [];
    let nextDate = new Date(date);

    for (let i = 0; i < recurrence.count; i++) {
      transactions.push({
        ...transaction,
        id: UUID.v4(),
        recurrenceId,
        date: format(nextDate, "yyyy-MM-dd", { locale: ptBR }),
        isRecurring,
      });

      if (recurrence.unit === "month") {
        nextDate = addMonths(nextDate, 1);
      } else if (recurrence.unit === "week") {
        nextDate = addWeeks(nextDate, 1);
      }
    }

    return transactions;
  };

  const handleSave = () => {
    if (isNaN(recurrence.count) || recurrence.count <= 0) {
      Alert.alert(
        "Erro",
        "Quantidade de períodos deve ser um número positivo."
      );
      return;
    }

    const unitText = recurrence.unit === "month" ? "meses" : "semanas";
    setRecurrenceInfo(`Repetir por ${recurrence.count} ${unitText}`);
    setShowRecurrenceModal(false);
  };

  const handleSaveAndNavigate = () => {
    if (!description || !amount || !selectedAccount) {
      Alert.alert("Erro", "Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert("Erro", "O valor deve ser um número positivo.");
      return;
    }

    const recurrenceId = UUID.v4();
    const baseTransaction = {
      id: UUID.v4(),
      type: transactionType,
      description,
      amount: parseFloat(amount),
      date: format(date, "yyyy-MM-dd", { locale: ptBR }),
      startDate: date,
      accountId: selectedAccount,
      accountName,
      categoryId:
        transactionType === "expense" ? expenseCategory : incomeCategory,
      categoryName,
      isRecurring,
      recurrenceId,
    };

    const transactions = isRecurring
      ? generateRecurringTransactions(baseTransaction, recurrenceId)
      : [baseTransaction];

    transactions.forEach((transaction) => {
      addTransaction(transaction);
    });

    setTransactionType("expense");
    setAmount("");
    setDescription("");
    setDate(new Date());
    setExpenseCategory("");
    setIncomeCategory("");
    setSelectedAccount("");
    setAccountName("");
    setIsRecurring(false);
    setRecurrence({ count: "", unit: "month" });
    setRecurrenceInfo("");

    navigation.navigate("Home");
  };

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

  const handleTransactionTypeChange = (type) => {
    setTransactionType(type);
    setExpenseCategory("");
    setIncomeCategory("");
  };

  const getButtonStyle = (type) => ({
    ...styles.transactionButton,
    backgroundColor:
      transactionType === type ? (type === "expense" ? "red" : "blue") : "#ddd",
  });

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
      allowsEditing: true,
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
      <View key={index} style={styles.attachmentItem}>
        <Image
          source={{ uri: attachment }}
          style={styles.attachmentImage}
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

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Adicionar Transação</Text>

        <View style={styles.transactionTypeContainer}>
          <TouchableOpacity
            style={getButtonStyle("income")}
            onPress={() => handleTransactionTypeChange("income")}
          >
            <Text style={styles.transactionButtonText}>Receita</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={getButtonStyle("expense")}
            onPress={() => handleTransactionTypeChange("expense")}
          >
            <Text style={styles.transactionButtonText}>Despesa</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Descrição"
          value={description}
          onChangeText={setDescription}
        />
        <TextInput
          style={styles.input}
          placeholder="Valor"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <TextInput
            style={styles.input}
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
        <Picker
          selectedValue={selectedAccount}
          onValueChange={handleAccountChange}
        >
          <Picker.Item label="Selecione uma conta" value="" />
          {accounts.map((account) => (
            <Picker.Item
              key={account.id}
              label={account.name}
              value={account.id}
            />
          ))}
        </Picker>
        <Picker
          selectedValue={selectedCategory}
          onValueChange={handleValueChange}
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

        <View style={styles.switchContainer}>
          <Text style={styles.switchText}>Repetir</Text>
          <Switch
            value={isRecurring}
            onValueChange={(value) => setIsRecurring(value)}
            thumbColor={isRecurring ? "#4caf50" : "#f44336"}
            trackColor={{ false: "#ddd", true: "#b2dfdb" }}
          />
        </View>

        {isRecurring && (
          <View style={styles.recurrenceContainer}>
            <Text style={styles.recurrenceLabel}>Quantidade</Text>
            <View style={styles.recurrenceButtons}>
              <Button title="-" onPress={handleDecrement} />
              <TextInput
                style={styles.input}
                placeholder="Repetir"
                value={recurrence.count}
                keyboardType="numeric"
                onChangeText={handleRecurrenceCountChange}
              />
              <Button title="+" onPress={handleIncrement} />
              <Picker
                selectedValue={recurrence.unit}
                onValueChange={(itemValue) =>
                  setRecurrence((prevRecurrence) => ({
                    ...prevRecurrence,
                    unit: itemValue,
                  }))
                }
              >
                <Picker.Item label="Meses" value="month" />
                <Picker.Item label="Semanas" value="week" />
              </Picker>
            </View>
          </View>
        )}

        <View style={styles.attachmentContainer}>
          <TouchableOpacity
            onPress={pickImage}
            style={styles.addAttachmentButton}
          >
            <Text style={styles.addAttachmentButtonText}>Adicionar Anexo</Text>
          </TouchableOpacity>
          <View style={styles.attachmentList}>{renderAttachments()}</View>
        </View>
      <Button title="Salvar" onPress={handleSaveAndNavigate} />

      </View>

    </TouchableWithoutFeedback>
  );
};

// Estilos para o componente AddTransactionScreen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
  },
  transactionTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  transactionButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    alignItems: "center",
  },
  transactionButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  switchText: {
    marginRight: 8,
    fontSize: 16,
  },
  recurrenceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  recurrenceLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  recurrenceButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  attachmentContainer: {
    marginTop: 20,
  },
  addAttachmentButton: {
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 5,
  },
  addAttachmentButtonText: {
    color: "#fff",
    textAlign: "center",
  },
  attachmentList: {
    marginTop: 10,
  },
  attachmentItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  attachmentImage: {
    width: 100,
    height: 100,
    marginRight: 10,
  },
});

export default AddTransactionScreen;
