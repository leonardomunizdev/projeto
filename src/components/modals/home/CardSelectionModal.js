import React from 'react';
import { Modal, Text, TouchableOpacity, View, StyleSheet } from 'react-native';

const CardSelectionModal = ({ visible, onClose, selectedCards, onSelect }) => {
  const handleSelect = (card) => {
    onSelect(prevState => ({ ...prevState, [card]: !prevState[card] }));
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
          <Text style={styles.modalTitle}>Selecione os Cards</Text>
          {Object.keys(selectedCards).map((card) => (
            <TouchableOpacity key={card} onPress={() => handleSelect(card)}>
              <Text style={styles.modalOption}>
                {card.charAt(0).toUpperCase() + card.slice(1)} {selectedCards[card] ? '✓' : ''}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalClose}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
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
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 15,
  },
  modalOption: {
    fontSize: 16,
    marginVertical: 10,
  },
  modalClose: {
    marginTop: 20,
    fontSize: 16,
    color: 'blue',
  },
});

export default CardSelectionModal;
