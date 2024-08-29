import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  FlatList,
  Image,
} from "react-native";
import { useTransactions } from "../../../context/TransactionContext";
import { useAccounts } from "../../../context/AccountContext";
import { useCategories } from "../../../context/CategoryContext";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons'; // Importa ícones para o botão de remoção
import { format, addMonths, addWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";
import DateTimePicker from "@react-native-community/datetimepicker";

const EditTransactionModal = ({ isVisible, onClose, transaction }) => {
  const { updateTransaction } = useTransactions();
  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const [date, setDate] = useState(new Date());
  const { transactions } = useTransactions();
  const [type, setType] = useState(transaction.type);
  const [description, setDescription] = useState(transaction.description);
  const [amount, setAmount] = useState(transaction.amount.toFixed(2).toString());
  const [categoryId, setCategoryId] = useState(transaction.categoryId);
  const [accountId, setAccountId] = useState(transaction.accountId);
  const [attachments, setAttachments] = useState(transaction.attachments || []);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    setDate(new Date(transaction.date)); // Inicializa com a data da transação
    setType(transaction.type);
    setDescription(transaction.description);
    setAmount(formatValue(transaction.amount.toFixed(2).toString()));
    setCategoryId(transaction.categoryId);
    setAccountId(transaction.accountId);
    setAttachments(transaction.attachments || []);
  }, [transaction]);

  // Filtra as categorias de acordo com o tipo de transação selecionado
  const filteredCategories = categories.filter(
    (category) => category.type === type
  );
  const onChange = (event, selectedDate) => {
    setShowDatePicker(false); // Fechar o picker após a seleção
    if (selectedDate) {
      setDate(selectedDate); // Atualizar a data somente se houver uma nova seleção
    }
  };
  



  const formatValue = (value) => {
    // Remove caracteres não numéricos
    value = value.replace(/\D/g, '');

    // Certifique-se de que o valor tenha no mínimo 3 dígitos
    value = value.padStart(3, '0');

    // Separa a parte inteira da parte decimal
    const integerPart = value.slice(0, -2);
    const decimalPart = value.slice(-2);

    // Formata a parte inteira com pontos de milhar
    const formattedInteger = integerPart
      .split('')
      .reverse()
      .reduce((acc, digit, index) => {
        return digit + (index && index % 3 === 0 ? '.' : '') + acc;
      }, '');

    // Combina a parte inteira e a parte decimal
    return `${formattedInteger},${decimalPart}`;
  };

  const convertToAmerican = (value) => {
    // Remove caracteres não numéricos
    value = value.replace(/\D/g, '');

    // Adiciona pontos e vírgulas conforme necessário
    const integerPart = value.slice(0, -2); // Parte inteira
    const decimalPart = value.slice(-2);   // Parte decimal

    // Combina a parte inteira e a parte decimal para o formato americano
    return `${integerPart}.${decimalPart}`;
  };

  const handleChange = (text) => {
    // Remove caracteres não numéricos e formata o valor
    const formattedValue = formatValue(text);
    const cleanedValue = formattedValue.replace(/^0+(?!,)/, '');
    setAmount(cleanedValue);
  };

  const handleSave = () => {
    const updatedTransaction = {
      ...transaction,
      type,
      description,
      amount: parseFloat(convertToAmerican(amount)),
      date, // Inclua a data atualizada
      categoryId,
      accountId,
      attachments,
    };
  
    if (transaction.isRecurring) {
      transactions.forEach((trans) => {
        if (trans.recurrenceId === transaction.recurrenceId) {
          updateTransaction({
            ...trans,
            type,
            description,
            amount: parseFloat(convertToAmerican(amount)),
            date, // Inclua a data atualizada
            categoryId,
            accountId,
            attachments,
          });
        }
      });
    } else {
      updateTransaction(updatedTransaction);
    }
  
    onClose();
  };
  

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, // Define como false para não permitir edição
      quality: 1,
    });

    console.log(result); // Adicione isto para verificar o retorno

    if (!result.canceled) {
      setAttachments([...attachments, result.assets[0].uri]);
    }
  };

  const removeAttachment = (uri) => {
    setAttachments(attachments.filter((item) => item !== uri));
  };

  useEffect(() => {
    setType(transaction.type);
    setDescription(transaction.description);
    setAmount(formatValue(transaction.amount.toFixed(2).toString()));
    setCategoryId(transaction.categoryId);
    setAccountId(transaction.accountId);
    setAttachments(transaction.attachments || []);
  }, [transaction]);

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Editar Transação</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === "income" ? styles.incomeButton : styles.defaultButton,
              ]}
              onPress={() => setType("income")}
            >
              <Text style={styles.typeButtonText}>Receita</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === "expense" ? styles.expenseButton : styles.defaultButton,
              ]}
              onPress={() => setType("expense")}
            >
              <Text style={styles.typeButtonText}>Despesa</Text>
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
            onChangeText={handleChange}
          />

          <TouchableOpacity style={styles.addButton} onPress={() => setShowDatePicker(true)}>
            <TextInput
              style={{color: 'white'}}
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
              onChange={(event, selectedDate) => {
                setShowDatePicker(false); // Fechar o picker após selecionar
                if (selectedDate) {
                  setDate(selectedDate); // Atualiza a data somente se houver uma nova seleção
                }
              }}
            />
          )}

          <Picker
            selectedValue={categoryId}
            style={styles.picker}
            onValueChange={(itemValue) => setCategoryId(itemValue)}
          >
            {filteredCategories.map((category) => (
              <Picker.Item
                key={category.id}
                label={category.name}
                value={category.id}
              />
            ))}
          </Picker>

          <Picker
            selectedValue={accountId}
            style={styles.picker}
            onValueChange={(itemValue) => setAccountId(itemValue)}
          >
            {accounts.map((account) => (
              <Picker.Item
                key={account.id}
                label={account.name}
                value={account.id}
              />
            ))}
          </Picker>

          <TouchableOpacity onPress={pickImage} style={styles.addButton}>
            <Text style={styles.buttonText}>Adicionar Anexo</Text>
          </TouchableOpacity>

          <FlatList
            data={attachments}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <View style={styles.attachmentContainer}>
                <Image source={{ uri: item }} style={styles.attachment} />
                <TouchableOpacity onPress={() => removeAttachment(item)} >
                  <Ionicons name="trash-bin-outline" size={24} color="red" />
                </TouchableOpacity>
              </View>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Text style={styles.buttonText}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "100%",
    height: "100%",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
  },
  modalTitle: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 60,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  typeButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  defaultButton: {
    backgroundColor: "#ccc",
  },
  incomeButton: {
    backgroundColor: "#007bff",
  },
  expenseButton: {
    backgroundColor: "#d9534f",
  },
  typeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  picker: {
    height: 50,
    width: "100%",
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  attachmentContainer: {
    flexDirection: "row",
    marginRight: 10,
  },
  attachment: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
  },
  removeButton: {
    position: "absolute",
    top: 5,
    right: 5,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  saveButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    marginRight: 5,
  },
  cancelButton: {
    backgroundColor: "#d9534f",
    padding: 15,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    marginLeft: 5,
  },
});

export default EditTransactionModal;
