import React, { createContext, useContext, useState, useEffect  } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CategoryContext = createContext();


export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);

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
    setCategories((prevCategories) => [
      ...prevCategories,
      { id: Date.now().toString(), name, type },
    ]);
  };
  

  const removeCategory = (id) => {
    setCategories((prevCategory) => prevCategory.filter(category => category.id !== id));
  };
  
  return (
    <CategoryContext.Provider value={{ categories, addCategory, removeCategory }}>
      {children}
    </CategoryContext.Provider>
  );
};
export const useCategories = () => useContext(CategoryContext);
