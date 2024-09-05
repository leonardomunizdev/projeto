import {StyleSheet} from 'react-native';
import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';

export const optionsStyles = StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: 16,
      backgroundColor: '#f4f4f4',
    },
    title: {
      fontSize: RFPercentage(4), // Ajusta o tamanho da fonte com base no tamanho da tela
      fontWeight: 'bold',
      marginBottom: 45,
      marginTop: 50,
      color: '#333',
      textAlign: 'center',
    },
    optionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 8,
      backgroundColor: '#fff',
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 1,
    },
    optionText: {
      fontSize: RFValue(16), // Ajusta o tamanho da fonte com base no tamanho da tela
      marginLeft: 12,
      color: '#333',
    },
    fullScreenModal: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      width: '100%', // Use percentuais para responsividade
      height: '100%',
      maxWidth: 600, // Define um máximo para telas grandes
      backgroundColor: 'white',
      padding: 20,
    },
    modalTitle: {
      fontSize: RFValue(24),
      fontWeight: '600',
      marginBottom: 20,
      color: '#333',
      textAlign: 'center',
    },
    input: {
      width: '100%',
      padding: 14,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 20,
      marginBottom: 16,
      fontSize: RFValue(16),
      color: '#333',
    },
    accountItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    accountName: {
      fontSize: RFValue(20),
      color: '#333',
      fontWeight: 'bold',
    },
    removeButton: {
      color: '#e74c3c',
      fontWeight: '500',
    },
    categoryName: {
      fontWeight: 'bold',
      fontSize: RFValue(20),
    },
    categoryButtonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    categoryButton: {
      flex: 1,
      padding: 14,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 4,
    },
    incomeButton: {
      backgroundColor: 'blue',
    },
    expenseButton: {
      backgroundColor: 'red',
    },
    categoryButtonText: {
      fontSize: RFValue(16),
      fontWeight: '500',
      color: '#333',
    },
    incomeButtonText: {
      color: 'white',
    },
    expenseButtonText: {
      color: 'white',
    },
    categoryItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    confirmModalContent: {
      width: '90%',
      maxWidth: 600,
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    confirmTitle: {
      fontSize: RFValue(22),
      fontWeight: '600',
      marginBottom: 16,
      color: '#333',
      textAlign: 'center',
    },
    confirmText: {
      fontSize: RFValue(16),
      color: '#666',
      marginBottom: 20,
      textAlign: 'center',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    closeButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      zIndex: 1,
    },
    countdownText: {
      fontSize: 16,
      marginTop: 20,
      textAlign: 'center',
    },
    countdownNumber: {
      color: 'red',
      fontWeight: 'bold',
    },
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.8)', // Leve fundo branco para destacar o carregamento
    },
    loaderText: {
      marginTop: 10,
      fontSize: RFValue(16),
    },
    cardItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
  },
  cardName: {
      fontSize: 16,
  },
  cardLimit: {
      fontSize: 14,
      color: '#666',
  },
  cardList: {
      marginTop: 20,
  },
});

export default optionsStyles;