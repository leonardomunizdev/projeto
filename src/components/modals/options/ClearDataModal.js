import React, { useState, useEffect } from 'react';
import { Modal, View, Text, Button, Alert, BackHandler } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../../../styles/screens/OptionsScreenStyles';
import * as Updates from 'expo-updates';

const ClearDataModal = ({ visible, onCancel }) => {
  const [countdown, setCountdown] = useState(5); // Contagem regressiva de 5 segundos
  const [showCountdown, setShowCountdown] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);

  useEffect(() => {
    let interval;

    if (showCountdown && countdown > 0 && !isCancelled) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0 && !isCancelled) {
      clearInterval(interval);
      // Força a reinicialização e fecha o aplicativo após o delay
      setTimeout(() => {
        Updates.reloadAsync(); // Força a reinicialização do aplicativo
        BackHandler.exitApp(); // Simula o fechamento do aplicativo
      }, 1000); // Adiciona um pequeno atraso para garantir que a UI seja atualizada
    }

    return () => clearInterval(interval);
  }, [showCountdown, countdown, isCancelled]);

  const clearAllData = async () => {
    try {
      await AsyncStorage.clear();
      setCountdown(5); // Reseta a contagem regressiva para 5 segundos
      setIsCancelled(false); // Garante que a contagem não está cancelada
      setShowCountdown(true); // Começa a contagem regressiva
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao tentar limpar os dados.');
      console.error('Failed to clear AsyncStorage', error);
    }
  };

  const cancelCountdown = () => {
    setIsCancelled(true); // Marca a contagem como cancelada
    setShowCountdown(false); // Oculta o modal de contagem regressiva
    setCountdown(5); // Reseta a contagem regressiva para 5 segundos
    onCancel(); // Fecha o modal
  };

  const handleClearData = () => {
    clearAllData(); // Inicia a limpeza dos dados e a contagem regressiva
  };

  return (
    <Modal visible={visible} onRequestClose={onCancel}>
      <View style={styles.fullScreenModal}>
        <View style={styles.confirmModalContent}>
          {!showCountdown ? (
            <>
              <Text style={styles.confirmTitle}>Confirmar Limpeza de Dados</Text>
              <Text style={styles.confirmText}>
                Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.
              </Text>
              <View style={styles.buttonContainer}>
                <Button color="red" title="Limpar" onPress={handleClearData} />
                <Button title="Cancelar" onPress={onCancel} />
              </View>
            </>
          ) : (
            <>
              <Text style={styles.confirmTitle}>Confirmar Limpeza de Dados</Text>

              <Text style={styles.countdownText}>
                O aplicativo será reiniciado em <Text style={styles.countdownNumber}>{countdown}</Text> segundos. Abra-o novamente!
                {'\n'}
              </Text>
              <Button title="Cancelar" onPress={cancelCountdown} color="red" />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ClearDataModal;
