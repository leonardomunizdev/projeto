import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';

const AccountBalanceModal = ({  visible, onClose, accountName, balance }) => {

    console.log("Modal Data:");
    console.log("accountName:", accountName);
    console.log("balance:", balance);
    

    return (
      <Modal
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.accountName}>{accountName}</Text>
            <Text style={styles.balanceText}>Saldo Total: {balance}</Text>
  
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };
  
  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      width: '80%',
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: 20,
      alignItems: 'center',
    },
    accountName: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    balanceText: {
      fontSize: 18,
      marginBottom: 20,
    },
    reajustarButton: {
      backgroundColor: '#007BFF',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      marginBottom: 20,
    },
    reajustarButtonText: {
      color: '#fff',
      fontSize: 16,
    },
    qtdContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: 20,
    },
    qtdButton: {
      flex: 1,
      backgroundColor: '#f0f0f0',
      padding: 10,
      borderRadius: 5,
      marginHorizontal: 5,
      alignItems: 'center',
    },
    qtdText: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    qtdNumber: {
      fontSize: 14,
      marginTop: 5,
    },
    closeButton: {
      marginTop: 10,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      backgroundColor: '#DC3545',
    },
    closeButtonText: {
      color: '#fff',
      fontSize: 16,
    },
  });
  
  export default AccountBalanceModal;