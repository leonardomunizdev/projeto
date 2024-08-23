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
          .attachment-image { width: 100%; height: auto; max-height: 600px; margin-top: 10px; border: 1px solid #ddd; }
        </style>
      </head>
      <body>
        ${
          attachmentsBase64.length > 0
            ? attachmentsBase64
                .map(
                  (attachment) => `
          <div>
            <img src="${attachment}" class="attachment-image"/>
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
  
    return ` ${installmentNumber} de ${totalInstallments}`;
  };


  return (
    
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Detalhes da Transação</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="black" />
          </TouchableOpacity>
          <ScrollView contentContainerStyle={styles.scrollView}>
            <View style={styles.tableContainer}>
              <View style={styles.tableRow}>
                <Text style={styles.tableHeader}>Descrição</Text>
                <Text style={styles.tableCell}>
                  {transaction.description || "N/A"}
                </Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableHeader}>Valor</Text>
                <Text style={styles.tableCell}>
                  {formatCurrency(transaction.amount)}
                </Text>
              </View>
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

              {transaction.isRecurring && (
                <View style={styles.tableRow}>
                  <Text style={styles.tableHeader}>Parcela</Text>
                  <Text style={styles.tableCell}>
                    
                    {
                    
                    getCurrentInstallment(transaction)
                    
                    
                    }
                  </Text>
                </View>
              )}
            </View>
            {attachmentsBase64.length > 0 && (
              <View style={styles.detailContainer}>
                {attachmentsBase64.map((attachment, index) => {
                  const isBase64 = attachment.startsWith("data:image/");
                  return isBase64 ? (
                    <Image
                      key={index}
                      source={{ uri: attachment }}
                      style={styles.attachmentImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleAttachmentPress(attachment)}
                    >
                      <Text style={styles.attachmentText}>
                        Abrir Anexo {index + 1}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </ScrollView>
          <View style={styles.buttonContainer}>
            
            <TouchableOpacity
              onPress={generateImagesPdf}
              style={[styles.pdfButton, { backgroundColor: "#28a745" }]} // Cor verde para o novo botão
            >
              <Text style={styles.pdfButtonText}>Baixar NF</Text>
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
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 20,
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
  attachmentImage: {
    width: "100%",
    height: 200,
    marginVertical: 10,
  },
  attachmentText: {
    color: "#007BFF",
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
    paddingHorizontal: "10%", // Aumentado para maior largura
    borderRadius: 5,
    marginHorizontal: 10, // Adicionado para espaçamento entre os botões
  },
  pdfButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16, // Tamanho da fonte
  },
  closeButton: {
    position: "absolute",
    top: 25,
    right: 10,
    zIndex: 1,
  },
});

export default TransactionDetailsModal;
