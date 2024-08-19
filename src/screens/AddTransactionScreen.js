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
import { useNavigation } from "@react-navigation/native";
import { useTransactions } from "../context/TransactionContext";
import { useAccounts } from "../context/AccountContext";
import { useCategories } from "../context/CategoryContext";
import UUID from "react-native-uuid";
import * as ImagePicker from "expo-image-picker";
import * as Sharing from "expo-sharing";
import { MaterialIcons } from "@expo/vector-icons";

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
  const [selectedAccount, setSelectedAccount] = useState("Selecione uma conta");
  const [selectedCategory, setSelectedCategory] = useState("Selecione uma categoria");
  const [accountName, setAccountName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrence, setRecurrence] = useState({ count: "", unit: "month" });
  const [recurrenceInfo, setRecurrenceInfo] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showRecurrenceModal, setShowRecurrenceModal] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [showOptionsModal, setShowOptionsModal] = useState(false); // Novo estado para o modal de opções

  
  
  
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
      attachments,
    };
  
    const transactions = isRecurring
      ? generateRecurringTransactions(baseTransaction, recurrenceId)
      : [baseTransaction];
  
    transactions.forEach((transaction) => {
      addTransaction(transaction);
    });
  
    // Resetar todos os campos
    setTransactionType("expense");
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
    <KeyboardAvoidingView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.formContainer}>
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
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.datePickerButton}
            >
              <TextInput
                style={styles.datePickerInput}
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
              style={styles.picker}
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
              style={styles.picker}
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
                <View style={styles.recurrenceLabelContainer}>
                  <Text style={styles.recurrenceLabel}>Quantidade</Text>
                  <View style={styles.recurrenceControls}>
                    <TouchableOpacity
                      style={styles.recurrenceButton}
                      onPress={handleDecrement}
                    >
                      <Text style={styles.recurrenceButtonText}>-</Text>
                    </TouchableOpacity>

                    <TextInput
                      style={styles.recurrenceInput}
                      placeholder="0"
                      value={recurrence.count.toString()}
                      keyboardType="numeric"
                      onChangeText={handleRecurrenceCountChange}
                    />

                    <TouchableOpacity
                      style={styles.recurrenceButton}
                      onPress={handleIncrement}
                    >
                      <Text style={styles.recurrenceButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.periodContainer}>
                  <Text style={styles.recurrenceLabel}>Período</Text>
                  <Picker
                    selectedValue={recurrence.unit}
                    onValueChange={(itemValue) =>
                      setRecurrence((prevRecurrence) => ({
                        ...prevRecurrence,
                        unit: itemValue,
                      }))
                    }
                    style={styles.recurrencePicker}
                  >
                    <Picker.Item label="Mensal" value="month" />
                    <Picker.Item label="Semanal" value="week" />
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
            
          </View>
        </TouchableWithoutFeedback>
        <View>
        <Button title="Salvar" onPress={handleSaveAndNavigate} />
      </View>
      </ScrollView>
      
      </KeyboardAvoidingView>
  );
};

// Estilos para o componente AddTransactionScreen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  formContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    fontWeight: "bold",
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
    borderRadius: 5,
  },
  datePickerButton: {
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 5,
    marginBottom: 12,
  },
  datePickerInput: {
    color: "#fff",
    fontSize: 16,
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
    flexDirection: "column",
    marginBottom: 16,
  },
  recurrenceLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  recurrenceLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  recurrenceControls: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  recurrenceButton: {
    backgroundColor: "#ddd",
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  recurrenceButtonText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  recurrenceInput: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    width: 80,
    textAlign: "center",
    fontSize: 16,
    marginHorizontal: 10,
  },
  periodContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  recurrencePicker: {
    width: 150,
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
  picker: {
    marginBottom: 12,
  },
  footer: {
    padding: 16,
    backgroundColor: "#f1f1f1",
    marginTop: 'auto',

  },
});

export default AddTransactionScreen;
