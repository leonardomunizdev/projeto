import {StyleSheet} from 'react-native';

export const HomeStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 50,
    backgroundColor: "#f5f5f5",
  },
  balanceContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  balanceText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  balanceAmount: {
    fontSize: 36,
    textAlign: "center",
    marginTop: 8,
  },
  textContainer: {
    width: "100%", 
    alignItems: "center",
  },
    balanceAmountNegative: {
      color: "red",
    },
    summaryContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginVertical: 20,
      marginHorizontal: '0.0001%'

    },
    card: {
      flex: 1,
      marginHorizontal: 10,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    cardAmountIncome: {
      fontSize: 16,
      color: 'blue',
    },
    cardAmountExpense: {
      fontSize: 16,
      color: 'red',
      
    },
    accountsCard: {
      marginBottom: 16,
      marginHorizontal: '3%'
    },
    accountsTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    accountItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    accountName: {
      fontSize: 16,
      paddingBottom: 10
    },
    accountAmount: {
      fontSize: 16,
    },
    accountDivider: {
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
      marginVertical: 8,
    },
    totalContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    totalText: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    totalAmount: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    monthlyBalanceCard: {
      marginBottom: 16,
      marginHorizontal: '3%'

    },
    monthlyBalanceTitle: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    monthYearSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginVertical: 8,
    },
    monthYearText: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    monthlyBalanceContent: {
      marginTop: 8,
    },
    monthlyBalanceItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    monthlyBalanceLabel: {
      fontSize: 16,
    },
    monthlyBalanceValue: {
      fontSize: 16,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
      flex: 1,
      width: '100%',
      backgroundColor: '#fff',
      padding: 20,
    },
    modalBody: {
      flex: 1,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    modalButton: {
      flex: 1,
      padding: 12,
      alignItems: 'center',
      borderRadius: 4,
    },
    modalButtonSelected: {
      backgroundColor: '#ddd',
    },
    modalButtonText: {
      fontSize: 16,
    },
    balanceRow: {
      flexDirection: 'row', // Alinha os itens na horizontal
      justifyContent: 'space-between', // Espaça os itens igualmente
      alignItems: 'center', // Centraliza verticalmente os itens
      marginVertical: 10, // Espaçamento vertical ao redor do container
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    modalBalanceTotal: {
      fontSize: 18,
      fontWeight: 'bold',
      color: 'blue', // ou 'red', dependendo do valor do balanço
    },
    modalSectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginTop: 16,
    },
    modalSectionTotal: {
      fontSize:35,
      fontWeight: 'bold',
      marginTop: 8,
    },
    balanceContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    column: {
      flex: 1,
      padding: 8,
    },
    incomeTotal: {
      color: 'blue',
    },
    movementTextIncome: {
      fontSize: 25,
      color: 'blue',
    },
    movementTextExpense: {
      fontSize: 25,
      color: 'red',
    },
    expenseTotal: {
      color: 'red',
    },
    modalCloseText: {
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 16,
    },
    modalAccountContainer: {
      padding: 8,
    },
    modalCloseButton: {
      marginTop: 16,
      padding: 12,
      backgroundColor: '#FF4C4C', // Cor de fundo do botão fechar
      borderRadius: 5,
      alignItems: 'center',
    },
    modalCloseText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
    categoryCard: {
      marginVertical: 10,
      padding: 10,
    },
    categoryCardTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 10,
    },
    categoryItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginVertical: 5,
    },
    categoryTitle: {
      fontSize: 16,
      fontWeight: "bold",
      marginTop: 10,
    },
    categoryName: {
      fontSize: 14,
    },
    categoryValue: {
      fontSize: 14,
      color: "blue",
    },
    progressBarContainer: {
      height: 20,
      width: '100%',
      backgroundColor: '#e0e0df',
      borderRadius: 5,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      borderRadius: 5,
    },
    ModalGoalsContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fundo semitransparente para o modal
    },
    // Estilo para o conteúdo do modal
    ModalGoalsContent: {
      width: '90%',
      padding: 20,
      backgroundColor: '#fff',
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    // Estilo para o título do modal
    ModalGoalsTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 15,
      textAlign: 'center',
      color: '#333',
    },
    // Estilo para o campo de entrada de texto
    ModalGoalsInput: {
      height: 40,
      borderColor: '#ddd',
      borderWidth: 1,
      borderRadius: 5,
      paddingHorizontal: 10,
      marginBottom: 20,
    },
    // Estilo para o contêiner dos botões do modal
    ModalGoalsButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    // Estilo para o botão de salvar
    ModalGoalsSaveButton: {
      flex: 1,
      backgroundColor: 'blue',
      padding: 12,
      borderRadius: 5,
      alignItems: 'center',
      marginRight: 10,
    },
    // Estilo para o texto do botão de salvar
    ModalGoalsSaveButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    // Estilo para o botão de cancelar
    ModalGoalsCancelButton: {
      flex: 1,
      backgroundColor: '#FF4C4C',
      padding: 12,
      borderRadius: 5,
      alignItems: 'center',
      marginLeft: 10,
    },
    // Estilo para o texto do botão de cancelar
    ModalGoalsCancelButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    addButton: {
      marginLeft: 10,
      justifyContent: 'center',
    },
    addButtonText: {
      fontSize: 24,
      color: 'blue',
    },
  });

  export default HomeStyles;