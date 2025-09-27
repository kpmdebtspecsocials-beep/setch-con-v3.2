import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import ReportCard from '../../components/reports/ReportCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useReports } from '../../hooks/useReports';
import reportService from '../../services/reportService';

const ReportsScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const { reports, loading, error, refreshReports } = useReports();

  useFocusEffect(
    useCallback(() => {
      refreshReports();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshReports();
    setRefreshing(false);
  };

  const handleReportPress = (report) => {
    navigation.navigate('ReportDetail', { reportId: report.id });
  };

  const handleUpvote = async (reportId) => {
    try {
      await reportService.upvoteReport(reportId);
      refreshReports();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const navigateToCreateReport = () => {
    navigation.navigate('CreateReport');
  };

  const renderReport = ({ item }) => (
    <ReportCard
      report={item}
      onPress={handleReportPress}
      showUpvote={true}
      onUpvote={handleUpvote}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Reports Yet</Text>
      <Text style={styles.emptySubtitle}>
        Be the first to report an issue in your community
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={navigateToCreateReport}
      >
        <Text style={styles.createButtonText}>Create Report</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return <LoadingSpinner message="Loading reports..." />;
  }

  if (error && !refreshing) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={refreshReports}
        retryText="Retry"
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Community Reports</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={navigateToCreateReport}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={reports}
        renderItem={renderReport}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#2196F3',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReportsScreen;