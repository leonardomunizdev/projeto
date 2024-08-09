import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import styles from '../../styles/screens/TransactionsScreenStyles';

const ModalComponent = ({
  modalVisible,
  modalType,
  removeAllRecurringTransactions,
  removePreviousRecurringTransactions,
  removeFutureRecurringTransactions,
  removeTransactionById,
  setModalVisible,
}) => {
  return (
    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {modalType === 'recurring' ? (
            <>
              <Text style={styles.modalTitle}>Excluir transações recorrentes</Text>
              <TouchableOpacity onPress={removeAllRecurringTransactions} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Todas as parcelas</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={removePreviousRecurringTransactions} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Parcelas anteriores</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={removeFutureRecurringTransactions} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Parcelas futuras</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={removeTransactionById} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Esta parcela</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.modalTitle}>Excluir transação</Text>
              <TouchableOpacity onPress={removeTransactionById} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Excluir</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.modalButton, styles.cancelButton]}>
            <Text style={styles.modalButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ModalComponent;
