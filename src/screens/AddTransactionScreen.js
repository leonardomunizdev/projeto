import React, { useState, useEffect } from "react";
import {
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
import * as DocumentPicker from "expo-document-picker";
import { MaterialIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";

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
      quality: 1,
    });

    if (!result.canceled) {
      setAttachments([...attachments, result.uri]);
    }
  };

  const pickDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
    });

    if (result.type === "success") {
      setAttachments([...attachments, result.uri]);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Adicionar Transação</Text>

        <View style={styles.transactionTypeContainer}>
          <TouchableOpacity
            style={getButtonStyle("expense")}
            onPress={() => handleTransactionTypeChange("expense")}
          >
            <Text style={styles.transactionButtonText}>Despesa</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={getButtonStyle("income")}
            onPress={() => handleTransactionTypeChange("income")}
          >
            <Text style={styles.transactionButtonText}>Receita</Text>
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

        <Picker
          selectedValue={selectedAccount}
          onValueChange={handleAccountChange}
          style={styles.picker}
        >
          <Picker.Item label="Selecione uma conta" value="" />
          {accounts.map((acc) => (
            <Picker.Item key={acc.id} label={acc.name} value={acc.id} />
          ))}
        </Picker>

        <Picker
          selectedValue={
            transactionType === "expense" ? expenseCategory : incomeCategory
          }
          onValueChange={handleValueChange}
          style={styles.picker}
        >
          <Picker.Item label="Selecione uma categoria" value="" />
          {filteredCategories.map((cat) => (
            <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
          ))}
        </Picker>

        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.datePickerText}>
            {format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </Text>
          <MaterialIcons name="calendar-today" size={24} color="black" />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onChange}
            locale="pt-BR"
          />
        )}

        <View style={styles.switchContainer}>
          <Text>Repetir Transação</Text>
          <Switch
            value={isRecurring}
            onValueChange={() => setIsRecurring(!isRecurring)}
          />
        </View>

        {isRecurring && (
          <>
            <TouchableOpacity
              style={styles.recurrenceButton}
              onPress={() => setShowRecurrenceModal(true)}
            >
              <Text style={styles.recurrenceButtonText}>
                {recurrenceInfo || "Definir recorrência"}
              </Text>
            </TouchableOpacity>

            <Modal
              visible={showRecurrenceModal}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setShowRecurrenceModal(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>
                    Configurar Recorrência
                  </Text>

                  <View style={styles.modalRecurrenceContainer}>
                    <TouchableOpacity
                      style={styles.modalButton}
                      onPress={handleDecrement}
                    >
                      <Text style={styles.modalButtonText}>-</Text>
                    </TouchableOpacity>

                    <TextInput
                      style={styles.modalInput}
                      keyboardType="numeric"
                      value={recurrence.count.toString()}
                      onChangeText={handleRecurrenceCountChange}
                      placeholder="Períodos"
                    />

                    <TouchableOpacity
                      style={styles.modalButton}
                      onPress={handleIncrement}
                    >
                      <Text style={styles.modalButtonText}>+</Text>
                    </TouchableOpacity>

                    <Picker
                      selectedValue={recurrence.unit}
                      onValueChange={(itemValue) =>
                        setRecurrence((prevRecurrence) => ({
                          ...prevRecurrence,
                          unit: itemValue,
                        }))
                      }
                      style={styles.modalPicker}
                    >
                      <Picker.Item label="Mês" value="month" />
                      <Picker.Item label="Semana" value="week" />
                    </Picker>
                  </View>

                  <Button title="Salvar" onPress={handleSave} />
                </View>
              </View>
            </Modal>
          </>
        )}

        <TouchableOpacity
          style={styles.attachButton}
          onPress={pickImage}
        >
          <Text style={styles.attachButtonText}>Anexar Imagem</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.attachButton}
          onPress={pickDocument}
        >
          <Text style={styles.attachButtonText}>Anexar Documento</Text>
        </TouchableOpacity>

        <View style={styles.attachmentsContainer}>
          {attachments.map((attachment, index) => (
            <View key={index} style={styles.attachmentItem}>
              <Text style={styles.attachmentName}>
                {attachment.split("/").pop()}
              </Text>
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
          ))}
        </View>

        <Button title="Adicionar" onPress={handleSaveAndNavigate} />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  transactionTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  transactionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: "center",
  },
  transactionButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginBottom: 20,
    fontSize: 16,
    paddingVertical: 5,
  },
  picker: {
    height: 50,
    marginBottom: 20,
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ddd",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  datePickerText: {
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  recurrenceButton: {
    backgroundColor: "#ddd",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
  },
  recurrenceButtonText: {
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  modalRecurrenceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#ddd",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modalInput: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginHorizontal: 10,
    paddingVertical: 5,
    fontSize: 16,
    flex: 1,
    textAlign: "center",
  },
  modalPicker: {
    flex: 1,
  },
  attachButton: {
    backgroundColor: "#ddd",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
  },
  attachButtonText: {
    fontSize: 16,
  },
  attachmentsContainer: {
    marginBottom: 20,
  },
  attachmentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  attachmentName: {
    fontSize: 16,
  },
});

export default AddTransactionScreen;
