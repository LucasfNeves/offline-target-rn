import { Button } from "@/components/Button";
import { List } from "@/components/List";
import { Loading } from "@/components/Loading";
import { PageHeader } from "@/components/PageHeader";
import { Progress } from "@/components/Progress";
import { Transaction, TransactionProps } from "@/components/Transaction";
import { useTargetDatabase } from "@/database/useTargetDatabase";
import { useTransactionsDatabase } from "@/database/useTransactionsDatabase";
import { numberToCurrency } from "@/utils/numberToCurrency";
import { TransactionTypes } from "@/utils/TransactionTypes";
import dayjs from "dayjs";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, View } from "react-native";

export default function InProgress() {
  const [fetching, setFetching] = useState(true);
  const [details, setDetails] = useState({
    name: "",
    current: "R$ 580,00",
    target: "R$ 1.780,00",
    percentage: 25,
  });
  const [transactions, setTransactions] = useState<TransactionProps[]>([]);
  const params = useLocalSearchParams<{ id: string }>();

  const targetDataBase = useTargetDatabase();
  const transactionsDataBase = useTransactionsDatabase();

  async function fetchTargetDetails() {
    try {
      const response = await targetDataBase.show(Number(params.id));

      setDetails({
        name: response.name,
        current: numberToCurrency(response.current),
        target: numberToCurrency(response.amount),
        percentage: response.percentage,
      });
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar os detalhes da meta.");
      console.log(error);
    }
  }

  async function fetchTransactions() {
    try {
      const response = await transactionsDataBase.listByTargetId(
        Number(params.id)
      );

      setTransactions(
        response.map((item) => ({
          id: String(item.id),
          value: numberToCurrency(item.amount),
          date: dayjs(item.created_at).format("DD/MM/YYYY [às] HH:mm:ss"),
          description: item.observation || "",
          type:
            item.amount > 0 ? TransactionTypes.Input : TransactionTypes.Output,
        }))
      );
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar as transações.");
      console.error("Error fetching transactions:", error);
    }
  }

  async function fetchData() {
    const fetchDatailsPromise = fetchTargetDetails();
    const fetchTransactionsPromise = fetchTransactions();

    await Promise.all([fetchDatailsPromise, fetchTransactionsPromise]);
    setFetching(false);
  }

  function handleTransactionRemove(id: string) {
    Alert.alert(
      "Remover transação",
      "Você tem certeza que deseja remover essa transação?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Remover",
          onPress: () => transactionRemove(id),
        },
      ]
    );
  }

  async function transactionRemove(id: string) {
    try {
      await transactionsDataBase.remove(Number(id));

      fetchData();
      Alert.alert("Sucesso", "Transação removida com sucesso!", [
        {
          text: "Ok",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível remover a transação.");
      console.error("Error removing transaction:", error);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  if (fetching) {
    return <Loading />;
  }

  return (
    <View style={{ flex: 1, padding: 24, gap: 32 }}>
      <PageHeader
        title={details.name}
        rightButton={{
          icon: "edit",
          onPress: () => router.navigate(`/target?id=${params.id}`),
        }}
      />

      <Progress data={details} />

      <List
        title="Transações"
        data={transactions}
        renderItem={({ item }) => (
          <Transaction
            data={item}
            onRemove={() => handleTransactionRemove(item.id)}
          />
        )}
        emptyMessage="Nenhuma transação. Toque em nova transação para guardar seu primeiro dinheiro aqui."
      />

      <Button
        title="Nova transação"
        onPress={() => router.navigate(`/transaction/${params.id}`)}
      />
    </View>
  );
}
