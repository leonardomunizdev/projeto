import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import HomeStyles from "../../../styles/screens/HomeScreenStyles";
import { Card } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import optionsStyles from "../../../styles/screens/OptionsScreenStyles";
import addTransactionsStyles from "../../../styles/screens/addTransactionsScreenStyles";
import { Picker } from "@react-native-picker/picker";
import { Switch } from "react-native-elements";
import Icon from "react-native-vector-icons/MaterialIcons";
import statisticsStyles from "../../../styles/screens/StatisticsScreenStyles";
import TransactionsStyles from "../../../styles/screens/TransactionsScreenStyles";

const HelpModal = ({ visible, onClose }) => {




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
                        <Text style={styles.modalTitle}>Bem Vindo!</Text>
                        <View style={HomeStyles.accountDivider} />
                            <Text style={styles.modalSectionText}> Este é o meu de ajuda que irá te guiar em seus passos iniciais no 
                                aplicativo, caso surja duvidas novamente no futuro, vá para a tela de opções que ele estará lá!</Text>
                        <View style={HomeStyles.accountDivider} />

                        <View style={styles.modalSection}>
                            <Text style={styles.modalSectionTitle}>Tela Inicial</Text>
                            <Text style={styles.modalSectionText}>
                                Esta tela dará um visão geral das finanças do usuario.
                            </Text>
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
                                    <Text style={HomeStyles.cardTitle}>limite de Gastos Mensais</Text>

                                    <View style={HomeStyles.monthlyBalanceItem}>

                                        <Text style={{ fontSize: 16 }}>
                                            limite:
                                        </Text>

                                        <Text>R$ 9.999,99</Text>
                                    </View>
                                    <View style={HomeStyles.monthlyBalanceItem}>

                                        <Text style={{ fontSize: 16 }}>
                                            Gasto Mensal:
                                        </Text>
                                        <Text style={{ color: 'red' }}>R$ 9.999,99</Text>
                                    </View>
                                    <Text style={{ color: 'red', fontSize: 16 }}>
                                        Falta R$ 9.999,99 para alcançar o Limite
                                    </Text>

                                </Card.Content>
                            </Card>
                            <Text style={styles.modalSectionText}>
                                Aqui você poderá definir um limite de gastos mensais.
                                Toque no card para abrir o menu de configuração de limite.
                            </Text>
                            <View style={HomeStyles.accountDivider} />

                            <Card style={HomeStyles.accountsCard}>
                                <Card.Content>
                                    <Text style={HomeStyles.accountsTitle}>Contas</Text>
                                    <View style={HomeStyles.accountItem}>
                                        <Text style={HomeStyles.accountName}>Banco do Brasil{'\n'}
                                            <Text style={[HomeStyles.accountAmount, { color: "blue" }]}> R$ 9.999,99 </Text>
                                        </Text>
                                        <MaterialIcons name="add" size={30} color="blue" />
                                    </View>
                                    <View style={HomeStyles.accountItem}>
                                        <Text style={HomeStyles.accountName}>Conta Corrente{'\n'}
                                            <Text style={[HomeStyles.accountAmount, { color: "red" }]}> R$ 9.999,99 </Text>
                                        </Text>
                                        <MaterialIcons name="add" size={30} color="blue" />
                                    </View>
                                    <View style={HomeStyles.accountDivider} />
                                    <View style={HomeStyles.totalContainer}>
                                        <Text style={HomeStyles.totalText}>
                                            Total:
                                        </Text>
                                        <Text style={[HomeStyles.totalAmount, { color: "blue" }]}>
                                            R$ 9.999,99
                                        </Text>
                                    </View>
                                </Card.Content>
                            </Card>


                            <Text style={styles.modalSectionText}>
                                Exibe uma lista das suas contas com o saldo atual de cada uma. Contas com saldo negativo são exibidas em vermelho, e contas com saldo positivo em azul.
                                toque no botão " + " Para adicionar uma nova transação a conta.
                            </Text>
                            <View style={HomeStyles.accountDivider} />


                            <Card style={HomeStyles.monthlyBalanceCard} >
                                <Card.Content>
                                    <Text style={HomeStyles.monthlyBalanceTitle}>Balanço Mensal</Text>
                                    <View style={HomeStyles.monthlyBalanceContent}>
                                        <View style={HomeStyles.monthlyBalanceItem}>
                                            <Text style={HomeStyles.monthlyBalanceLabel}>Receitas:</Text>
                                            <Text style={[HomeStyles.monthlyBalanceValue, { color: "blue" }]}>

                                                R$ 9.999,99

                                            </Text>
                                        </View>
                                        <View style={HomeStyles.monthlyBalanceItem}>
                                            <Text style={HomeStyles.monthlyBalanceLabel}>Despesas:</Text>
                                            <Text style={[HomeStyles.monthlyBalanceValue, { color: "red" }]}>
                                                R$ 9.999,99

                                            </Text>
                                        </View>
                                        <View style={HomeStyles.accountDivider} />

                                        <View style={HomeStyles.monthlyBalanceItem}>
                                            <Text style={HomeStyles.monthlyBalanceLabel}>Balanço:</Text>
                                            <Text
                                                style={[
                                                    HomeStyles.monthlyBalanceValue,
                                                    { color: "red" },
                                                ]}
                                            >
                                                R$ 9.999,99

                                            </Text>
                                        </View>
                                    </View>
                                </Card.Content>
                            </Card>
                            <Text style={styles.modalSectionText}>
                                O balanço mensal mostra receitas, despesas e saldo do mês atual. Toque no card para abrir um modal com detalhes mais específicos.
                            </Text>
                            <View style={HomeStyles.accountDivider} />


                            <Text style={styles.modalSectionTitle}>Adicionar Transação </Text>
                            <Text style={styles.modalSectionText}>
                                A Tela de Adicionar Transação permite que você registre novas transações financeiras. Aqui está um resumo das funcionalidades:
                            </Text>
                            <View style={HomeStyles.accountDivider} />

                            <View style={addTransactionsStyles.transactionTypeContainer}>

                                <TouchableOpacity disabled={true} style={[addTransactionsStyles.transactionButton, { backgroundColor: "red" }]}
                                >
                                    <Text style={[addTransactionsStyles.transactionButtonText,]}>Receita</Text>
                                </TouchableOpacity>
                                <TouchableOpacity disabled={true} style={[addTransactionsStyles.transactionButton, { backgroundColor: "blue" }]}

                                >
                                    <Text style={addTransactionsStyles.transactionButtonText}>Despesa</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.modalSectionText}>
                                Escolha entre "Receita" ou "Despesa". O botão selecionado será destacado em azul (receita) ou vermelho (despesa).
                            </Text>
                            <View style={HomeStyles.accountDivider} />

                            <TextInput
                                style={addTransactionsStyles.input}
                                placeholder="Descrição"
                                editable={false}
                            />
                            <TextInput
                                style={addTransactionsStyles.input}
                                placeholder="Valor"
                                editable={false}
                            />
                            <Text style={styles.modalSectionText}>
                                Informe a descrição da transação e o valor da mesma. Lembre-se que não há necessidade de colocar sinais (+ ou -).
                            </Text>
                            <View style={HomeStyles.accountDivider} />
                            <TouchableOpacity
                                style={{ color: "white", backgroundColor: "blue", padding: 10, borderRadius: 5 }}

                                disabled={true}
                            >
                                <TextInput
                                    style={addTransactionsStyles.datePickerInput}
                                    placeholder="Data"
                                    value={"30/12/2024"}
                                    editable={false}
                                    pointerEvents="none"
                                />
                            </TouchableOpacity>
                            <Text style={styles.modalSectionText}>
                                Escolha a data da transação usando um seletor de data.
                            </Text>
                            <View style={HomeStyles.accountDivider} />
                            <View style={addTransactionsStyles.pickerContainer}>
                                <Picker
                                    style={addTransactionsStyles.picker}
                                    enabled={false}
                                >
                                    <Picker.Item label="Selecione uma categoria" value="" />

                                </Picker>
                                <TouchableOpacity disabled={true} style={addTransactionsStyles.addButton}>
                                    <MaterialIcons name="add" size={24} color="blue" />
                                </TouchableOpacity>

                            </View>
                            <View style={addTransactionsStyles.pickerContainer}>
                                <Picker
                                    style={addTransactionsStyles.picker}
                                    enabled={false}
                                >
                                    <Picker.Item label="Selecione uma conta" value="" />

                                </Picker>
                                <TouchableOpacity disabled={true} style={addTransactionsStyles.addButton}>
                                    <MaterialIcons name="add" size={24} color="blue" />
                                </TouchableOpacity>

                            </View>
                            <Text style={styles.modalSectionText}>
                                Selecione uma conta ou categoria existente ou adicione novas.
                                As categorias são filtradas conforme o tipo de transação.
                            </Text>
                            <View style={HomeStyles.accountDivider} />

                            <View style={addTransactionsStyles.switchContainer}>
                                <Text style={addTransactionsStyles.switchText}>Repetir</Text>
                                <Switch
                                    disabled={true}
                                    thumbColor={"grey"}
                                />
                            </View>
                            <Text style={styles.modalSectionText}>
                                Habilite a opção para tornar a transação recorrente. Configure a quantidade de repetições e o período (semanal ou mensal).
                            </Text>
                            <View style={HomeStyles.accountDivider} />

                            <TouchableOpacity
                                disabled={true} style={{ color: "white", backgroundColor: "blue", padding: 10, borderRadius: 5 }}
                            >
                                <Text style={addTransactionsStyles.addAttachmentButtonText}>Adicionar Anexo</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalSectionText}>
                                Adicione imagens relacionadas à transação e visualize ou remova os anexos existentes.
                            </Text>
                            <View style={HomeStyles.accountDivider} />

                            <TouchableOpacity
                                disabled={true} style={{ color: "white", backgroundColor: "blue", padding: 10, borderRadius: 5 }}
                            >
                                <Text style={addTransactionsStyles.addAttachmentButtonText}>Salvar</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalSectionText}>
                                Salva a transação e a registra na tela de transações.
                            </Text>
                            <View style={HomeStyles.accountDivider} />


                            <Text style={styles.modalSectionTitle}>Relatório</Text>
                            <Text style={styles.modalSectionText}>
                                Esta tela Mostra a distribuição de receitas e despesas entre categorias selecionadas. Exibe percentual e valor total por categoria.
                                Lista detalhada de transações filtradas, incluindo conta, valor, categoria e data.
                            </Text>
                            <View style={HomeStyles.accountDivider} />

                            <View style={{ justifyContent: 'center', flexDirection: 'row', paddingTop: 20, paddingBottom: 20 }}>
                                <TouchableOpacity disabled={true} style={statisticsStyles.iconButton}>
                                    <Icon name="filter-list" size={24} color="#000" />
                                </TouchableOpacity>

                                <TouchableOpacity disabled={true} style={statisticsStyles.iconButton}>
                                    <Icon name="download" size={24} color="#000" />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.modalSectionText}>
                                Filtros e Downloands. Ao tocar na opção de filtros, você poderá definir filtros para a vizualização do seu relatório.
                                Ao tocar na opção de download você poderá exportar o relatório de acordo com os seus padrões.
                            </Text>
                            <View style={HomeStyles.accountDivider} />


                            <Text style={styles.modalSectionTitle}> Transações</Text>
                            <Text style={styles.modalSectionText}>
                                A Tela de Transações mostra uma lista detalhada de todas as suas transações. Aqui está um resumo das funcionalidades:
                            </Text>
                            <View style={HomeStyles.accountDivider} />

                            <TextInput
                                editable={false}
                                style={TransactionsStyles.searchInput}
                                placeholder="Pesquisar por descrição, Conta ou Categoria"
                            />
                            <Text style={styles.modalSectionText}>
                                Pesquise transações por descrição, conta ou categoria.
                                Visualize transações do mês atual ou navegue entre os meses anteriores e futuros.
                            </Text>
                            <View style={HomeStyles.accountDivider} />
                            <TouchableOpacity
                                style={[
                                    TransactionsStyles.item, TransactionsStyles.incomeItem
                                ]}
                                disabled={true}
                            >
                                <View>
                                    <View style={TransactionsStyles.row}>
                                        <Text style={[TransactionsStyles.description]}>Recebimento de Salario</Text>
                                        <Text style={TransactionsStyles.amount}>R$ 9.999,99</Text>
                                    </View>
                                    <View style={TransactionsStyles.row}>
                                        <Text style={TransactionsStyles.category}>
                                            Salario | Banco do Brasil
                                        </Text>
                                    </View>

                                    <Text style={TransactionsStyles.installment}>Parcela (1/3)</Text>

                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                disabled={true}
                                style={[
                                    TransactionsStyles.item, TransactionsStyles.expenseItem
                                ]}

                            >
                                <View>
                                    <View style={TransactionsStyles.row}>
                                        <Text style={[TransactionsStyles.description]}>Lanches</Text>
                                        <Text style={TransactionsStyles.amount}>R$ 9.999,99</Text>
                                    </View>
                                    <View style={TransactionsStyles.row}>
                                        <Text style={TransactionsStyles.category}>
                                            Alimentação | Banco do Brasil
                                        </Text>
                                    </View>
                                </View>

                            </TouchableOpacity>
                            <Text style={styles.modalSectionText}>
                                Mostra uma lista das transações. Cada transação exibe descrição, valor, categoria e conta.
                                Se a transação for recorrente, o número da parcela e o total de parcelas são exibidos.{'\n'}
                                --Toque em uma transação para vizualizar seus detalhes.{'\n'}
                                --Toque e mantenha pressionado em uma transação para gerenciar a transação.
                            </Text>

                            <View style={TransactionsStyles.footer}>
                                <TouchableOpacity
                                    disabled={true}
                                    style={TransactionsStyles.navButton}
                                >
                                    <Text style={TransactionsStyles.navButtonText}>Anterior</Text>
                                </TouchableOpacity>
                                <Text style={TransactionsStyles.footerTitle}>
                                    Agosto 2024
                                </Text>
                                <TouchableOpacity
                                    disabled={true}
                                    style={TransactionsStyles.navButton}
                                >
                                    <Text style={TransactionsStyles.navButtonText}>Próximo</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.modalSectionText}>
                                Use os botões de navegação para visualizar transações em meses diferentes.
                            </Text>
                            <View style={HomeStyles.accountDivider} />

                            <Text style={styles.modalSectionTitle}>Opções</Text>
                            <Text style={styles.modalSectionText}>
                                A Tela de Opções permite acessar várias configurações e funcionalidades adicionais do aplicativo.
                            </Text>
                            <View style={HomeStyles.accountDivider} />

                            <TouchableOpacity disabled={true} style={optionsStyles.optionButton}>
                                <Ionicons name="wallet" size={24} color="black" />
                                <Text style={optionsStyles.optionText}>Gerir Contas Bancarias</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalSectionText}>
                                Permite adicionar novas contas ou gerenciar as contas existentes. Você poderá criar quaisquer tipo de "conta" aqui,
                                "Banco do Brasil", "Cartão de Credito", "NuBank", etc.
                            </Text>
                            <View style={HomeStyles.accountDivider} />

                            <TouchableOpacity disabled={true} style={optionsStyles.optionButton}>
                                <Ionicons name="list" size={24} color="black" />
                                <Text style={optionsStyles.optionText}>Gerir Categorias</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalSectionText}>
                                Adicione novas categorias ou edite as existentes.
                            </Text>
                            <View style={HomeStyles.accountDivider} />
                            <TouchableOpacity  disabled={true} style={optionsStyles.optionButton} >
                                <Ionicons name="download" size={24} color="black" />
                                <Text style={optionsStyles.optionText}>Baixar Notas Fiscais</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalSectionText}>
                                Baixe suas notas fiscais e armazene-as localmente em formato PDF.
                            </Text>
                            <View style={HomeStyles.accountDivider} />

                            <TouchableOpacity disabled={true} style={optionsStyles.optionButton} >
                                <Ionicons name="folder-open" size={24} color="black" />
                                <Text style={optionsStyles.optionText}>Importar CSV</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalSectionText}>
                                Importe dados financeiros de um arquivo CSV.
                            </Text>
                            <View style={HomeStyles.accountDivider} />

                            <TouchableOpacity disabled={true} style={optionsStyles.optionButton} >
                                <Ionicons name="stats-chart" size={24} color="black" />
                                <Text style={optionsStyles.optionText}>Gráficos</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalSectionText}>
                                Vizualize gráficos detalhados das suas finanças.
                            </Text>
                            <View style={HomeStyles.accountDivider} />

                            <TouchableOpacity disabled={true} style={optionsStyles.optionButton} >
                                <Ionicons name="cloud-upload" size={24} color="black" />
                                <Text style={optionsStyles.optionText}>Fazer Backup de dados</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalSectionText}>
                                Crie um backup dos seus dados em um arquivo Zip contendo todos os dados e Notas Fiscais Salvas.
                            </Text>
                            <View style={HomeStyles.accountDivider} />

                            <TouchableOpacity disabled={true} style={optionsStyles.optionButton}>
                                <Ionicons name="cloud-download" size={24} color="black" />
                                <Text style={optionsStyles.optionText}>Importar Backup de dados</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalSectionText}>
                                Importe dados a partir de um arquivo Zip. Após a importação, o aplicativo será fechado e deverá ser reaberto.
                            </Text>
                            <View style={HomeStyles.accountDivider} />

                            <TouchableOpacity disabled={true} style={optionsStyles.optionButton} >
                                <Ionicons name="help-circle-outline" size={24} color="black" />
                                <Text style={optionsStyles.optionText}>Ajuda</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalSectionText}>
                                Exibe este modal de ajuda, onde você pode encontrar uma visão geral detalhada das funcionalidades do aplicativo e orientações sobre como usá-lo.
                            </Text>
                            <View style={HomeStyles.accountDivider} />

                            <TouchableOpacity disabled={true} style={optionsStyles.optionButton} >
                                <Ionicons name="trash" size={24} color="red" />
                                <Text style={optionsStyles.optionText}>Limpar Todos os Dados</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalSectionText}>
                                Limpa todos os dados do aplicativo. Após a confirmação, todos os dados serão apagados.
                            </Text>


                        </View>
                    </ScrollView>
                </View>
            </View >
        </Modal >
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
