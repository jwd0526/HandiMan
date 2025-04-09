// src/components/round/RoundDetails/styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  courseName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  courseLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  changeButton: {
    padding: 8,
  },
  changeButtonText: {
    color: '#2f95dc',
    fontSize: 16,
    fontWeight: '500',
  },
  dateContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  datePicker: {
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 16,
  },
  halfInput: {
    width: '48%',
  },
  notesInput: {
    marginBottom: 24,
  },
  submitButton: {
    marginTop: 'auto',
  },
});