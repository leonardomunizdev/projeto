import { StyleSheet } from "react-native";


export const statisticsStyles = StyleSheet.create({

    
    container: {
      flexGrow: 1,
      padding: 16,
      backgroundColor: '#f9f9f9',
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      
      
    },
    header: {
      paddingTop: 25,
      fontSize: 35,
      fontWeight: 'bold',
      textAlign: 'center',
      justifyContent: 'center',
      alignItems: 'center'
      
    },
    iconButton: {
      padding: 8,
      backgroundColor: 'silver',
      borderRadius: 100,
      marginHorizontal: 8,
    },
    sectionContainer: {
      marginBottom: 16,
      marginTop: 10
    },
    sectionHeader: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
      backgroundColor: 'silver',
      textAlign: 'center'
    },
   
    categoryItem: {
      fontSize: 16,
      color: '#333',
    },
    noData: {
      fontSize: 16,
      color: '#999',
    },
    transactionItemContainer: {
      marginBottom: 8,
    },
    transactionItem: {
      fontSize: 16,
      color: '#333',
    },
    tableContainer: {
      marginTop: 16,
    },
    table: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
    },
    tableRow: {
      flexDirection: 'row',
      justifyContent: 'center', // Centraliza o conteúdo das linhas
      alignItems: 'center',     // Alinha verticalmente ao centro
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
      paddingVertical: 8,
    },
    
    tableHeader: {
      flex: 1,
      textAlign: 'center', // Centraliza o texto dos cabeçalhos
      fontWeight: 'bold',
    },
    tableCell: {
      flex: 1,
      textAlign: 'center', // Centraliza o texto das células
    },
    item: {
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
      paddingVertical: 8,
    },
  
    balanceRow: {
      flexDirection: 'row',
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    balanceLabel: {
      fontSize: 16,
      fontWeight: 'bold',
      flex: 2,
      textAlign: 'left',
    },
    balancePositive: {
      fontSize: 16,
      fontWeight: 'bold',
      color: 'green',
      flex: 1,
      textAlign: 'right',
    },
    balanceNegative: {
      fontSize: 16,
      fontWeight: 'bold',
      color: 'red',
      flex: 1,
      textAlign: 'right',
    },
    balanceZero: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
      flex: 1,
      textAlign: 'right',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      width: '90%',
      backgroundColor: 'white',
      borderRadius: 10,
      padding: 20,
      elevation: 5,
    },
    modalTitle: {
      fontSize: 25,
      fontWeight: 'bold',
      marginBottom: 16,
      textAlign: 'center',
    },
    filterLabel: {
      fontSize: 16,
      marginBottom: 8,
      fontWeight: 'bold',
    },
    picker: {
      height: 50,
      width: '100%',
      marginBottom: 16,
    },
    dateInput: {
      height: 50,
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 5,
      padding: 10,
      marginBottom: 16,
      fontSize: 16,
      color: '#333',
    },
    modalButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 16,
    },
    modalButton: {
      flex: 1,
      alignItems: 'center',
      padding: 10,
      backgroundColor: 'blue',
      borderRadius: 5,
      marginHorizontal: 5,
      marginBottom: 10,
    },
    modalButtonText: {
      fontSize: 16,
      color: 'white',
    },
    closeButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      zIndex: 1,
    },
  });

  export default statisticsStyles;