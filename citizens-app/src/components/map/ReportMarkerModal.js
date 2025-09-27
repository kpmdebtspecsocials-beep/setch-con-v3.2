/**
 * Report Marker Modal Component
 * 
 * Displays detailed information about a report when a map marker is tapped.
 * Features:
 * - Semi-transparent overlay background
 * - Scrollable content for long descriptions
 * - Color-coded status and category indicators
 * - Smooth animations and responsive design
 * - Proper error handling and loading states
 */

import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  getCategoryLabel,
  getStatusLabel,
  formatReportDate,
  getMarkerColorByCategory,
  getMarkerColorByStatus,
} from '../../utils/mapUtils';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ReportMarkerModal = ({ visible, report, onClose }) => {
  if (!report) return null;

  const categoryColor = getMarkerColorByCategory(report.category);
  const statusColor = getMarkerColorByStatus(report.status);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      {/* Semi-transparent overlay */}
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        {/* Modal content container */}
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={(e) => e.stopPropagation()}
            style={styles.modalContent}
          >
            {/* Header with close button */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={[styles.categoryIndicator, { backgroundColor: categoryColor }]}>
                  <Ionicons 
                    name="location" 
                    size={16} 
                    color="#fff" 
                  />
                </View>
                <Text style={styles.headerTitle} numberOfLines={2}>
                  {report.title}
                </Text>
              </View>
              
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Scrollable content */}
            <ScrollView 
              style={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {/* Status and Category Row */}
              <View style={styles.statusRow}>
                <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                  <Text style={styles.statusText}>
                    {getStatusLabel(report.status)}
                  </Text>
                </View>
                
                <View style={styles.categoryBadge}>
                  <Text style={[styles.categoryText, { color: categoryColor }]}>
                    {getCategoryLabel(report.category)}
                  </Text>
                </View>
              </View>

              {/* Description */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.description}>
                  {report.description || 'No description provided'}
                </Text>
              </View>

              {/* Location Information */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Location</Text>
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={16} color="#666" />
                  <Text style={styles.locationText}>
                    {report.address || 'Address not available'}
                  </Text>
                </View>
                
                {report.ward_id && (
                  <View style={styles.locationRow}>
                    <Ionicons name="map-outline" size={16} color="#666" />
                    <Text style={styles.locationText}>
                      Ward: {report.ward_id}
                    </Text>
                  </View>
                )}
              </View>

              {/* Municipal Information */}
              {(report.assigned_official || report.municipality) && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Municipal Information</Text>
                  
                  {report.assigned_official && (
                    <View style={styles.infoRow}>
                      <Ionicons name="person-outline" size={16} color="#666" />
                      <Text style={styles.infoText}>
                        Assigned to: {report.assigned_official}
                      </Text>
                    </View>
                  )}
                  
                  {report.municipality && (
                    <View style={styles.infoRow}>
                      <Ionicons name="business-outline" size={16} color="#666" />
                      <Text style={styles.infoText}>
                        {report.municipality}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Report Metadata */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Report Details</Text>
                
                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={16} color="#666" />
                  <Text style={styles.infoText}>
                    Reported: {formatReportDate(report.created_at)}
                  </Text>
                </View>
                
                {report.upvotes > 0 && (
                  <View style={styles.infoRow}>
                    <Ionicons name="heart-outline" size={16} color="#666" />
                    <Text style={styles.infoText}>
                      {report.upvotes} {report.upvotes === 1 ? 'upvote' : 'upvotes'}
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    maxHeight: screenHeight * 0.8,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  categoryIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    lineHeight: 24,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  scrollContent: {
    maxHeight: screenHeight * 0.6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
});

export default ReportMarkerModal;