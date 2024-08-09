import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
    container: {
      paddingTop: 30,
      flex: 1,
      padding: 16,
    },
    scrollViewContent: {
      flexGrow: 1,
    },
    balanceContainer: {
      alignItems: 'center',
      marginBottom: 16,
    },
    balanceText: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    balanceAmount: {
      fontSize: 32,
      fontWeight: 'bold',
    },
    balanceAmountNegative: {
      color: 'red',
    },
    summaryContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    card: {
      flex: 1,
      margin: 4,
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
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
      alignItems: 'center',
      alignContent: 'center'
    },
    modalBalanceTotal: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'green',
      marginBottom: 16,
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
  
  
  
  });

  export default styles;