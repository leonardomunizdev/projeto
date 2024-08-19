import React, { useState, useMemo } from 'react';
import { Modal, View, Text, ScrollView, Dimensions, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { PieChart } from 'react-native-chart-kit';  // Biblioteca de gráficos
import { useAccounts } from '../../../context/AccountContext';
import { useTransactions } from '../../../context/TransactionContext';
import { useCategories } from '../../../context/CategoryContext';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

const ChartsModal = ({ visible, onClose }) => {
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();
  const { categories } = useCategories();
  const [selectedOption, setSelectedOption] = useState('Despesas por categoria');
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const options = [
    'Despesas por categoria',
    'Despesas por conta',
    'Receitas por categoria',
    'Receitas por conta',
    'Receita X Despesa'  // Nova opção
  ];

  const handleMonthChange = (increment) => {
    const newMonth = new Date(selectedMonth.setMonth(selectedMonth.getMonth() + increment));
    setSelectedMonth(new Date(newMonth));
  };

  const filteredTransactions = useMemo(() => {
    const startOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const endOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
    return transactions.filter(t => new Date(t.date) >= startOfMonth && new Date(t.date) <= endOfMonth);
  }, [transactions, selectedMonth]);

  const generateColor = (index) => {
    const colors = ['#4caf50', '#f44336', '#2196f3', '#ffeb3b', '#ff9800', '#9c27b0', '#00bcd4'];
    return colors[index % colors.length];
  };

  const getChartData = () => {
    if (selectedOption === 'Receita X Despesa') {
      const totalIncome = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const totalExpense = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      return [
        { name: 'Receitas', total: totalIncome, color: '#4caf50' },
        { name: 'Despesas', total: totalExpense, color: '#f44336' },
      ];
    }

    const data = [];
    const isExpense = selectedOption.includes('Despesa');
    const isCategory = selectedOption.includes('categoria');

    const groupedData = filteredTransactions.reduce((acc, transaction) => {
      const isRelevantTransaction = (isExpense && transaction.type === 'expense') ||
                                    (!isExpense && transaction.type === 'income');
      if (!isRelevantTransaction) return acc;

      const key = isCategory ? transaction.categoryId : transaction.accountId;
      const group = isCategory ? categories : accounts;
      const item = group.find(i => i.id === key);
      if (item) {
        const existing = acc.find(entry => entry.name === item.name);
        if (existing) {
          existing.total += transaction.amount;
        } else {
          acc.push({
            name: item.name,
            total: transaction.amount,
            color: generateColor(acc.length),
          });
        }
      }
      return acc;
    }, []);

    return groupedData;
  };

  const chartData = getChartData();

  // Calcular o total geral para calcular as porcentagens
  const totalAmount = chartData.reduce((sum, item) => sum + item.total, 0);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
        >
          <Ionicons name="close" size={24} color="black" />
        </TouchableOpacity>
        
        <View style={styles.fixedContainer}>
          <Text style={styles.title}>Gráficos</Text>

          <View style={styles.selectionSection}>
            <FlatList
              data={options}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.carouselButton,
                    item === selectedOption && styles.selectedButton,
                  ]}
                  onPress={() => setSelectedOption(item)}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      item === selectedOption && styles.selectedButtonText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>

          <View style={styles.dateSelector}>
            <TouchableOpacity onPress={() => handleMonthChange(-1)}>
              <Ionicons name="chevron-back" size={24} color="black" />
            </TouchableOpacity>
            <View style={styles.monthTextContainer}>
              <Text style={styles.monthText}>
                {selectedMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleMonthChange(1)}>
              <Ionicons name="chevron-forward" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Gráfico de {selectedOption}</Text>
          <View style={styles.chartContainer}>
            <PieChart
              data={chartData}
              width={screenWidth * 1}
              height={220}
              chartConfig={chartConfig}
              accessor="total"
              backgroundColor="transparent"
              paddingLeft="0"
              center={[0, 0]}
              absolute
              hasLegend={false}
              innerRadius={40}
              outerRadius={"80%"}
            />
          </View>

          <Text style={styles.sectionTitle}>Lista de {selectedOption}</Text>
        </View>

        <ScrollView style={styles.listScrollContainer}>
          <View style={styles.listContainer}>
            {chartData.map((item, index) => {
              const percentage = ((item.total / totalAmount) * 100).toFixed(2);
              return (
                <View key={index} style={[styles.listItem, { borderLeftColor: item.color }]}>
                  <View style={[styles.colorIndicator]} />
                  <Text style={styles.itemText}>{item.name}: R$ {item.total.toFixed(2)} ({percentage}%)</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const chartConfig = {
  backgroundColor: '#e26a00',
  backgroundGradientFrom: '#fb8c00',
  backgroundGradientTo: '#ffa726',
  decimalPlaces: 2,
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#ffa726',
  },
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  fixedContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  selectionSection: {
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  carouselButton: {
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#ddd',
  },
  selectedButton: {
    backgroundColor: '#ffa726',
  },
  buttonText: {
    fontSize: 16,
    color: '#333',
  },
  selectedButtonText: {
    color: '#fff',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthTextContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginHorizontal: 100,
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  chartContainer: {
    width: '50%',
    marginBottom: 20,
  },
  listScrollContainer: {
    flex: 1,
    width: '100%',
    
  },
  listContainer: {
    alignSelf: 'flex-start',
    width: '100%',
    
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomColor: '#ccc',
    marginBottom: 10,
    borderLeftWidth: 5,
  },
  colorIndicator: {
    width: 10,
    height: 10,
    marginRight: 10,
  },
  itemText: {
    fontSize: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
});

export default ChartsModal;
