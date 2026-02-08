import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuthStore } from '@/store/useAuthStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { formatCurrency, maskValue } from '@/lib/finance';
import ScreenHeader from '@/components/ScreenHeader';
import StatCard from '@/components/StatCard';
import PillButton from '@/components/PillButton';
import InputField from '@/components/InputField';
import FormModal from '@/components/FormModal';
import type { RootStackParamList } from '@/navigation';

type TransactionFormNav = NativeStackNavigationProp<RootStackParamList, 'TransactionForm'>;

const TransactionFormScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<TransactionFormNav>();
  const { categories, accounts, addTransaction } = useFinanceStore();

  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const filteredCats = categories.filter((c) => c.type === type);

  const parseAmount = (text: string): number => {
    // Trata formato brasileiro: "1.500,50" → "1500.50"
    const cleaned = text.replace(/\./g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  };

  const handleSubmit = async () => {
    setError('');
    if (!description.trim()) { setError('Informe a descrição.'); return; }
    const parsedAmount = parseAmount(amount);
    if (!parsedAmount || parsedAmount <= 0) { setError('Informe um valor válido.'); return; }
    if (!categoryId) { setError('Selecione uma categoria.'); return; }
    if (!accountId) { setError('Selecione uma conta.'); return; }

    setLoading(true);
    try {
      await addTransaction({
        description: description.trim(),
        amount: parsedAmount,
        type,
        categoryId,
        accountId,
        date: new Date().toISOString().split('T')[0],
        recurring: false,
      });
      navigation.goBack();
    } catch {
      setError('Falha ao salvar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={[]}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Type Toggle */}
        <View style={styles.typeRow}>
          <PillButton label="Despesa" active={type === 'expense'} onPress={() => { setType('expense'); setCategoryId(''); }} style={styles.typePill} />
          <PillButton label="Receita" active={type === 'income'} onPress={() => { setType('income'); setCategoryId(''); }} style={styles.typePill} />
        </View>

        <InputField
          label="Descrição"
          value={description}
          onChangeText={setDescription}
          placeholder="Ex: Supermercado"
        />

        <InputField
          label="Valor (R$)"
          value={amount}
          onChangeText={setAmount}
          placeholder="0,00"
          keyboardType="numeric"
        />

        {/* Category Selector */}
        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Categoria</Text>
        {filteredCats.length === 0 ? (
          <Text style={[styles.emptyHint, { color: colors.textMuted }]}>
            Nenhuma categoria de {type === 'income' ? 'receita' : 'despesa'} encontrada.
          </Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {filteredCats.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setCategoryId(cat.id)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: categoryId === cat.id ? colors.primary : colors.mutedBg,
                  },
                ]}
              >
                <Text style={styles.chipEmoji}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.chipText,
                    { color: categoryId === cat.id ? '#fff' : colors.textSecondary },
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Account Selector */}
        <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 16 }]}>Conta</Text>
        {accounts.length === 0 ? (
          <Text style={[styles.emptyHint, { color: colors.textMuted }]}>
            Crie uma conta em "Mais → Gerenciar Contas" antes de adicionar transações.
          </Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {accounts.map((acc) => (
              <TouchableOpacity
                key={acc.id}
                onPress={() => setAccountId(acc.id)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: accountId === acc.id ? colors.primary : colors.mutedBg,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: accountId === acc.id ? '#fff' : colors.textSecondary },
                  ]}
                >
                  {acc.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Error */}
        {error ? (
          <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
        ) : null}

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: colors.primary, marginTop: error ? 12 : 32, opacity: loading ? 0.7 : 1 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={styles.submitText}>Adicionar Transação</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  typePill: {
    flex: 1,
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  chipScroll: {
    marginBottom: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 8,
    gap: 6,
  },
  chipEmoji: {
    fontSize: 16,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 14,
    gap: 8,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyHint: {
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 8,
    paddingLeft: 4,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default TransactionFormScreen;
