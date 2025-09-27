import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import ErrorMessage from '../../components/common/ErrorMessage';
import ReportMarkerModal from '../../components/map/ReportMarkerModal';
import reportService from '../../services/reportService';
import { useLocation } from '../../hooks/useLocation';
import {
  createCluster,
  transformReportsToGeoJSON,
  getClustersForBounds,
  getClusterExpansionRegion,
  getMarkerColorByCategory,
  calculateZoomLevel,
  debounce,
} from '../../utils/mapUtils';

const MapScreen = ({ navigation }) => {
  const [reports, setReports] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [clusterInstance, setClusterInstance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: -26.2041,
    longitude: 28.0473,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });
  const [mapReady, setMapReady] = useState(false);
  const [zoom, setZoom] = useState(10); // <-- keep track of zoom
  const { getCurrentLocation } = useLocation();

  useEffect(() => {
    loadMapData();
  }, []);

  useEffect(() => {
    if (reports.length > 0 && mapReady) {
      initializeClustering();
    }
  }, [reports, mapReady]);

  const loadMapData = async () => {
    try {
      setLoading(true);
      setError(null);

      const reportsData = await reportService.getReports();
      setReports(reportsData.reports || []);

      try {
        const location = await getCurrentLocation();
        setMapRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      } catch (locErr) {
        console.log('Could not get current location:', locErr.message);
      }
    } catch (err) {
      console.error('Map data loading error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const initializeClustering = () => {
    try {
      const cluster = createCluster();
      const geoJsonReports = transformReportsToGeoJSON(reports);

      if (geoJsonReports.length > 0) {
        cluster.load(geoJsonReports);
        setClusterInstance(cluster);
        updateClusters(cluster, mapRegion);
      }
    } catch (err) {
      console.error('Clustering initialization error:', err);
    }
  };

  const updateClusters = (cluster, region) => {
    if (!cluster || !region) return;

    try {
      const zoomLevel = calculateZoomLevel(region);
      setZoom(zoomLevel); // <-- update zoom state
      const newClusters = getClustersForBounds(cluster, region, zoomLevel);
      setClusters(newClusters);
    } catch (err) {
      console.error('Cluster update error:', err);
    }
  };

  const debouncedRegionChange = debounce((region) => {
    setMapRegion(region);
    if (clusterInstance) updateClusters(clusterInstance, region);
  }, 300);

  const handleRegionChange = (region) => {
    debouncedRegionChange(region);
  };

  const handleClusterPress = (clusterId) => {
    if (!clusterInstance) return;
    try {
      const expansionRegion = getClusterExpansionRegion(clusterInstance, clusterId);
      if (expansionRegion) setMapRegion(expansionRegion);
    } catch (err) {
      console.error('Cluster expansion error:', err);
    }
  };

  const handleReportPress = (report) => {
    setSelectedReport(report);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedReport(null);
  };

  const renderMarkers = () =>
    clusters.map((item) => {
      // Only show clusters if zoomed out
      if (item.type === 'cluster' && zoom < 13) {
        return (
          <Marker
            key={`cluster-${item.id}`}
            coordinate={item.coordinate}
            onPress={() => handleClusterPress(item.clusterId)}
          >
            <View style={styles.clusterMarker}>
              <Text style={styles.clusterText}>{item.pointCount}</Text>
            </View>
          </Marker>
        );
      } else {
        // Always render stylised markers when zoomed in
        const markerColor = getMarkerColorByCategory(item.report.category);
        return (
          <Marker
            key={`report-${item.id}`}
            coordinate={item.coordinate}
            onPress={() => handleReportPress(item.report)}
          >
            <View style={[styles.reportMarker, { backgroundColor: markerColor }]}>
              <Ionicons name="location" size={16} color="#fff" />
            </View>
          </Marker>
        );
      }
    });

  const handleMapReady = () => setMapReady(true);
  const handleRefresh = () => loadMapData();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading map data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorMessage message={error} onRetry={handleRefresh} retryText="Retry" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Community Map</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#2196F3" />
            ) : (
              <Ionicons name="refresh" size={20} color="#2196F3" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <MapView
        style={styles.map}
        initialRegion={mapRegion}
        onRegionChangeComplete={handleRegionChange}
        onMapReady={handleMapReady}
        showsUserLocation
        showsMyLocationButton
        showsCompass={false}
        showsScale={false}
        showsBuildings={false}
        showsTraffic={false}
        showsIndoors={false}
        rotateEnabled={false}
        pitchEnabled={false}
        toolbarEnabled={false}
        loadingEnabled
        loadingIndicatorColor="#2196F3"
        loadingBackgroundColor="#fff"
        moveOnMarkerPress={false}
        liteMode={Platform.OS === 'android'}
        mapType="standard"
      >
        {mapReady && renderMarkers()}
      </MapView>

      <View style={styles.infoPanel}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{reports.length}</Text>
            <Text style={styles.statLabel}>Reports</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {clusters.filter((c) => c.type === 'cluster').length}
            </Text>
            <Text style={styles.statLabel}>Clusters</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => navigation.navigate('Reports')}
        >
          <Text style={styles.viewAllText}>View All Reports</Text>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      <ReportMarkerModal
        visible={modalVisible}
        report={selectedReport}
        onClose={closeModal}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 12, fontSize: 16, color: '#666' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  refreshButton: { padding: 8 },
  map: { flex: 1 },
  clusterMarker: { backgroundColor: '#2196F3', borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
  clusterText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  reportMarker: { borderRadius: 15, width: 30, height: 30, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.22, shadowRadius: 2.22 },
  infoPanel: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#2196F3' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 2 },
  viewAllButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2196F3', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6 },
  viewAllText: { color: '#fff', fontSize: 14, fontWeight: '600', marginRight: 8 },
});

export default MapScreen;
