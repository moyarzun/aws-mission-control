import { StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { getCosts, CostItem } from '@/services/api';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CostsScreen() {
  const [costs, setCosts] = useState<CostItem[]>([]);
  const [period, setPeriod] = useState<{ start: string, end: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCosts = async () => {
    setLoading(true);
    try {
      const result = await getCosts();
      setCosts(result.data);
      setPeriod(result.period);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch costs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCosts();
  }, []);

  const totalCost = costs.reduce((sum, item) => sum + parseFloat(item.amount), 0);

  const renderItem = ({ item }: { item: CostItem }) => (
    <View style={styles.row}>
      <Text style={styles.serviceName}>{item.serviceName}</Text>
      <Text style={styles.amount}>${parseFloat(item.amount).toFixed(2)}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.screenTitle}>Monthly Costs</Text>
          {period && <Text style={styles.subtitle}>{period.start} - {period.end}</Text>}
        </View>
        <TouchableOpacity onPress={fetchCosts} disabled={loading}>
          <Text style={styles.refresh}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total (MTD)</Text>
        <Text style={styles.totalValue}>${totalCost.toFixed(2)}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={costs}
          keyExtractor={(item) => item.serviceName}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No cost data available</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    color: '#666'
  },
  refresh: {
    color: '#2196F3',
    fontSize: 16,
  },
  totalContainer: {
    padding: 20,
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  totalLabel: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600'
  },
  totalValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold'
  },
  list: {
    padding: 16,
  },
  row: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  serviceName: {
    fontSize: 16,
    color: '#333',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#999',
  },
});
