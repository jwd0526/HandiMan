// src/screens/Goals/index.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { API_URL } from '../../config/constants';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
  Switch,
  Alert,
  ActivityIndicator,
  Animated,
  Button
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../config/navigation';
import { styles } from './styles';
import { useAuth } from '../../hooks/useAuth';
import { useGoals } from '../../hooks/useGoals';
import type { Goal, CreateGoalInput } from 'shared';
import { BackButton } from '../../components/common/BackButton';
import { ArrowUp, ArrowDown, Target, CheckCircle, Trophy, Calendar, Flag, Award } from 'lucide-react-native';
import { FormInput } from '../../components/forms/FormInput';
import { FormButton } from '../../components/forms/FormButton';
import { LoadingScreen } from '../../components/common/LoadingScreen';

// CustomDatePicker using direct input fields for better control and stability
const CustomDatePicker = ({ value, onChange, minimumDate }: { 
  value: Date, 
  onChange: (date: Date) => void,
  minimumDate?: Date
}) => {
  const [show, setShow] = useState(false);
  
  // State for manual date entry controls
  const [day, setDay] = useState(String(value.getDate()).padStart(2, '0'));
  const [month, setMonth] = useState(String(value.getMonth() + 1).padStart(2, '0'));
  const [year, setYear] = useState(String(value.getFullYear()));
  
  // When the modal opens, initialize from the value prop
  useEffect(() => {
    if (show) {
      setDay(String(value.getDate()).padStart(2, '0'));
      setMonth(String(value.getMonth() + 1).padStart(2, '0'));
      setYear(String(value.getFullYear()));
    }
  }, [show, value]);
  
  const showPicker = () => {
    setShow(true);
  };
  
  const handleConfirm = () => {
    // Validate inputs
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10) - 1; // 0-indexed in JS Date
    const yearNum = parseInt(year, 10);
    
    if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum) ||
        dayNum < 1 || dayNum > 31 || monthNum < 0 || monthNum > 11 || yearNum < 2000) {
      // Invalid date, don't update
      Alert.alert("Invalid Date", "Please enter a valid date");
      return;
    }
    
    // Create and validate the date
    const newDate = new Date(yearNum, monthNum, dayNum);
    
    // Check if date is valid (some months don't have 31 days)
    if (newDate.getDate() !== dayNum || newDate.getMonth() !== monthNum) {
      Alert.alert("Invalid Date", "Please enter a valid date for the selected month");
      return;
    }
    
    // Check if it's after minimum date if provided
    if (minimumDate && newDate < minimumDate) {
      Alert.alert("Invalid Date", "The date must be in the future");
      return;
    }
    
    setShow(false);
    onChange(newDate);
  };
  
  const handleCancel = () => {
    setShow(false);
  };
  
  // Months array for dropdown
  const months = [
    { label: "January", value: "01" },
    { label: "February", value: "02" },
    { label: "March", value: "03" },
    { label: "April", value: "04" },
    { label: "May", value: "05" },
    { label: "June", value: "06" },
    { label: "July", value: "07" },
    { label: "August", value: "08" },
    { label: "September", value: "09" },
    { label: "October", value: "10" },
    { label: "November", value: "11" },
    { label: "December", value: "12" }
  ];
  
  // Get days array for current month
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };
  
  const generateDaysArray = () => {
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    
    if (isNaN(monthNum) || isNaN(yearNum)) return Array.from({length: 31}, (_, i) => ({ label: String(i + 1), value: String(i + 1).padStart(2, '0') }));
    
    const daysInMonth = getDaysInMonth(monthNum, yearNum);
    return Array.from({length: daysInMonth}, (_, i) => ({ 
      label: String(i + 1), 
      value: String(i + 1).padStart(2, '0') 
    }));
  };
  
  // Generate years (current year to current year + 10)
  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 11}, (_, i) => ({ 
    label: String(currentYear + i), 
    value: String(currentYear + i) 
  }));
  
  return (
    <View>
      <TouchableOpacity onPress={showPicker} style={styles.dateButton}>
        <Calendar size={16} color="#2f95dc" />
        <Text style={styles.dateButtonText}>
          {value.toLocaleDateString()} (Tap to change)
        </Text>
      </TouchableOpacity>
      
      {/* Custom date picker modal */}
      <Modal
        visible={show}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={styles.datePickerModalOverlay}>
          <View style={styles.datePickerModalContent}>
            <View style={styles.datePickerModalHeader}>
              <TouchableOpacity 
                onPress={handleCancel}
                style={styles.datePickerHeaderButton}
              >
                <Text style={styles.datePickerCancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.datePickerModalTitle}>Select Date</Text>
              <TouchableOpacity 
                onPress={handleConfirm}
                style={styles.datePickerHeaderButton}
              >
                <Text style={styles.datePickerDoneText}>Done</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.dateInputContainer}>
              {/* Month Picker */}
              <View style={styles.datePickerColumn}>
                <Text style={styles.datePickerLabel}>Month</Text>
                <ScrollView style={styles.datePickerScrollView}>
                  {months.map(item => (
                    <TouchableOpacity
                      key={item.value}
                      style={[
                        styles.datePickerItem,
                        month === item.value && styles.datePickerItemSelected
                      ]}
                      onPress={() => setMonth(item.value)}
                    >
                      <Text 
                        style={[
                          styles.datePickerItemText,
                          month === item.value && styles.datePickerItemTextSelected
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              {/* Day Picker */}
              <View style={styles.datePickerColumn}>
                <Text style={styles.datePickerLabel}>Day</Text>
                <ScrollView style={styles.datePickerScrollView}>
                  {generateDaysArray().map(item => (
                    <TouchableOpacity
                      key={item.value}
                      style={[
                        styles.datePickerItem,
                        day === item.value && styles.datePickerItemSelected
                      ]}
                      onPress={() => setDay(item.value)}
                    >
                      <Text 
                        style={[
                          styles.datePickerItemText,
                          day === item.value && styles.datePickerItemTextSelected
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              {/* Year Picker */}
              <View style={styles.datePickerColumn}>
                <Text style={styles.datePickerLabel}>Year</Text>
                <ScrollView style={styles.datePickerScrollView}>
                  {years.map(item => (
                    <TouchableOpacity
                      key={item.value}
                      style={[
                        styles.datePickerItem,
                        year === item.value && styles.datePickerItemSelected
                      ]}
                      onPress={() => setYear(item.value)}
                    >
                      <Text 
                        style={[
                          styles.datePickerItemText,
                          year === item.value && styles.datePickerItemTextSelected
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

type Props = NativeStackScreenProps<MainStackParamList, 'Goals'>;

export function GoalsScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { 
    goals, 
    loading, 
    error, 
    fetchGoals, 
    addGoal, 
    updateGoal,
    removeGoal,
    toggleAchievement 
  } = useGoals();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetValue: '',
    category: 'scoring' as 'handicap' | 'scoring' | 'fairways' | 'greens' | 'putts' | 'custom',
    description: '',
    hasTargetDate: false,
    targetDate: new Date()
  });
  
  // For celebration animation
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationScale] = useState(new Animated.Value(0));
  
  // State for active/completed tab
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  // Add effect to show API info
  useEffect(() => {
    console.log('Current API URL:', API_URL);
    
    // Test direct fetch to server
    fetch(`${API_URL}/goals/test`)
      .then(response => {
        console.log('Direct test fetch status:', response.status);
        return response.text();
      })
      .then(text => {
        console.log('Direct test fetch result:', text);
      })
      .catch(err => {
        console.error('Direct test fetch error:', err);
      });
  }, []);
  
  // Fetch goals on screen focus
  useFocusEffect(
    useCallback(() => {
      console.log('Goals screen focused, fetching goals...');
      fetchGoals().catch(err => {
        console.error('Error in fetchGoals on focus:', err);
      });
    }, [fetchGoals])
  );

  const handleAddGoal = async () => {
    if (!newGoal.name || !newGoal.targetValue) {
      Alert.alert('Validation Error', 'Please provide a name and target value for your goal');
      return;
    }

    const goalData: CreateGoalInput = {
      name: newGoal.name,
      targetValue: parseFloat(newGoal.targetValue),
      category: newGoal.category,
      description: newGoal.description
    };

    if (newGoal.hasTargetDate) {
      goalData.targetDate = newGoal.targetDate;
    }

    try {
      await addGoal(goalData);
      setShowAddModal(false);
      
      // Reset form
      setNewGoal({
        name: '',
        targetValue: '',
        category: 'scoring',
        description: '',
        hasTargetDate: false,
        targetDate: new Date()
      });
    } catch (err) {
      Alert.alert('Error', 'Failed to create goal. Please try again.');
    }
  };

  // Handle target date change
  const handleDateChange = (date: Date) => {
    setNewGoal(prev => ({...prev, targetDate: date}));
  };
  
  // Render celebration modal
  const renderCelebrationModal = () => (
    <Modal
      visible={showCelebration}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.celebrationOverlay}>
        <Animated.View 
          style={[
            styles.celebrationContent,
            { transform: [{ scale: celebrationScale }] }
          ]}
        >
          <Award size={60} color="#4CAF50" />
          <Text style={styles.celebrationTitle}>Goal Achieved!</Text>
          <Text style={styles.celebrationText}>Congratulations on reaching your goal!</Text>
        </Animated.View>
      </View>
    </Modal>
  );

  // State for tracking the name of the completed goal
  const [completedGoalName, setCompletedGoalName] = useState('');
  
  // Show celebration animation
  const playCelebrationAnimation = (goalName: string) => {
    setCompletedGoalName(goalName);
    setShowCelebration(true);
    Animated.sequence([
      Animated.timing(celebrationScale, {
        toValue: 1.2,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(celebrationScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      })
    ]).start(() => {
      setTimeout(() => {
        setShowCelebration(false);
        celebrationScale.setValue(0);
      }, 2000);
    });
  };

  const handleToggleAchieved = async (goalId: string, newStatus: boolean) => {
    try {
      const updatedGoal = await toggleAchievement(goalId, newStatus);
      
      // If the goal was just marked as achieved, show celebration
      if (newStatus) {
        // Find the goal to get its name for the celebration
        const achievedGoal = goals.find(g => g._id === goalId);
        playCelebrationAnimation(achievedGoal?.name || 'Goal');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to update goal status. Please try again.');
    }
  };
  
  const handleDeleteGoal = async (goalId: string) => {
    try {
      await removeGoal(goalId);
      // The UI will update automatically from the hook's state management
    } catch (err) {
      Alert.alert('Error', 'Failed to delete goal. Please try again.');
    }
  };

  const getCategoryIcon = (category: string, achieved: boolean = false) => {
    const iconColor = achieved ? "#4CAF50" : "#2f95dc";
    
    switch (category) {
      case 'handicap':
        return <Target size={20} color={iconColor} />;
      case 'scoring':
        return <Flag size={20} color={iconColor} />;
      case 'fairways':
        return <ArrowUp size={20} color={iconColor} />;
      case 'greens':
        return <ArrowDown size={20} color={iconColor} />;
      case 'putts':
        return <Trophy size={20} color={iconColor} />;
      default:
        return <Target size={20} color={iconColor} />;
    }
  };

  const renderGoalItem = (goal: Goal) => {
    // Check if deadline has passed
    const deadlinePassed = goal.targetDate ? new Date() > new Date(goal.targetDate) : false;
    
    // Calculate progress percentage for visual indicator
    let progressPercent = 0;
    if (goal.currentValue !== undefined && goal.targetValue) {
      // For handicap, scoring, putts - lower is better
      if (['handicap', 'scoring', 'putts'].includes(goal.category)) {
        const initialValue = goal.category === 'handicap' ? 36 : 
                            goal.category === 'scoring' ? 120 : 45;
        progressPercent = Math.min(100, Math.max(0, 
          ((initialValue - goal.currentValue) / (initialValue - goal.targetValue)) * 100
        ));
      } else {
        // For fairways, greens - higher is better
        progressPercent = Math.min(100, Math.max(0, 
          (goal.currentValue / goal.targetValue) * 100
        ));
      }
    }
    
    // Create action sheet menu for delete/other actions
    const showOptions = () => {
      Alert.alert(
        'Goal Options', 
        'What would you like to do with this goal?',
        [
          {
            text: 'Delete Goal',
            onPress: () => confirmDelete(goal._id),
            style: 'destructive',
          },
          {
            text: goal.achieved ? 'Mark as Not Achieved' : 'Mark as Achieved',
            onPress: () => handleToggleAchieved(goal._id, !goal.achieved),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    };
    
    const confirmDelete = (goalId: string) => {
      Alert.alert(
        'Confirm Delete',
        'Are you sure you want to delete this goal? This cannot be undone.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => handleDeleteGoal(goalId),
          },
        ]
      );
    };
    
    // Format date for display
    const formatDate = (dateString?: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    };
    
    return (
      <TouchableOpacity 
        key={goal._id} 
        onLongPress={showOptions}
        activeOpacity={0.7}
      >
        <View style={[
          styles.goalCard, 
          goal.achieved && styles.achievedGoal,
          deadlinePassed && !goal.achieved && styles.expiredGoal
        ]}>
          <TouchableOpacity 
            style={[
              styles.achieveButton,
              goal.achieved && styles.achievedCheckButton
            ]}
            onPress={() => handleToggleAchieved(goal._id, !goal.achieved)}
          >
            {goal.achieved ? (
              <CheckCircle 
                size={28} 
                color="#4CAF50"
                fill="transparent"
                strokeWidth={2.5}
              />
            ) : (
              <CheckCircle 
                size={28} 
                color={deadlinePassed ? "#FF6B6B" : "#CCC"}
                fill="transparent"
                strokeWidth={1.5}
              />
            )}
          </TouchableOpacity>
          
          <View style={styles.goalContent}>
            <View style={styles.goalHeader}>
              <Text style={[
                styles.goalName,
                goal.achieved && styles.achievedText
              ]}>{goal.name}</Text>
              <TouchableOpacity onPress={showOptions}>
                <Text style={styles.goalOptionsButton}>•••</Text>
              </TouchableOpacity>
            </View>
            
            {/* Completed date for achieved goals */}
            {goal.achieved && goal.completedAt && (
              <View style={styles.completedDateContainer}>
                <Trophy size={14} color="#4CAF50" />
                <Text style={styles.completedDateText}>
                  Completed: {formatDate(goal.completedAt)}
                </Text>
              </View>
            )}
            
            <View style={styles.goalDetails}>
              <View style={styles.categoryContainer}>
                {getCategoryIcon(goal.category, goal.achieved)}
                <Text style={[
                  styles.categoryText,
                  goal.achieved && styles.achievedText
                ]}>
                  {goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}
                </Text>
              </View>
              
              <Text style={[
                styles.goalTarget,
                goal.achieved && styles.achievedText
              ]}>
                Target: {goal.targetValue}
                {goal.category === 'handicap' && ''}
                {goal.category === 'scoring' && ' strokes'}
                {goal.category === 'fairways' && '%'}
                {goal.category === 'greens' && '%'}
                {goal.category === 'putts' && ' putts'}
              </Text>
              
              {goal.currentValue !== undefined && (
                <Text style={[
                  styles.goalCurrent,
                  goal.achieved && styles.achievedText
                ]}>
                  Current: {goal.currentValue}
                  {goal.category === 'handicap' && ''}
                  {goal.category === 'scoring' && ' strokes'}
                  {goal.category === 'fairways' && '%'}
                  {goal.category === 'greens' && '%'}
                  {goal.category === 'putts' && ' putts'}
                </Text>
              )}
              
              {/* Progress bar */}
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { width: `${progressPercent}%` },
                    goal.achieved && styles.progressBarCompleted,
                    deadlinePassed && !goal.achieved && styles.progressBarExpired
                  ]} 
                />
              </View>
            </View>
            
            {goal.description && (
              <Text style={styles.goalDescription}>{goal.description}</Text>
            )}
            
            {goal.targetDate && !goal.achieved && (
              <View style={styles.dateContainer}>
                <Calendar size={16} color={deadlinePassed ? "#FF6B6B" : "#2f95dc"} />
                <Text style={[
                  styles.targetDate,
                  deadlinePassed && styles.expiredDate
                ]}>
                  {deadlinePassed ? "Deadline passed: " : "Target date: "}
                  {formatDate(goal.targetDate)}
                </Text>
              </View>
            )}
            
            {goal.achieved && (
              <View style={styles.achievedBadge}>
                <Text style={styles.achievedBadgeText}>Goal Achieved!</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderAddGoalModal = () => (
    <Modal
      visible={showAddModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowAddModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Goal</Text>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setShowAddModal(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.formContainer}>
            <FormInput 
              label="Goal Name"
              value={newGoal.name}
              onChangeText={(text) => setNewGoal({...newGoal, name: text})}
              placeholder="e.g., Break 80, Improve fairway accuracy"
            />

            <FormInput 
              label="Target Value"
              value={newGoal.targetValue}
              onChangeText={(text) => setNewGoal({...newGoal, targetValue: text})}
              placeholder="e.g., 80, 65, 12.5"
              keyboardType="numeric"
            />

            <View style={styles.formGroup}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryOptions}>
                {['handicap', 'scoring', 'fairways', 'greens', 'putts'].map(category => (
                  <TouchableOpacity 
                    key={category}
                    style={[
                      styles.categoryOption,
                      newGoal.category === category && styles.selectedCategory
                    ]}
                    onPress={() => setNewGoal({
                      ...newGoal, 
                      category: category as any
                    })}
                  >
                    {getCategoryIcon(category)}
                    <Text style={[
                      styles.categoryOptionText,
                      newGoal.category === category && styles.selectedCategoryText
                    ]}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <FormInput 
              label="Description (Optional)"
              value={newGoal.description}
              onChangeText={(text) => setNewGoal({...newGoal, description: text})}
              placeholder="Add details about your goal"
              multiline
            />

            <View style={styles.formGroup}>
              <View style={styles.toggleRow}>
                <Text style={styles.label}>Set Target Date</Text>
                <Switch
                  value={newGoal.hasTargetDate}
                  onValueChange={(value) => setNewGoal({...newGoal, hasTargetDate: value})}
                  trackColor={{ false: "#767577", true: "#81b0ff" }}
                  thumbColor={newGoal.hasTargetDate ? "#2f95dc" : "#f4f3f4"}
                />
              </View>
              
              {/* Custom DatePicker component */}
              {newGoal.hasTargetDate && (
                <CustomDatePicker 
                  value={newGoal.targetDate}
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>

            <FormButton 
              title="Add Goal"
              onPress={handleAddGoal}
              style={styles.addButton}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  if (loading && goals.length === 0) {
    return <LoadingScreen message="Loading goals..." />;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <BackButton onPress={() => navigation.goBack()} />
          <Text style={styles.screenTitle}>My Goals</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchGoals}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Filter goals based on active tab
  const activeGoals = goals.filter(goal => !goal.achieved);
  const completedGoals = goals.filter(goal => goal.achieved);
  
  // Sort goals for display
  const sortedActiveGoals = [...activeGoals].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  const sortedCompletedGoals = [...completedGoals].sort((a, b) => {
    // Sort by completedAt date if available, otherwise by updated date
    const aDate = a.completedAt ? new Date(a.completedAt) : new Date(a.updatedAt);
    const bDate = b.completedAt ? new Date(b.completedAt) : new Date(b.updatedAt);
    return bDate.getTime() - aDate.getTime();
  });
  
  // Get goals for current tab
  const currentGoals = activeTab === 'active' ? sortedActiveGoals : sortedCompletedGoals;
  
  return (
    <SafeAreaView style={styles.container}>
      <BackButton onPress={() => navigation.goBack()} />
      <View style={styles.header}>
        <Text style={styles.screenTitle}>My Goals</Text>
      </View>
      
      {/* Tab selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'active' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[
            styles.tabButtonText,
            activeTab === 'active' && styles.activeTabText
          ]}>
            Active ({activeGoals.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'completed' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[
            styles.tabButtonText,
            activeTab === 'completed' && styles.activeTabText
          ]}>
            Completed ({completedGoals.length})
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {loading && (
          <View style={styles.loadingIndicator}>
            <ActivityIndicator size="small" color="#2f95dc" />
          </View>
        )}
        
        <View style={styles.goalsContainer}>
          {currentGoals.length === 0 ? (
            <View style={styles.emptyState}>
              <Trophy size={60} color="#ccc" />
              <Text style={styles.emptyStateText}>
                {activeTab === 'active' 
                  ? "You don't have any active goals" 
                  : "You haven't completed any goals yet"}
              </Text>
              <Text style={styles.emptyStateSubtext}>
                {activeTab === 'active'
                  ? "Track your progress by setting golf performance goals"
                  : "Complete your active goals to see them here"}
              </Text>
            </View>
          ) : (
            currentGoals.map(renderGoalItem)
          )}
        </View>
      </ScrollView>
      
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={() => setShowAddModal(true)}
      >
        <Text style={styles.floatingButtonText}>+ New Goal</Text>
      </TouchableOpacity>
      
      {renderAddGoalModal()}
      <Modal
        visible={showCelebration}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.celebrationOverlay}>
          <Animated.View 
            style={[
              styles.celebrationContent,
              { transform: [{ scale: celebrationScale }] }
            ]}
          >
            <Award size={60} color="#4CAF50" />
            <Text style={styles.celebrationTitle}>Goal Achieved!</Text>
            <Text style={styles.celebrationText}>
              Congratulations on achieving: {completedGoalName}!
            </Text>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}