import { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity } from 'react-native';
import HomeStyles from '../../../styles/screens/HomeScreenStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MonthLimitModal = ({ visible, onClose, onSavedGoal, onSaveGoal }) => {

  const [spendingGoal, setSpendingGoal] = useState("");
  const [savedGoal, setSavedGoal] = useState(0);

  const saveGoal = () => {
    onSaveGoal(convertToAmerican(spendingGoal));
    onClose();
  };


  const formatValue = (value) => {
    // Remove caracteres não numéricos
    value = value.replace(/\D/g, '');

    // Certifique-se de que o valor tenha no mínimo 3 dígitos
    value = value.padStart(3, '0');

    // Separa a parte inteira da parte decimal
    const integerPart = value.slice(0, -2);
    const decimalPart = value.slice(-2);

    // Formata a parte inteira com pontos de milhar
    const formattedInteger = integerPart
      .split('')
      .reverse()
      .reduce((acc, digit, index) => {
        return digit + (index && index % 3 === 0 ? '.' : '') + acc;
      }, '');

    // Combina a parte inteira e a parte decimal
    return `${formattedInteger},${decimalPart}`;
  };

  const handleChange = (text) => {
    const formattedValue = formatValue(text);
    const cleanedValue = formattedValue.replace(/^0+(?!,)/, '');
    setSpendingGoal(cleanedValue);
  };

  const convertToAmerican = (value) => {
    // Remove caracteres não numéricos
    value = value.replace(/\D/g, '');

    // Adiciona zeros à esquerda, se necessário
    value = value.padStart(3, '0');

    // Adiciona pontos e vírgulas conforme necessário
    const integerPart = value.slice(0, -2); // Parte inteira
    const decimalPart = value.slice(-2);   // Parte decimal

    // Combina a parte inteira e a parte decimal para o formato americano
    return `${integerPart}.${decimalPart}`;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={HomeStyles.ModalGoalsContainer}>
        <View style={HomeStyles.ModalGoalsContent}>
          <Text style={HomeStyles.ModalGoalsTitle}>Configurar Limite de Gastos</Text>

          <TextInput
            style={HomeStyles.ModalGoalsInput}
            placeholder="Digite o limite de gastos"
            keyboardType="numeric"
            value={spendingGoal}
            onChangeText={handleChange} // Passar handleChange diretamente
          />

          <View style={HomeStyles.ModalGoalsButtons}>
            <TouchableOpacity style={HomeStyles.ModalGoalsSaveButton} onPress={saveGoal}>
              <Text style={HomeStyles.ModalGoalsSaveButtonText}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={HomeStyles.ModalGoalsCancelButton} onPress={onClose}>
              <Text style={HomeStyles.ModalGoalsCancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default MonthLimitModal;