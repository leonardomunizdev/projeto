import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useCardVisibility = () => {
  const [cardVisibility, setCardVisibility] = useState({
    
    SpendingLimitCard: true,
    AccountsCard: true,
    MonthlyBalanceCard: true
  });

  useEffect(() => {
    const loadCardVisibility = async () => {
      try {
        const savedVisibility = await AsyncStorage.getItem('cardVisibility');
        if (savedVisibility !== null) {
          setCardVisibility(JSON.parse(savedVisibility));
        }
      } catch (error) {
        console.error("Erro ao carregar a visibilidade dos cards", error);
      }
    };

    loadCardVisibility();
  }, []);

  useEffect(() => {
    const saveCardVisibility = async () => {
      try {
        await AsyncStorage.setItem('cardVisibility', JSON.stringify(cardVisibility));
      } catch (error) {
        console.error("Erro ao salvar a visibilidade dos cards", error);
      }
    };

    saveCardVisibility();
  }, [cardVisibility]);

  return [cardVisibility, setCardVisibility];
};

export default useCardVisibility;
