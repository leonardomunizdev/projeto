import { useState, useEffect } from 'react';
import { useTransactions } from '../context/TransactionContext';

const {transactions} = useTransactions;
const useFilterTransactions = (transactions, filters) => {
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  useEffect(() => {
    console.log('useEffect triggered');
    const { selectedCategory, selectedAccount, selectedType, startDate, endDate } = filters;
    
    const filtered = transactions.filter((transaction) => {
      const matchCategory = selectedCategory === 'all' || transaction.categoryId === selectedCategory;
      const matchAccount = selectedAccount === 'all' || transaction.accountId === selectedAccount;
      const matchType = selectedType === 'all' || transaction.type === selectedType;
  
      const matchStartDate = !startDate || new Date(transaction.date) >= startDate;
      const matchEndDate = !endDate || new Date(transaction.date) <= endDate;
  
      return matchCategory && matchAccount && matchType && matchStartDate && matchEndDate;
    });
  
    setFilteredTransactions(filtered);
  }, [transactions, filters]);
  

  return filteredTransactions;
};

export default useFilterTransactions;
