import React from "react";
import { View, Text, TouchableOpacity, Modal, Switch, StyleSheet } from "react-native";

const SelectedCardsModal = ({ visible, onClose, cardVisibility, toggleCardVisibility }) => {
  // Lista de cards fixos que devem ser sempre visíveis
  const fixedCards = ['BalanceCard', 'AbstractCard'];

  // Filtra os cards que podem ser alterados com base na visibilidade configurada
  const toggleableCards = Object.keys(cardVisibility).filter(card => 
    !fixedCards.includes(card)
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Escolha os cards para exibir:</Text>
          {toggleableCards.map(card => (
            <View key={card} style={styles.switchContainer}>
              <Text style={styles.switchLabel}>
                {
                  card === 'SpendingLimitCard' ? 'Limite de Gastos' :
                  card === 'AccountsCard' ? 'Contas' :
                  card === 'MonthlyBalanceCard' ? 'Balanço Mensal' :
                  card
                }
              </Text>
              <Switch
                value={cardVisibility[card]}
                onValueChange={() => toggleCardVisibility(card)}
              />
            </View>
          ))}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Estilos locais
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fundo semi-transparente
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: 'black',
    textAlign: 'center'
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxHeight: '60%',
    justifyContent: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  switchLabel: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  closeButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default SelectedCardsModal;
