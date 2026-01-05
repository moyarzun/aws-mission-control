import { StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity, Text, View, Switch } from 'react-native';
import { useEffect, useState } from 'react';
import { getInstances, manageInstance, Instance } from '@/services/api';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function TabOneScreen() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const fetchInstances = async () => {
    setLoading(true);
    try {
      const data = await getInstances();
      setInstances(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch instances');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstances();
  }, []);

  const handleToggle = async (value: boolean, instanceId: string) => {
    const action = value ? 'start' : 'stop';
    const optimisticState = value ? 'running' : 'stopped';

    setLoadingStates(prev => ({ ...prev, [instanceId]: true }));

    // Optimistic update: modify only the target component
    setInstances(prev => prev.map(inst =>
      inst.id === instanceId ? { ...inst, state: optimisticState } : inst
    ));

    try {
      await manageInstance(instanceId, action);
      Alert.alert('Success', `Instance ${action} command sent.`);
    } catch (error) {
      Alert.alert('Error', `Failed to ${action} instance`);
      fetchInstances(); // Revert/Refresh on error
    } finally {
      setLoadingStates(prev => ({ ...prev, [instanceId]: false }));
    }
  };

  const renderItem = ({ item }: { item: Instance }) => {
    const isRunning = item.state === 'running';
    const isStopped = item.state === 'stopped';
    const isInteractive = isRunning || isStopped;
    const statusColor = isRunning ? '#4CAF50' : isStopped ? '#F44336' : '#FFC107';

    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{item.name}</Text>
          <View style={styles.headerRight}>
            {loadingStates[item.id] ? (
              <ActivityIndicator size="small" color="#2196F3" style={{ marginRight: 10 }} />
            ) : (
              <Switch
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={isRunning ? "#2196F3" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={(value) => handleToggle(value, item.id)}
                value={isRunning}
                disabled={!isInteractive || loadingStates[item.id]}
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              />
            )}
            <View style={[styles.badge, { backgroundColor: statusColor }]}>
              <Text style={styles.badgeText}>{item.state.toUpperCase()}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.detail}>ID: {item.id}</Text>
        <Text style={styles.detail}>Type: {item.type}</Text>
        <Text style={styles.detail}>Public IP: {item.publicIp || 'N/A'}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.screenTitle}>EC2 Instances</Text>
        <TouchableOpacity onPress={fetchInstances} disabled={loading}>
          <Text style={styles.refresh}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={instances}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No instances found</Text>}
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
  refresh: {
    color: '#2196F3',
    fontSize: 16,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  detail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#999',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  }
});
