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

const EditTransactionModal = ({ isVisible, onClose, transaction }) => {
  const { updateTransaction } = useTransactions();
  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const { transactions } = useTransactions();
  const [type, setType] = useState(transaction.type);
  const [description, setDescription] = useState(transaction.description);
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [categoryId, setCategoryId] = useState(transaction.categoryId);
  const [accountId, setAccountId] = useState(transaction.accountId);
  const [attachments, setAttachments] = useState(transaction.attachments || []);

  // Filtra as categorias de acordo com o tipo de transação selecionado
  const filteredCategories = categories.filter(
    (category) => category.type === type
  );

  const handleSave = () => {
    const updatedTransaction = {
      ...transaction,
      type,
      description,
      amount: parseFloat(amount),
      categoryId,
      accountId,
      attachments, // Inclua os anexos
    };

    console.log("Transações antes da atualização:", transactions);

    if (transaction.isRecurring) {
      transactions.forEach((trans) => {
        if (trans.recurrenceId === transaction.recurrenceId) {
          console.log("Atualizando transação:", trans);
          updateTransaction({
            ...trans,
            type,
            description,
            amount: parseFloat(amount),
            categoryId,
            accountId,
            attachments, // Inclua os anexos
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
    setAmount(transaction.amount.toString());
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
            onChangeText={setAmount}
          />

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
                <TouchableOpacity onPress={() => removeAttachment(item)} style={styles.removeButton}>
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
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 15,
    padding: 10,
  },
  picker: {
    marginBottom: 15,
  },
  modalButtons: {
    paddingTop: 50,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  saveButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginRight: 5,
  },
  cancelButton: {
    backgroundColor: "#d9534f",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginLeft: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  attachmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  attachment: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeButton: {
    marginLeft: 10,
  },
});

export default EditTransactionModal;
