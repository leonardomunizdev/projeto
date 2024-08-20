import React, { createContext, useContext, useState, useEffect  } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTransactions } from './TransactionContext';

const CategoryContext = createContext();


export const CategoryProvider = ({ children }) => {

  const [categories, setCategories] = useState([]);
  const {transactions, setTransactions} = useTransactions();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const storedCategories = await AsyncStorage.getItem('categories');
        if (storedCategories) {
          setCategories(JSON.parse(storedCategories));
        }
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const saveCategories = async () => {
      try {
        await AsyncStorage.setItem('categories', JSON.stringify(categories));
      } catch (error) {
        console.error('Erro ao salvar contas:', error);
      }
    };
    saveCategories();
  }, [categories]);

  const addCategory = (name, type) => {
    // Verifica se a categoria já existe
    const existingCategory = categories.find((category) => category.name === name);
    if (existingCategory) {
      return existingCategory.id; // Retorna o ID existente
    }
  
    // Adiciona uma nova categoria se não existir
    const newCategory = { id: Date.now().toString(), name, type };
    setCategories((prevCategories) => [...prevCategories, newCategory]);
    return newCategory.id;
  };
  
  

  const r = (id) => {
    setCategories((prevCategory) => prevCategory.filter(category => category.id !== id));
  };

  const removeCategory = (categoryId) => {
    //Filtra todas as transações que não estão ligadas à conta a ser removida
    const updatedTransactions = transactions.filter(
      (transaction) => transaction.categoryId !== categoryId
    );

    setTransactions(updatedTransactions);

    //Remove a conta
    const updatedCategories = categories.filter((category) => category.id !== categoryId);
    setCategories(updatedCategories);
  };

  return (
    <CategoryContext.Provider value={{ categories, addCategory, removeCategory }}>
      {children}
    </CategoryContext.Provider>
  );
};
export const useCategories = () => useContext(CategoryContext);
