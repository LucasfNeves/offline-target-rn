import { Button } from "@/components/Button";
import { HomeHeader } from "@/components/HomeHeader";
import { List } from "@/components/List";
import { Target } from "@/components/Target";
import { useTargetDatabase } from "@/database/useTargetDatabase";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, StatusBar, View } from "react-native";

const summary = {
  total: "R$ 2.680,00",
  input: { label: "Entradas", value: "R$ 6.184,90" },
  output: { label: "Saídas", value: "-R$ 883,65" },
};

export default function Index() {
  const [targets, setTargets] = useState([]);
  const targetDatabase = useTargetDatabase();

  async function fetchTargets() {
    try {
      const response = await targetDatabase.listBySavedValue();
      setTargets(response);
      console.log("Targets fetched:", JSON.stringify(response));
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar as metas.");
      console.error("Error fetching targets:", error);
    }
  }

  // O useFocusEffect é usado para executar uma função quando a tela ganha foco
  useFocusEffect(useCallback(() => {
    fetchTargets();
  }, []));

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
