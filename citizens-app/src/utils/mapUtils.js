/**
 * Map Utilities for Clustering and Marker Management
 * 
 * This module handles:
 * - Supercluster initialization and configuration
 * - Report data transformation for clustering
 * - Cluster and marker data fetching based on map bounds
 * - Color coding for different report categories and statuses
 */

import Supercluster from 'supercluster';

// Color mapping for different report categories
export const CATEGORY_COLORS = {
  water: '#2196F3',      // Blue
  electricity: '#FFC107', // Amber
  roads: '#FF5722',      // Deep Orange
  waste: '#4CAF50',      // Green
  safety: '#F44336',     // Red
  other: '#9E9E9E',      // Grey
};

// Color mapping for different report statuses
export const STATUS_COLORS = {
  pending: '#FF9800',     // Orange
  acknowledged: '#2196F3', // Blue
  in_progress: '#9C27B0', // Purple
  resolved: '#4CAF50',    // Green
};

/**
 * Creates and configures a Supercluster instance
 * Optimized for mobile performance with reasonable clustering parameters
 */
export const createCluster = () => {
  return new Supercluster({
    radius: 60,        // Cluster radius in pixels (smaller for mobile)
    maxZoom: 16,       // Maximum zoom level for clustering
    minZoom: 0,        // Minimum zoom level
    minPoints: 2,      // Minimum points to form a cluster
    extent: 512,       // Tile extent (default)
    nodeSize: 64,      // Size of KD-tree leaf node (performance optimization)
  });
};

/**
 * Transforms report data into GeoJSON format for clustering
 * Each report becomes a GeoJSON point feature with properties
 */
export const transformReportsToGeoJSON = (reports) => {
  if (!reports || !Array.isArray(reports)) {
    return [];
  }

  return reports
    .filter(report => report.lat && report.lng) // Only include reports with valid coordinates
    .map(report => ({
      type: 'Feature',
      properties: {
        cluster: false,
        reportId: report.id,
        title: report.title,
        description: report.description,
        category: report.category,
        status: report.status,
        address: report.address,
        created_at: report.created_at,
        upvotes: report.upvotes || 0,
        assigned_official: report.assigned_official_user?.name || null,
        ward_id: report.ward_id || null,
        municipality: report.municipalities?.name || null,
      },
      geometry: {
        type: 'Point',
        coordinates: [report.lng, report.lat], // GeoJSON uses [lng, lat] format
      },
    }));
};

/**
 * Gets clusters and individual markers for the current map bounds and zoom level
 * Returns both cluster markers and individual point markers
 */
export const getClustersForBounds = (cluster, bounds, zoom) => {
  if (!cluster || !bounds) {
    return [];
  }

  try {
    // Supercluster expects bounds in [west, south, east, north] format
    const clusterBounds = [
      bounds.longitude - bounds.longitudeDelta / 2, // west
      bounds.latitude - bounds.latitudeDelta / 2,   // south
      bounds.longitude + bounds.longitudeDelta / 2, // east
      bounds.latitude + bounds.latitudeDelta / 2,   // north
    ];

    // Get clusters for the current bounds and zoom level
    const clusters = cluster.getClusters(clusterBounds, Math.floor(zoom));
    
    return clusters.map(cluster => {
      if (cluster.properties.cluster) {
        // This is a cluster
        return {
          type: 'cluster',
          id: cluster.id,
          coordinate: {
            latitude: cluster.geometry.coordinates[1],
            longitude: cluster.geometry.coordinates[0],
          },
          pointCount: cluster.properties.point_count,
          clusterId: cluster.id,
        };
      } else {
        // This is an individual point
        return {
          type: 'point',
          id: cluster.properties.reportId,
          coordinate: {
            latitude: cluster.geometry.coordinates[1],
            longitude: cluster.geometry.coordinates[0],
          },
          report: cluster.properties,
        };
      }
    });
  } catch (error) {
    console.error('Error getting clusters for bounds:', error);
    return [];
  }
};

/**
 * Gets the expansion bounds for a cluster when tapped
 * Used to zoom into a cluster area
 */
export const getClusterExpansionRegion = (cluster, clusterId) => {
  if (!cluster || !clusterId) {
    return null;
  }

  try {
    // Get the zoom level needed to expand this cluster
    const expansionZoom = cluster.getClusterExpansionZoom(clusterId);
    
    // Get the cluster's children to calculate bounds
    const children = cluster.getChildren(clusterId);
    
    if (!children || children.length === 0) {
      return null;
    }

    // Calculate bounds from children coordinates
    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;

    children.forEach(child => {
      const [lng, lat] = child.geometry.coordinates;
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
    });

    // Add padding to the bounds
    const latPadding = (maxLat - minLat) * 0.1 || 0.01;
    const lngPadding = (maxLng - minLng) * 0.1 || 0.01;

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(maxLat - minLat + latPadding, 0.01),
      longitudeDelta: Math.max(maxLng - minLng + lngPadding, 0.01),
    };
  } catch (error) {
    console.error('Error getting cluster expansion region:', error);
    return null;
  }
};

/**
 * Gets the appropriate marker color based on report category
 */
export const getMarkerColorByCategory = (category) => {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.other;
};

/**
 * Gets the appropriate marker color based on report status
 */
export const getMarkerColorByStatus = (status) => {
  return STATUS_COLORS[status] || STATUS_COLORS.pending;
};

/**
 * Formats date for display in marker modals
 */
export const formatReportDate = (dateString) => {
  if (!dateString) return 'Unknown date';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Gets a human-readable category label
 */
export const getCategoryLabel = (category) => {
  const labels = {
    water: 'Water & Sanitation',
    electricity: 'Electricity',
    roads: 'Roads & Transport',
    waste: 'Waste Management',
    safety: 'Safety & Security',
    other: 'Other',
  };
  return labels[category] || 'Other';
};

/**
 * Gets a human-readable status label
 */
export const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pending',
    acknowledged: 'Acknowledged',
    in_progress: 'In Progress',
    resolved: 'Resolved',
  };
  return labels[status] || 'Unknown';
};

/**
 * Calculates appropriate zoom level based on map region
 * Used for cluster calculations
 */
export const calculateZoomLevel = (region) => {
  if (!region) return 10;
  
  // Approximate zoom level calculation based on latitude delta
  const zoom = Math.log2(360 / region.latitudeDelta);
  return Math.max(0, Math.min(20, Math.floor(zoom)));
};

/**
 * Debounce utility for map region changes
 * Prevents excessive cluster recalculations during map movement
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};