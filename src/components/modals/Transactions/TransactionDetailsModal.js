import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Linking,
  Alert, // Importar Alert para mostrar mensagens de erro
} from "react-native";
import moment from "moment";
import "moment/locale/pt-br";
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Ionicons } from "@expo/vector-icons";
import EditTransactionModal from "./EditTransactionModal";
import { useTransactions } from "../../../context/TransactionContext";
import TransactionsStyles from "../../../styles/screens/TransactionsScreenStyles";
import { Button, Icon } from "react-native-paper";

// Função para converter arquivos em base64
const getBase64 = async (uri) => {
  try {
    const base64Data = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return `data:image/jpeg;base64,${base64Data}`; // Ajuste o tipo de imagem conforme necessário
  } catch (error) {
    console.error("Failed to get Base64:", error);
    return null;
  }
};

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

const formatDate = (date) => {
  return moment(date).format("DD/MM/YYYY");
};

const TransactionDetailsModal = ({ visible, onClose, transaction }) => {
  const [attachmentsBase64, setAttachmentsBase64] = useState([]);
  const [transactionToEdit, setTransactionToEdit] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const { transactions, removeTransaction } = useTransactions();
  const [removeModalVisible, setRemoveModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [modalAttachemmentsVisible, setModalAttachemmentsVisible] = useState(false);

  const handleEdit = () => {
    setTransactionToEdit(transaction);
    setEditModalVisible(true);
  };



  const removeAllRecurringTransactions = () => {
    const { recurrenceId } = currentTransaction;
    const transactionsToRemove = transactions.filter(
      (transaction) => transaction.recurrenceId === recurrenceId
    );
    transactionsToRemove.forEach((transaction) =>
      removeTransaction(transaction.id)
    );
    setRemoveModalVisible(false);
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
    setRemoveModalVisible(false);
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
    setRemoveModalVisible(false);
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
          onPress: () => {
            removeTransactionById();
            onClose(); // Fechar modal de detalhes da transação após a exclusão
          },
          style: "destructive",
        },
      ]
    );
  };


  useEffect(() => {
    if (currentTransaction) {
      if (currentTransaction.isRecurring) {
        setRemoveModalVisible(true);
      } else {
        confirmDelete();
      }
    }
  }, [currentTransaction]);

  const removeTransactionById = () => {
    if (currentTransaction) {
      const { id } = currentTransaction;
      removeTransaction(id);
      setRemoveModalVisible(false); // Fechar o modal de remoção
      onClose(); // Fechar o modal de detalhes da transação
    } else {
      console.error("Nenhuma transação selecionada para remoção.");
      Alert.alert("Erro", "Nenhuma transação foi selecionada para remoção.");
    }
  };


  useEffect(() => {
    const convertAttachments = async () => {
      if (transaction && transaction.attachments) {
        const base64Attachments = await Promise.all(
          transaction.attachments.map(async (attachment) => {
            if (attachment.startsWith("data:image/")) {
              return attachment;
            } else {
              const base64 = await getBase64(attachment);
              return base64 || attachment; // Retorna o base64 ou o caminho original se a conversão falhar
            }
          })
        );
        setAttachmentsBase64(base64Attachments);
      } else {
        setAttachmentsBase64([]); // Limpar os anexos se não houver transação
      }
    };
    convertAttachments();
  }, [transaction]); // Dependência de transaction para atualizar os anexos

  const handleAttachmentPress = (url) => {
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open URL:", err)
    );
  };


  const generateImagesPdf = async () => {
    if (attachmentsBase64.length === 0) {
      Alert.alert(
        "Sem Anexos",
        "Não há quaisquer anexos ligados a esta transação."
      );
      return;
    }

    const html = `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .attachment-image { width: 100%; height: auto; max-height:1000px; max-width: 500px; margin-top: 10px; border: 1px solid #ddd; }
        </style>
      </head>
      <body>
        ${attachmentsBase64.length > 0
        ? attachmentsBase64
          .map(
            (attachment) => `
          <div>
            <center><img src="${attachment}" class="attachment-image"/></center>
          </div>
        `
          )
          .join("")
        : "<p>Nenhum anexo disponível</p>"
      }
      </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error("Failed to generate or share images-only PDF:", error);
    }
  };

  if (!transaction) {
    return null; // Ou você pode renderizar algum conteúdo alternativo se transaction for nulo
  }
  const getCurrentInstallment = (transaction) => {
    if (
      !transaction.isRecurring ||
      !transaction.startDate ||
      !transaction.date ||
      !transaction.recorrenceCount
    ) {
      return '';
    }

    const startDate = moment(transaction.startDate, "YYYY-MM-DD");
    const transactionDate = moment(transaction.date, "YYYY-MM-DD");
    const totalInstallments = transaction.recorrenceCount;

    // Calcula a diferença em meses entre a data de início e a data da transação
    let monthsDifference = transactionDate.diff(startDate, "months");

    // Lógica para calcular o número da parcela
    let installmentNumber;

    if (transactionDate.isSame(startDate, "month")) {
      installmentNumber = monthsDifference + 1; // Subtrai 1 se for o mesmo mês da startDate
    } else {
      installmentNumber = monthsDifference + 2; // Soma 2 caso contrário
    }

    // Garante que o número da parcela não exceda o total de parcelas
    if (installmentNumber > totalInstallments) {
      installmentNumber = totalInstallments;
    }

    return `${totalInstallments}`;
  };

  const handleDelete = () => {
    if (!transaction) return;
    setCurrentTransaction(transaction);

    if (transaction.isRecurring) {
      setRemoveModalVisible(true); // Abrir o modal de remoção para transações recorrentes
    } else {
      confirmDelete(); // Mostrar o Alert diretamente para transações não recorrentes
    }
  };
  return (
    <View style={styles.container}>
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <TouchableOpacity style={styles.modalContainer} onPressOut={onClose}>
          <TouchableOpacity activeOpacity={1} style={[styles.modalContent, transaction.type === 'expense' ? styles.stripeExpense : styles.stripeIncome]}>
            <Text style={styles.title}>{transaction.description || "N/A"}</Text>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Ionicons name="trash" size={40} color="red" />
            </TouchableOpacity>
            <ScrollView contentContainerStyle={styles.scrollView}>
              <View style={styles.tableContainer}>

                <View style={styles.tableRow}>
                  <Text style={styles.tableHeader}>Valor</Text>
                  <Text style={styles.tableCell}>
                    {formatCurrency(transaction.amount)}
                  </Text>
                </View>
                {transaction.isRecurring && (
                  <View style={styles.tableRow}>
                    <Text style={styles.tableHeader}>Parcela</Text>
                    <Text style={styles.tableCell}>
                      {getCurrentInstallment(transaction)}
                    </Text>
                  </View>
                )}
                <View style={styles.tableRow}>
                  <Text style={styles.tableHeader}>Categoria</Text>
                  <Text style={styles.tableCell}>
                    {transaction.categoryName || "N/A"}
                  </Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableHeader}>Conta</Text>
                  <Text style={styles.tableCell}>
                    {transaction.accountName || "N/A"}
                  </Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableHeader}>Data</Text>
                  <Text style={styles.tableCell}>
                    {formatDate(transaction.date)}
                  </Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableHeader}>Há Anexos</Text>
                  <View style={[styles.tableCellContainer, { flexDirection: 'row', alignItems: 'center', }]}>
                    <Text style={styles.tableCell}>
                      {attachmentsBase64.length > 0 ? "Sim" : "Não"}
                    </Text>
                    {attachmentsBase64.length > 0 && (
                      <TouchableOpacity onPress={() => setModalAttachemmentsVisible(true)} style={[styles.iconButton, { marginLeft: 10, }]}>
                        <Ionicons name="eye" size={24} color="black" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              onPress={handleEdit}
              style={[styles.pdfButton, { marginBottom: 10 }]}
            >
              <Text style={[styles.buttonText, { color: 'white' }]}>Editar Transação</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={generateImagesPdf}
              style={[styles.pdfButton, {
                borderWidth: 2,
                borderColor: '#007AFF',
                backgroundColor: 'transparent',
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 20,
              }]}
            >
              <Text style={styles.buttonText}>Baixar Informações</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {transactionToEdit && (
        <EditTransactionModal
          isVisible={editModalVisible}
          onClose={() => setEditModalVisible(false)}
          transaction={transactionToEdit || {}} // Passa um objeto vazio se transactionToEdit for undefined
          closeDetail={onClose}
        />
      )}

      <Modal
        transparent={true}
        animationType="slide"
        visible={modalAttachemmentsVisible}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { height: '100%', borderTopRadius: 40 }]}>
            <ScrollView

            >
              {attachmentsBase64.map((attachment, index) => {
                const isBase64 = attachment.startsWith("data:image/");
                return isBase64 ? (
                  <View key={index} style={styles.attachmentContainer}>
                    <Image
                      source={{ uri: attachment }}
                      style={styles.attachmentImage}
                      resizeMode="contain"
                    />
                  </View>
                ) : (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleAttachmentPress(attachment)}
                    style={styles.attachmentContainer}
                  >
                    <Text style={styles.attachmentText}>
                      Abrir Anexo {index + 1}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalAttachemmentsVisible(false)}>

              <Text style={{ color: "white", }}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        animationType="slide"
        visible={removeModalVisible}
      >
        <View style={removeModalStyles.modalOverlay}>
          <View style={removeModalStyles.modalContent}>
            <Text style={removeModalStyles.modalTitle}>Excluir Transação Recorrente</Text>
            <TouchableOpacity
              style={removeModalStyles.optionButton}
              onPress={() => {
                removeTransactionById();
                setRemoveModalVisible(false)
                onClose();
              }}
            >
              <Text style={removeModalStyles.optionText}>Somente esta</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={removeModalStyles.optionButton}
              onPress={() => {
                removeAllRecurringTransactions();
                setRemoveModalVisible(false)
                onClose()
              }}
            >
              <Text style={removeModalStyles.optionText}>Todas as parcelas</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={removeModalStyles.optionButton}
              onPress={() => {
                removePreviousRecurringTransactions();
                setRemoveModalVisible(false)
                onClose();
              }}
            >
              <Text style={removeModalStyles.optionText}>Parcelas anteriores</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={removeModalStyles.optionButton}
              onPress={() => {
                removeFutureRecurringTransactions();
                setRemoveModalVisible(false)
                onClose();
              }}
            >
              <Text style={removeModalStyles.optionText}>Parcelas futuras</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[removeModalStyles.optionButton, removeModalStyles.cancelButton]}
              onPress={() => setRemoveModalVisible(false)}
            >
              <Text style={removeModalStyles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>


  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalContent: {
    width: "100%",
    height: "65%",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: "#ffffff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
    shadowColor: "#000000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  scrollView: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 24, // Aumentado para um tamanho maior
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333333",
    textAlign: "center", // Centraliza o texto
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    overflow: "hidden",

  },
  tableRow: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  tableHeader: {
    fontWeight: "bold",
    width: "30%",
    color: "#555555",
  },
  tableCell: {
    width: "70%",
    color: "#666666",
  },

  attachmentText: {
    color: "white",
    textDecorationLine: "underline",
    marginVertical: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    paddingHorizontal: 50,
  },
  pdfButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 12, // Altura do botão
    borderRadius: 5,
    marginHorizontal: 10, // Adicionado para espaçamento entre os botões
    borderRadius: 20,
  },
  buttonText: {
    textAlign: 'center',
    color: "black",
    fontWeight: "bold",
    fontSize: 16, // Tamanho da fonte
  },
  deleteButton: {
    position: "absolute",
    top: 15,
    right: 10,
    zIndex: 1,
  },
  stripeIncome: {
    borderTopColor: 'blue',
    borderTopWidth: 20,
  },
  stripeExpense: {
    borderTopColor: 'red',
    borderTopWidth: 20,
  },
  scrollViewContent: {
    flexDirection: 'row',
  },
  attachmentContainer: {
    marginHorizontal: 10,
  },
  attachmentImage: {
    width: '100%',  // Ajuste conforme necessário
    height: 800,
    marginVertical: 20 // Ajuste conforme necessário
  },
  attachmentText: {
    color: "#007BFF",
    textDecorationLine: "underline",
    marginVertical: 5,
  },
  closeButton: {
    backgroundColor: "#d9534f",
    padding: 10,
    marginTop: 20,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 5,

  }

});

const removeModalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  optionButton: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  optionText: {
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 15,
    borderBottomWidth: 0,
  },
  cancelText: {
    color: 'red',
    textAlign: 'center',
  },
});

export default TransactionDetailsModal;
