import { Button } from "@/components/Button";
import { HomeHeader } from "@/components/HomeHeader";
import { List } from "@/components/List";
import { Loading } from "@/components/Loading";
import { Target, TargetProps } from "@/components/Target";
import { useTargetDatabase } from "@/database/useTargetDatabase";
import { numberToCurrency } from "@/utils/numberToCurrency";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, StatusBar, View } from "react-native";

const summary = {
  total: "R$ 2.680,00",
  input: { label: "Entradas", value: "R$ 6.184,90" },
  output: { label: "Saídas", value: "-R$ 883,65" },
};

export default function Index() {
  const [targets, setTargets] = useState<TargetProps[]>([]);
  const targetDatabase = useTargetDatabase();
  const [fetching, setFetching] = useState(true);

  async function fetchTargets(): Promise<TargetProps[]> {
    try {
      const response = await targetDatabase.listBySavedValue();
      
      return response.map((item) => ({
        id: String(item.id),
        name: item.name,
        percentage: item.percentage.toFixed(0) + "%",
        current: numberToCurrency(item.current),
        target: numberToCurrency(item.amount),
      }));
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar as metas.");
      console.error("Error fetching targets:", error);
    }
  }

  async function fetchData() {
    const targetsDataPromise =  fetchTargets();

    const [targetsData] = await Promise.all([targetsDataPromise]);

    setTargets(targetsData || []);
    setFetching(false);
  }

  // O useFocusEffect é usado para executar uma função quando a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  if (fetching) {
    return <Loading />;
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <HomeHeader data={summary} />

      <List
        title="Metas"
        data={targets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Target
            data={item}
            onPress={() => router.navigate(`/in-progress/${item.id}`)}
          />
        )}
        emptyMessage="Nenhuma meta. Toque em nova meta para criar."
        containerStyle={{ paddingHorizontal: 24 }}
      />

      <View style={{ padding: 24, paddingBottom: 32 }}>
        <Button title="Nova meta" onPress={() => router.navigate("/target")} />
      </View>
    </View>
  );
}
