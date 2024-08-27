import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import HomeStyles from "../../../styles/screens/HomeScreenStyles";
import { Card } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import optionsStyles from "../../../styles/screens/OptionsScreenStyles";

const HelpModal = ({ visible, onClose }) => {
    const [goalColor, setGoalColor] = useState("blue");
    const [amountLeft, setAmountLeft] = useState(0);

    const renderProgressBar = () => {
        const spendingGoalValue = parseFloat(savedGoal) || 0;
        const percentage = (monthlyExpense / spendingGoalValue) * 100;
        const barColor = calculateBarColor(percentage);

        return (
            <View style={HomeStyles.progressBarContainer}>
                <View style={[HomeStyles.progressBar, { width: `${percentage}%`, backgroundColor: barColor }]} />
            </View>
        );
    };
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <Ionicons name="close" size={24} color="black" />
                    </TouchableOpacity>
                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                        <Text style={styles.modalTitle}>Ajuda - Visão Geral</Text>

                        <View style={styles.modalSection}>
                            <Text style={styles.modalSectionTitle}>Tela Inicial</Text>
                            <View style={HomeStyles.accountDivider} />

                            <View style={HomeStyles.balanceContainer}>
                                <View style={HomeStyles.textContainer}>
                                    <Text style={HomeStyles.balanceText}>Saldo</Text>
                                    <Text style={[HomeStyles.balanceAmount,]}>
                                        R$ 9.999,99

                                    </Text>
                                </View>
                            </View>

                            <View style={HomeStyles.summaryContainer}>
                                <Card
                                    style={HomeStyles.card}
                                >
                                    <Card.Content>
                                        <Text style={HomeStyles.cardTitle}>Receitas</Text>
                                        <Text style={HomeStyles.cardAmountIncome}>
                                            R$ 9.999,99
                                        </Text>
                                    </Card.Content>
                                </Card>
                                <Card
                                    style={HomeStyles.card}
                                >
                                    <Card.Content>
                                        <Text style={HomeStyles.cardTitle}>Despesas</Text>
                                        <Text style={HomeStyles.cardAmountExpense}>
                                            R$ 9.999,99
                                        </Text>
                                    </Card.Content>
                                </Card>
                            </View>
                            <Text style={styles.modalSectionText}>
                                Aqui você poderá ver os resumos de suas finanças.
                                Toque em "Receitas" ou "Despesas" para ver todas as receitas/despesas separadamente.
                            </Text>
                            <View style={HomeStyles.accountDivider} />

                            <Card style={HomeStyles.accountsCard} >
                                <Card.Content>
                                    <Text style={HomeStyles.cardTitle}>Meta de Gastos Mensais</Text>

                                    <View style={HomeStyles.monthlyBalanceItem}>

                                        <Text style={{ fontSize: 16 }}>
                                            Meta:
                                        </Text>

                                        <Text>R$ 9.999,99</Text>
                                    </View>
                                    <View style={HomeStyles.monthlyBalanceItem}>

                                        <Text style={{ fontSize: 16 }}>
                                            Gasto Mensal:
                                        </Text>
                                        <Text style={{ color: 'red' }}>R$ 9.999,99</Text>
                                    </View>
                                    {renderProgressBar}
                                    <Text style={{ color: goalColor, fontSize: 16 }}>
                                        Falta R$ 9.999,99 para alcançar a meta
                                    </Text>

                                </Card.Content>
                            </Card>
                            <Text style={styles.modalSectionText}>
                                Aqui você poderá definir um limite de gastos mensais.
                                Toque no card para abrir o menu de configuração de meta.
                            </Text>
                            <View style={HomeStyles.accountDivider} />

                            <Card style={HomeStyles.accountsCard}>
                                <Card.Content>
                                    <Text style={HomeStyles.accountsTitle}>Contas</Text>
                                        <View key={account.id} style={HomeStyles.accountItem}>

                                            <Text style={HomeStyles.accountName}>Banco do Brasil{'\n'}

                                                <Text
                                                    style={[
                                                        HomeStyles.accountAmount,
                                                    ]}
                                                >

                                                    Teste
                                                   


                                                </Text>
                                            </Text>


                                            <TouchableOpacity onPress={() => navigateToAddTransactionsAccount(account.id)} style={HomeStyles.addButton}>
                                                <MaterialIcons name="add" size={30} color="blue" />
                                            </TouchableOpacity>
                                        </View>
                                    <View style={HomeStyles.accountDivider} />
                                    <View style={HomeStyles.totalContainer}>
                                        <Text style={HomeStyles.totalText}>Total:</Text>
                                        <Text
                                            style={[
                                                HomeStyles.totalAmount,
                                                {
                                                    
                                                },
                                            ]}
                                        >
                                            {formatToBRL(parseFloat(Object.values(accountValues)
                                                .reduce((a, b) => a + b, 0)
                                                .toFixed(2)
                                                .replace(".", ",")))}
                                        </Text>
                                    </View>
                                </Card.Content>
                            </Card>


                            <Text style={styles.modalSectionText}>
                                Exibe uma lista das suas contas com o saldo atual de cada uma. Contas com saldo negativo são exibidas em vermelho, e contas com saldo positivo em azul.
                            </Text>
                            <Text style={styles.modalSectionSubtitle}>4. Balanço Mensal</Text>
                            <Text style={styles.modalSectionText}>
                                O balanço mensal mostra receitas, despesas e saldo do mês atual. Toque no card para abrir um modal com detalhes mais específicos.
                            </Text>
                            <Text style={styles.modalSectionSubtitle}>5. Navegação e Funcionalidades Adicionais</Text>
                            <Text style={styles.modalSectionText}>
                                Toque em "Receitas" ou "Despesas" para ver uma lista filtrada de transações.
                                O modal exibido quando você toca em "Balanço Mensal" permite que você visualize os totais por categoria ou conta.
                                Navegue entre os meses usando as setas no modal para ver os dados de meses anteriores ou futuros.
                            </Text>

                            <Text style={styles.modalSectionTitle}>Adicionar Transação </Text>
                            <Text style={styles.modalSectionText}>
                                A Tela de Adicionar Transação permite que você registre novas transações financeiras. Aqui está um resumo das funcionalidades:
                            </Text>
                            <Text style={styles.modalSectionSubtitle}>1. Tipo de Transação</Text>
                            <Text style={styles.modalSectionText}>
                                Escolha entre "Receita" ou "Despesa". O botão selecionado será destacado em azul (receita) ou vermelho (despesa).
                            </Text>
                            <Text style={styles.modalSectionSubtitle}>2. Descrição e Valor</Text>
                            <Text style={styles.modalSectionText}>
                                Informe a descrição da transação.
                                Insira o valor da transação, formatado com separadores de milhar e decimal.
                            </Text>
                            <Text style={styles.modalSectionSubtitle}>3. Data da Transação</Text>
                            <Text style={styles.modalSectionText}>
                                Escolha a data da transação usando um seletor de data.
                            </Text>
                            <Text style={styles.modalSectionSubtitle}>4. Conta e Categoria</Text>
                            <Text style={styles.modalSectionText}>
                                Selecione uma conta existente ou adicione uma nova conta.
                                Selecione uma categoria existente ou adicione uma nova categoria. As categorias são filtradas conforme o tipo de transação.
                            </Text>
                            <Text style={styles.modalSectionSubtitle}>5. Repetição de Transação</Text>
                            <Text style={styles.modalSectionText}>
                                Habilite a opção para tornar a transação recorrente. Configure a quantidade de repetições e o período (semanal ou mensal).
                            </Text>
                            <Text style={styles.modalSectionSubtitle}>6. Anexos</Text>
                            <Text style={styles.modalSectionText}>
                                Adicione imagens relacionadas à transação e visualize ou remova os anexos existentes.
                            </Text>
                            <Text style={styles.modalSectionSubtitle}>7. Botão de Salvar</Text>
                            <Text style={styles.modalSectionText}>
                                Salva a transação e retorna à tela anterior.
                            </Text>

                            <Text style={styles.modalSectionTitle}>Relatório</Text>
                            <Text style={styles.modalSectionText}>
                                A Tela de Estatísticas oferece uma visão detalhada das suas receitas e despesas filtradas. Aqui está um resumo das funcionalidades:
                            </Text>
                            <Text style={styles.modalSectionSubtitle}>1. Filtros</Text>
                            <Text style={styles.modalSectionText}>
                                Selecione entre "Todas", "Receitas" ou "Despesas" para filtrar as transações exibidas.
                                Escolha uma categoria específica para ver apenas transações dessa categoria ou selecione "Todas".
                                Filtre transações por conta, podendo escolher uma conta específica ou "Todas".
                                Defina um intervalo de datas para visualizar transações dentro desse período.
                            </Text>
                            <Text style={styles.modalSectionSubtitle}>2. Visão Geral</Text>
                            <Text style={styles.modalSectionText}>
                                Mostra a distribuição de receitas e despesas entre categorias selecionadas. Exibe percentual e valor total por categoria.
                                Lista detalhada de transações filtradas, incluindo conta, valor, categoria e data.
                            </Text>
                            <Text style={styles.modalSectionSubtitle}>3. Estatísticas</Text>
                            <Text style={styles.modalSectionText}>
                                Exibe o saldo total considerando apenas as transações filtradas.
                                Mostra a quantidade de receitas e despesas, o total de cada um e a média diária de receitas e despesas.
                            </Text>
                            <Text style={styles.modalSectionSubtitle}>4. Exportação</Text>
                            <Text style={styles.modalSectionText}>
                                Permite exportar os dados filtrados para análise externa.
                            </Text>

                            <Text style={styles.modalSectionTitle}> Transações</Text>
                            <Text style={styles.modalSectionText}>
                                A Tela de Transações mostra uma lista detalhada de todas as suas transações. Aqui está um resumo das funcionalidades:
                            </Text>
                            <Text style={styles.modalSectionSubtitle}>1. Filtros e Pesquisa</Text>
                            <Text style={styles.modalSectionText}>
                                Filtro opcional para "Receitas" ou "Despesas".
                                Pesquise transações por descrição, conta ou categoria.
                                Visualize transações do mês atual ou navegue entre os meses anteriores e futuros.
                            </Text>
                            <Text style={styles.modalSectionSubtitle}>2. Listagem de Transações</Text>
                            <Text style={styles.modalSectionText}>
                                Mostra uma lista das transações. Cada transação exibe descrição, valor, categoria e conta.
                                Se a transação for recorrente, o número da parcela e o total de parcelas são exibidos.
                            </Text>
                            <Text style={styles.modalSectionSubtitle}>3. Ações sobre Transações</Text>
                            <Text style={styles.modalSectionText}>
                                Toque em uma transação para vizualizar seus detalhes.
                            </Text>
                            <Text style={styles.modalSectionText}>
                                Toque e mantenha pressionado em uma transação para gerenciar a transação.
                            </Text>
                            <Text style={styles.modalSectionSubtitle}>4. Navegação</Text>
                            <Text style={styles.modalSectionText}>
                                Use os botões de navegação para visualizar transações em meses diferentes.
                            </Text>

                            <Text style={styles.modalSectionTitle}>Opções</Text>
                            <Text style={styles.modalSectionText}>
                                A Tela de Opções permite acessar várias configurações e funcionalidades adicionais do aplicativo.
                            </Text>
                            <Text style={styles.modalSectionSubtitle}>1. Gerir Contas Bancarias</Text>
                            <Text style={styles.modalSectionText}>
                                Permite adicionar novas contas ou gerenciar as contas existentes. Você poderá criar quaisquer tipo de "conta" aqui,
                                "Banco do Brasil", "Cartão de Credito", "NuBank", etc.
                            </Text>
                            <Text style={styles.modalSectionSubtitle}>2. Gerir Categorias</Text>
                            <Text style={styles.modalSectionText}>
                                Adicione novas categorias ou edite as existentes.
                            </Text>
                            <Text style={styles.modalSectionSubtitle}>3. Baixar Notas Fiscais</Text>
                            <Text style={styles.modalSectionText}>
                                Baixe suas notas fiscais e armazene-as localmente em formato PDF.
                            </Text>
                            <Text style={styles.modalSectionSubtitle}>4. Importar CSV</Text>
                            <Text style={styles.modalSectionText}>
                                Importe dados financeiros de um arquivo CSV.
                            </Text>
                            <Text style={styles.modalSectionSubtitle}>5. Gráficos</Text>
                            <Text style={styles.modalSectionText}>
                                Vizualize gráficos detalhados das suas finanças.
                            </Text>
                            <Text style={styles.modalSectionSubtitle}>6. Fazer Backup de Dados</Text>
                            <Text style={styles.modalSectionText}>
                                Crie um backup dos seus dados em um arquivo Zip contendo todos os dados e Notas Fiscais Salvas.
                            </Text>
                            <Text style={styles.modalSectionSubtitle}>7. Importar Backup de Dados</Text>
                            <Text style={styles.modalSectionText}>
                                Importe dados a partir de um arquivo Zip. Após a importação, o aplicativo será fechado e deverá ser reaberto.
                            </Text>
                            <Text style={styles.modalSectionSubtitle}>8. Ajuda</Text>
                            <Text style={styles.modalSectionText}>
                                Exibe este modal de ajuda, onde você pode encontrar uma visão geral detalhada das funcionalidades do aplicativo e orientações sobre como usá-lo.
                            </Text>
                            <Text style={styles.modalSectionSubtitle}>9. Limpar Todos os Dados</Text>
                            <Text style={styles.modalSectionText}>
                                Limpa todos os dados do aplicativo. Após a confirmação, todos os dados serão apagados.
                            </Text>


                        </View>
                    </ScrollView>
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparente para o fundo do modal
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 10,
        width: '100%',
        maxHeight: '100%',
        padding: 20,
    },
    modalTitle: {
        fontSize: 35,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',

    },
    modalSection: {
        marginBottom: 20,
    },
    modalSectionTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 5,
        textAlign: 'center',
        marginTop: 30,
    },
    modalSectionSubtitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 10,
    },
    modalSectionText: {
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 5,
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        marginLeft: 5,
    },
});

export default HelpModal;
