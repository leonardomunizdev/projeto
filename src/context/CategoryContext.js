import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTransactions } from './TransactionContext';

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const { transactions, setTransactions } = useTransactions();

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
        console.error('Erro ao salvar categorias:', error);
      }
    };
    saveCategories();
  }, [categories]);

  const addCategory = (name, type) => {
    const existingCategory = categories.find(category => category.name === name && category.type === type);
    if (existingCategory) {
      return existingCategory.id; // Retorna a ID da categoria existente
    }
    const newCategory = { id: Date.now().toString(), name, type };
    setCategories(prevCategories => [...prevCategories, newCategory]);
    return newCategory.id;
  };

  const removeCategory = (categoryId) => {
    const updatedTransactions = transactions.filter(
      (transaction) => transaction.categoryId !== categoryId
    );

    setTransactions(updatedTransactions);

    const updatedCategories = categories.filter((category) => category.id !== categoryId);
    setCategories(updatedCategories);
  };
  const updateCategory = (id, newName) => {
    const updatedCategories = categories.map(category => 
      category.id === id ? { ...category, name: newName } : category
    );
    setCategories(updatedCategories);
  };
  return (
    <CategoryContext.Provider value={{ categories, addCategory, removeCategory, updateCategory }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => useContext(CategoryContext);
