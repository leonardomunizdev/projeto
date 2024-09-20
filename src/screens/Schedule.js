import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import {
    useRoute,
    useFocusEffect,
} from "@react-navigation/native";
import TransactionsStyles from "../styles/screens/TransactionsScreenStyles";
import { useTransactions } from "../context/TransactionContext";
import HomeStyles from "../styles/screens/HomeScreenStyles";
import { useCategories } from "../context/CategoryContext";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { useAccounts } from "../context/AccountContext";
import { Ionicons } from "@expo/vector-icons";
import "moment/locale/pt-br";
import moment from "moment";

const Schedule = () => {
    const navigation = useNavigation();
    const { transactions, removeTransaction } = useTransactions();
    const { categories } = useCategories();
    const { accounts } = useAccounts();
    const route = useRoute();

    //FUNÇÃO PARA A SELEÇÃO DE MÊS 
    const [selectedMonth, setSelectedMonth] = useState(moment().startOf("month"));
    const changeMonth = (direction) => {
        setSelectedMonth((prevMonth) => prevMonth.clone().add(direction, "month"));
    };


    //FUNÇÃO PARA A BARRA DE PESQUISA
    const [searchText, setSearchText] = useState("");


    //FORMATAÇÃO DE DATA
    const formatDayOfWeek = (date) => {
        return moment(date, "YYYY-MM-DD").format("dddd, DD/MM/YYYY");
    };

    // FUNÇÕES PARA PEGAR OS NOMES DAS CONTAS E DAS CATEGORIAS
    const getAccountName = (accountId) => {
        const account = accounts.find((acc) => acc.id === accountId);
        return account ? account.name : "Conta desconhecida";
    };

    const getCategoryName = (categoryId) => {
        const category = categories.find((cat) => cat.id === categoryId);
        return category ? category.name : "Categoria desconhecida";
    };

    // FUNÇÃO DE FILTRO
    const [filterType, setFilterType] = useState(
        route.params?.filterType || undefined
    );

    const [filterAccount, setFilterAccount] = useState(
        route.params?.filterAccount || undefined
    );

    const [appliedFilters, setAppliedFilters] = useState({
        type: filterType,
        account: filterAccount,
        category: null,
    });

    useFocusEffect(
        useCallback(() => {
            const { filterType: receivedFilter, filterAccount: AccountFilter } = route.params || {};

            setAppliedFilters({
                type: receivedFilter,
                account: AccountFilter,
                category: null,
            });

            return () => {
                setAppliedFilters({
                    type: undefined,
                    account: undefined,
                    category: null,
                });
            };
        }, [route.params?.filterType, route.params?.filterAccount])
    );

    const applyFilter = (transactions) => {
        return transactions.filter((transaction) => {
            const categoryFilterMatches =
                !appliedFilters.category ||
                getCategoryName(transaction.categoryId) === appliedFilters.category;

            const descriptionMatches = transaction.description
                .toLowerCase()
                .includes(searchText.toLowerCase());

            const categoryMatches = getCategoryName(transaction.categoryId)
                .toLowerCase()
                .includes(searchText.toLowerCase());


            const accountName = getAccountName(transaction.accountId).toLowerCase();

            const accountMatches = accountName.includes(searchText.toLowerCase());
            const accountFilterMatches = !appliedFilters.account ||
                (appliedFilters.account.toLowerCase() === accountName ||
                    (accountName.includes(appliedFilters.account.toLowerCase()) &&
                        searchText.toLowerCase() !== accountName));

            return (
                moment(transaction.date, "YYYY-MM-DD").isSame(selectedMonth, "month") &&
                (!appliedFilters.type || transaction.type === appliedFilters.type) &&
                accountFilterMatches &&
                categoryFilterMatches &&
                (descriptionMatches || categoryMatches || accountMatches)
            );
        });
    };

    const filteredTransactions = applyFilter(transactions).sort((a, b) =>
        moment(a.date).diff(moment(b.date))
    );

    //FUNÇÃO PARA RESETAR OS FILTROS
    const clearAllFilters = () => {
        setAppliedFilters({
            type: null,
            account: null,
            category: null,
        });
        setSelectedAccount("");
        setSelectedCategory("");
    };

    //FUNÇÃO PARA RENDERIZAR A LISTA
    const renderItem = ({ item, index }) => {

        const dayOfWeek = formatDayOfWeek(item.date);
        const previousDate =
            index > 0 ? moment(filteredTransactions[index - 1].date).format("YYYY-MM-DD") : null;
        const currentDate = moment(item.date).format("YYYY-MM-DD");
        const isNewDay = previousDate !== currentDate;

        const recurrenceInfo = getCurrentInstallment(item);
        console.log(item.amount);
        return (

            <View>
                {isNewDay && <Text style={TransactionsStyles.dateHeader}>{dayOfWeek}</Text>}
                <TouchableOpacity
                    style={[
                        TransactionsStyles.item,
                        item.type === "expense" ? TransactionsStyles.expenseItem : TransactionsStyles.incomeItem,
                    ]}
                    // Permite edição ao clicar na transação
                    onPress={() => handleTransactionPress(item)}
                    onLongPress={() => handleDelete(item)}
                >
                    <View>
                        <View style={TransactionsStyles.row}>
                            <Text style={[TransactionsStyles.description]}>{item.description}</Text>
                            <Text style={TransactionsStyles.amount}>{formatCurrency(item.amount)}</Text>
                        </View>
                        <View style={TransactionsStyles.row}>
                            <Text style={TransactionsStyles.category}>
                                {getCategoryName(item.categoryId)} | {getAccountName(item.accountId)}
                            </Text>
                        </View>
                        {item.isRecurring && (
                            <Text style={TransactionsStyles.installment}>{recurrenceInfo}</Text>
                        )}
                    </View>
                </TouchableOpacity>
            </View>
        );
    };



    return (
        <View style={HomeStyles.container}>
            <View style={HomeStyles.monthYearSelector}>
                <TouchableOpacity
                    onPress={() => changeMonth(-1)}
                    style={TransactionsStyles.navButton}
                >
                    <Icon name="chevron-left" size={24} />
                </TouchableOpacity>
                <Text style={HomeStyles.monthYearText}>
                    {selectedMonth.format("MMMM YYYY")}
                </Text>
                <TouchableOpacity
                    onPress={() => changeMonth(1)}
                    style={TransactionsStyles.navButton}
                >
                    <Icon name="chevron-right" size={24} />
                </TouchableOpacity>
            </View>

            <View style={{}}>
                <TextInput
                    style={TransactionsStyles.searchInput}
                    placeholder="Pesquisar por descrição, Conta ou Categoria"
                    value={searchText}
                    onChangeText={setSearchText}
                />
                <TouchableOpacity onPress={() => setFilterModalVisible(true)} style={{ position: 'absolute', marginTop: '0.1%', marginLeft: '80%', paddingLeft: '10%' }}>
                    <Ionicons name="filter-circle-outline" size={40} />
                </TouchableOpacity>
            </View>
            <Text>Schedule</Text>

        </View>
    );
};

const styles = StyleSheet.create({





});

export default Schedule;