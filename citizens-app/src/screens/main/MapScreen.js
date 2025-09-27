import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polygon } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useLocation } from '../../hooks/useLocation';
import municipalityService from '../../services/municipalityService';
import reportService from '../../services/reportService';
import { REPORT_CATEGORIES } from '../../config/api';

const MapScreen = ({ navigation }) => {
  const [municipalities, setMunicipalities] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: -26.2041,
    longitude: 28.0473,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  });
  const { getCurrentLocation } = useLocation();

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load municipalities with GeoJSON data
      const municipalitiesData = await municipalityService.getMunicipalities(true);
      setMunicipalities(municipalitiesData);

      // Load reports
      const reportsData = await reportService.getReports({ limit: 100 });
      setReports(reportsData.reports);

      // Try to get user's current location
      try {
        const location = await getCurrentLocation();
        setMapRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        });
      } catch (locationError) {
        console.log('Could not get current location:', locationError.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReportPress = (report) => {
    navigation.navigate('ReportDetail', { reportId: report.id });
  };

  const getMarkerColor = (category) => {
    const categoryData = REPORT_CATEGORIES.find(cat => cat.value === category);
    switch (category) {
      case 'water': return '#2196F3';
      case 'electricity': return '#FFC107';
      case 'roads': return '#FF5722';
      case 'waste': return '#4CAF50';
      case 'safety': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const renderMunicipalityPolygons = () => {
    return municipalities.map((municipality) => {
      if (!municipality.bounds || !municipality.bounds.coordinates) {
        return null;
      }

      try {
        const coordinates = municipality.bounds.coordinates[0].map(coord => ({
          latitude: coord[1],
          longitude: coord[0],
        }));

        return (
          <Polygon
            key={municipality.id}
            coordinates={coordinates}
            strokeColor="#2196F3"
            strokeWidth={2}
            fillColor="rgba(33, 150, 243, 0.1)"
          />
        );
      } catch (error) {
        console.log('Error rendering polygon for municipality:', municipality.name);
        return null;
      }
    });
  };

  const renderReportMarkers = () => {
    return reports.map((report) => (
      <Marker
        key={report.id}
        coordinate={{
          latitude: report.lat,
          longitude: report.lng,
        }}
        title={report.title}
        description={report.description}
        pinColor={getMarkerColor(report.category)}
        onCalloutPress={() => handleReportPress(report)}
      />
    ));
  };

  if (loading) {
    return <LoadingSpinner message="Loading map data..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={loadMapData}
        retryText="Retry"
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Community Map</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadMapData}
        >
          <Ionicons name="refresh" size={20} color="#2196F3" />
        </TouchableOpacity>
      </View>

      <MapView
        style={styles.map}
        region={mapRegion}
        onRegionChangeComplete={setMapRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {renderMunicipalityPolygons()}
        {renderReportMarkers()}
      </MapView>

      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Report Categories</Text>
        <View style={styles.legendItems}>
          {REPORT_CATEGORIES.slice(0, 3).map((category) => (
            <View key={category.value} style={styles.legendItem}>
              <View 
                style={[
                  styles.legendColor, 
                  { backgroundColor: getMarkerColor(category.value) }
                ]} 
              />
              <Text style={styles.legendText}>{category.label}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => navigation.navigate('Reports')}
        >
          <Text style={styles.viewAllText}>View All Reports</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  refreshButton: {
    padding: 8,
  },
  map: {
    flex: 1,
  },
  legend: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  viewAllButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  viewAllText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MapScreen;