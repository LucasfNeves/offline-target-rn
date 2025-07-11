import { Button } from '@/components/Button'
import { CurrencyInput } from '@/components/CurrencyInput'
import { Input } from '@/components/Input'
import { PageHeader } from '@/components/PageHeader'
import { useTargetDatabase } from '@/database/useTargetDatabase'
import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { Alert, View } from 'react-native'

export default function Target() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState(0)
  const targetDatabase = useTargetDatabase()

  const params = useLocalSearchParams<{ id?: string }>()

  function handleSave() {
    if (!name.trim() || amount <= 0) {
      return Alert.alert(
        'Atenção',
        'Preencha o nome e o valor precisa ser maior que zero.',
      )
    }

    setIsProcessing(true)

    if (params.id) {
      update();
    } else {
      create()
    }
  }

  async function create() {
    try {

      await targetDatabase.create({
        name,
        amount,
      })
      
      Alert.alert('Nova Meta', 'Meta criada com sucesso!', [
        {
          text: 'Ok',
          onPress: router.back,
        },
      ])
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar a meta.')
      console.log(error)
      setIsProcessing(false)
    }
  }

  async function fetchDetails (id: number) {
    try {
      const response = await targetDatabase.show(id);
      setName(response.name);
      setAmount(response.amount);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os detalhes da meta.');
      console.log(error);
    }
  }

  async function handleRemove() {
    try {
      if (!params.id) {
        return Alert.alert('Atenção', 'Selecione uma meta para remover.');
      }

      Alert.alert(
        "Remover", "Você tem certeza que deseja remover essa meta?", [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Remover",
            onPress: remove,
          },
        ]
      )

    } catch (error) {
      Alert.alert('Erro', 'Não foi possível remover a meta.');
      console.log(error);
    }
  }

  async function remove() {
    try {
     setIsProcessing(true);

      await targetDatabase.remove(Number(params.id));

      Alert.alert('Meta Removida', 'Meta removida com sucesso!', [
        {
          text: 'Ok',
          onPress: () => router.replace('/'),
        },
      ]);

    } catch (error) {
      Alert.alert('Erro', 'Não foi possível remover a meta.');
      console.log(error);
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchDetails(Number(params.id));
    }
  }, [params.id]);

  async function update() {
    try {
      await targetDatabase.update({
        id: Number(params.id),
        name,
        amount,
      });

      Alert.alert('Meta Atualizada', 'Meta atualizada com sucesso!', [
        {
          text: 'Ok',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar a meta.');
      console.log(error);
      setIsProcessing(false);
    }
  }

  return (
    <View style={{ flex: 1, padding: 24 }}>
      <PageHeader
        title="Meta"
        subtitle="Economize para alcançar sua meta financeira."
        rightButton={
          params.id
            ? {
                icon: 'delete',
                onPress: handleRemove,
              }
            : undefined
        }
      />

      <View style={{ marginTop: 32, gap: 24 }}>
        <Input
          label="Nova meta"
          placeholder="Ex: Viagem para praia, Apple Watch"
          onChangeText={setName}
          value={name}
        />

        <CurrencyInput
          label="Valor alvo (R$)"
          value={amount}
          onChangeValue={setAmount}
        />

        <Button
          title="Salvar"
          isProcessing={isProcessing}
          onPress={handleSave}
        />
      </View>
    </View>
  )
}
