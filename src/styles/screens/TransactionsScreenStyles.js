import { StyleSheet } from "react-native";

export const TransactionsStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    paddingTop: 35,
  },
  searchInput: {
    height: 40,
    backgroundColor: "silver",
    borderRadius: 8,
    paddingLeft: 10,
    marginBottom: 10,
    marginTop: 10,

    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  item: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  expenseItem: {
    borderLeftColor: "#ff4d4f",
    borderLeftWidth: 5,
  },
  incomeItem: {
    borderLeftColor: "blue",
    borderLeftWidth: 5,
  },
  description: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  amount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  category: {
    fontSize: 14,
    color: "#999",
  },
  installment: {
    fontSize: 14,
    color: "black",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  navButton: {
    padding: 10,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007bff",
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#333",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  modalButton: {
    padding: 10,
    backgroundColor: "#007bff",
    borderRadius: 5,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "#ff4d4f",
  },
  attachmentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  attachmentButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  attachmentList: {
    marginTop: 10,
  },
  attachmentItem: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
    marginBottom: 5,
  },
  attachmentName: {
    fontSize: 14,
    color: "#333",
  },
  attachmentImage: {
    width: 200,  // Defina a largura da imagem
    height: 200, // Defina a altura da imagem
    resizeMode: 'contain', // Ajusta a imagem dentro do contêiner mantendo a proporção
    marginBottom: 10, // Espaçamento inferior
  },
  installment: {
    color: 'black',
  }
  
});

export default TransactionsStyles;
