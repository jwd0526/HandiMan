// src/screens/Statistics/styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  viewTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 8,
    gap: 6,
    marginVertical: -20
  },
  viewTypeLabel: {
    fontSize: 14,
    color: '#2f95dc',
    fontWeight: '500',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 0,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  goodTrend: {
    color: '#28a745',
  },
  badTrend: {
    color: '#dc3545',
  },
  chart: {
    borderRadius: 8,
    position: 'relative',

  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 16,
    marginLeft: 0, // Adjusted margin
    paddingBottom: 10,
    paddingRight: 30,
    paddingLeft: 0
  },
  keyLabelsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  // Interactive chart components
  chartInteractionLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  keyPointsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -40, // Position directly on the x-axis, adjusted for vertical labels
    height: 16, // Just tall enough for the key points
    pointerEvents: 'none',
    zIndex: 5,
  },
  keyPoint: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    transform: [{ translateX: -8 }, { translateY: -4 }], // Center the dot horizontally and position at x-axis
  },
  activePointLabel: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 130,
    maxWidth: 180,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(200, 200, 200, 0.7)',
    transform: [{ translateX: -65 }], // Center the label
    zIndex: 20,
  },
  activePointValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  activePointDetails: {
    width: '100%',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(200, 200, 200, 0.5)',
  },
  activePointDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  activePointText: {
    fontSize: 12,
    marginLeft: 8,
    color: '#666',
    flex: 1,
  },
  
  // Chart details section
  chartDetailsSection: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chartDetailsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  chartDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  chartDetailItem: {
    flex: 1,
  },
  chartDetailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  chartDetailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  trendDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendIconContainer: {
    marginRight: 4,
  },
  statSelectorContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statList: {
    paddingVertical: 4,
  },
  statButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statButtonActive: {
    backgroundColor: '#2f95dc',
  },
  statButtonIcon: {
    marginRight: 8,
  },
  statButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  statButtonTextActive: {
    color: '#fff',
  },
  rangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  rangeButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 60,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rangeButtonActive: {
    backgroundColor: '#2f95dc',
  },
  rangeButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  rangeButtonTextActive: {
    color: '#fff',
  },
  teeColorLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginTop: 8,
    gap: 8,
  },
  teeColorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  teeColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  teeColorText: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2f95dc',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  noDataContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#2f95dc',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});