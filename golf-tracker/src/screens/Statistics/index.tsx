// src/screens/Statistics/index.tsx
import React, { useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../config/navigation';
import { useRounds } from '../../hooks/useRounds';
import { Round } from 'shared';
import { BackButton } from '../../components/common/BackButton';
import { 
  ArrowDownAZ, 
  Calendar, 
  Flag, 
  Target, 
  BarChart as BarChartIcon,
  ArrowUp, 
  ArrowDown,
  CalendarClock,
  Clock,
  Circle
} from 'lucide-react-native';
import {
  LineChart
} from 'react-native-chart-kit';
import { styles } from './styles';

type Props = NativeStackScreenProps<MainStackParamList, 'Statistics'>;

// Size for charts
const screenWidth = Dimensions.get('window').width - 50; // Account for padding

// Statistic type
type StatType = 'score' | 'differential' | 'fairways' | 'greens' | 'putts';

// View type
type ViewType = 'byRound' | 'byDate';

// Time range for date view
type TimeRange = '1m' | '3m' | '1y' | 'all';

// Round range for round view
type RoundRange = '20' | '50' | '100' | 'all';

// Get color for the tee
function getTeeColor(teeName: string): string {
  const teeColorMap: Record<string, string> = {
    'black': '#000000',
    'blue': '#0066CC',
    'white': '#FFFFFF',
    'red': '#CC0000',
    'gold': '#FFD700',
    'green': '#006400',
    'yellow': '#FFFF00',
    'silver': '#C0C0C0',
    'copper': '#B87333',
    'championship': '#000000',
    'tournament': '#000000',
    'member': '#0066CC',
    'senior': '#CC0000',
    'ladies': '#CC0000',
    'forward': '#CC0000',
    'middle': '#FFFFFF'
  };

  const lowercaseTee = teeName.toLowerCase();
  return teeColorMap[lowercaseTee] || '#AAAAAA'; // Default to gray if not found
}

// Select rounds based on time range
function filterRoundsByTimeRange(rounds: Round[], timeRange: TimeRange): Round[] {
  const now = new Date();
  let cutoffDate = new Date();
  
  switch (timeRange) {
    case '1m':
      cutoffDate.setMonth(now.getMonth() - 1);
      break;
    case '3m':
      cutoffDate.setMonth(now.getMonth() - 3);
      break;
    case '1y':
      cutoffDate.setFullYear(now.getFullYear() - 1);
      break;
    case 'all':
      return rounds;
  }
  
  return rounds.filter(round => new Date(round.date) >= cutoffDate);
}

// Select rounds based on round range
function filterRoundsByCount(rounds: Round[], roundRange: RoundRange): Round[] {
  const sortedRounds = [...rounds].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  switch (roundRange) {
    case '20':
      return sortedRounds.slice(0, 20).reverse();
    case '50':
      return sortedRounds.slice(0, 50).reverse();
    case '100':
      return sortedRounds.slice(0, 100).reverse();
    case 'all':
      return sortedRounds.reverse();
  }
}

// Get stat value from a round
function getStatValue(round: Round, statType: StatType): number {
  switch (statType) {
    case 'score':
      return round.score;
    case 'differential':
      return round.differential;
    case 'fairways':
      return round.fairways;
    case 'greens':
      return round.greens;
    case 'putts':
      return round.putts;
    default:
      return 0;
  }
}

// Format date for display
function formatDate(date: Date): string {
  // Format as MM/DD (e.g., 4/15)
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

// Format date for detailed display
function formatFullDate(date: Date): string {
  // Keep month and day but leave out month name
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

// Process rounds data for the chart
// Calculate linear regression (line of best fit)
function calculateRegression(data: number[]): { slope: number; intercept: number } {
  if (data.length < 2) return { slope: 0, intercept: 0 };
  
  const n = data.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += data[i];
    sumXY += i * data[i];
    sumXX += i * i;
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return { slope, intercept };
}

function generateRegressionLine(data: number[]): number[] {
  if (data.length < 2) return [];
  
  const { slope, intercept } = calculateRegression(data);
  const result = [];
  
  for (let i = 0; i < data.length; i++) {
    result.push(slope * i + intercept);
  }
  
  return result;
}

function processChartData(rounds: Round[], statType: StatType, viewType: ViewType) {
  if (rounds.length === 0) {
    return {
      chartData: {
        labels: [],
        datasets: [{
          data: [],
          color: () => '#2f95dc',
          strokeWidth: 2
        }]
      },
      keyLabels: [],
      trend: {
        value: 0,
        isPositive: false
      },
      colors: [],
      tees: [],
      regressionLine: []
    };
  }
  
  // Get key rounds (best scores, top fairways/greens hits)
  const statValues = rounds.map(round => ({
    round,
    value: getStatValue(round, statType)
  }));
  
  // Sort by value (ascending for score/differential/putts, descending for fairways/greens)
  const isHigherBetter = statType === 'fairways' || statType === 'greens';
  const sortedByValue = [...statValues].sort((a, b) => 
    isHigherBetter ? b.value - a.value : a.value - b.value
  );
  
  // Get top 3 rounds
  const keyRounds = new Set(sortedByValue.slice(0, 3).map(item => item.round._id));
  
  // Prepare data
  let labels: string[] = [];
  let data: number[] = [];
  let colors: string[] = [];
  let keyLabels: { 
    value: number; 
    index: number; 
    label: string;
    course: string;
    date: Date;
    teeColor: string;
  }[] = [];
  
  rounds.forEach((round, index) => {
    const value = getStatValue(round, statType);
    data.push(value);
    
    // Create label based on view type
    if (viewType === 'byDate') {
      labels.push(formatDate(new Date(round.date)));
    } else {
      // For round view, still show dates
      labels.push(formatDate(new Date(round.date)));
    }
    
    // Mark key rounds
    const isKey = keyRounds.has(round._id);
    const color = isKey 
      ? (isHigherBetter ? '#28a745' : '#dc3545')
      : '#2f95dc';
      
    colors.push(color);
    
    if (isKey) {
      const courseName = typeof round.course === 'object' ? round.course.name : 'Unknown';
      keyLabels.push({
        value,
        index,
        label: `${courseName} (${round.tees}): ${value}`,
        course: courseName,
        date: new Date(round.date),
        teeColor: getTeeColor(round.tees)
      });
    }
  });
  
  // For a sparse display, keep only every nth label if there are too many, but always keep key round labels
  let finalLabels = [...labels];
  if (labels.length > 5) {
    const step = Math.ceil(labels.length / 5); // Reduce number of labels for better readability
    // Keep key round indices to ensure they always have labels
    const keyIndices = keyLabels.map(item => item.index);
    finalLabels = labels.map((label, i) => {
      if (i % step === 0 || keyIndices.includes(i)) {
        // For key points, provide more detail
        if (keyIndices.includes(i)) {
          const keyItem = keyLabels.find(item => item.index === i);
          if (keyItem && viewType === 'byDate') {
            return formatDate(keyItem.date);
          }
        }
        return label;
      }
      return '';
    });
  }
  
  // Calculate trend
  const trend = data.length >= 2 ? data[data.length - 1] - data[0] : 0;
  const isPositiveTrend = (isHigherBetter && trend > 0) || (!isHigherBetter && trend < 0);
  
  // Generate regression line data
  const regressionLine = generateRegressionLine(data);
  
  return {
    chartData: {
      labels: finalLabels,
      datasets: [
        {
          data,
          // We'll handle the color at the chart config level
          strokeWidth: 2
        },
        // Add regression line dataset - always gray
        {
          data: regressionLine,
          color: (opacity = 1) => `rgba(128, 128, 128, ${opacity})`,
          strokeWidth: 2.5,
          strokeDashArray: [6, 3], // Dashed line
          withDots: false,
          withShadow: false
        }
      ]
    },
    keyLabels,
    trend: {
      value: Math.abs(trend),
      isPositive: isPositiveTrend
    },
    colors,
    tees: rounds.map(r => r.tees),
    regressionLine
  };
}

// Chart option buttons for time/round ranges
function RangeButtons({ 
  currentRange, 
  options, 
  onChange 
}: { 
  currentRange: string; 
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.rangeContainer}>
      {options.map(option => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.rangeButton,
            currentRange === option.value && styles.rangeButtonActive
          ]}
          onPress={() => onChange(option.value)}
        >
          <Text
            style={[
              styles.rangeButtonText,
              currentRange === option.value && styles.rangeButtonTextActive
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// Statistic selector
function StatSelector({
  stats,
  selectedStat,
  onSelect
}: {
  stats: { label: string; value: StatType; icon: React.ReactNode }[];
  selectedStat: StatType;
  onSelect: (stat: StatType) => void;
}) {
  return (
    <View style={styles.statSelectorContainer}>
      <FlatList
        horizontal
        data={stats}
        keyExtractor={item => item.value}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.statButton,
              selectedStat === item.value && styles.statButtonActive
            ]}
            onPress={() => onSelect(item.value)}
          >
            <View style={styles.statButtonIcon}>
              {item.icon}
            </View>
            <Text style={[
              styles.statButtonText,
              selectedStat === item.value && styles.statButtonTextActive
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.statList}
      />
    </View>
  );
}

export function StatisticsScreen({ navigation }: Props) {
  const { rounds, loading, error, getUserRounds } = useRounds();
  const [viewType, setViewType] = useState<ViewType>('byRound');
  const [selectedStat, setSelectedStat] = useState<StatType>('score');
  const [timeRange, setTimeRange] = useState<TimeRange>('3m');
  const [roundRange, setRoundRange] = useState<RoundRange>('20');
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);
  
  // Load rounds when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('Statistics screen in focus - loading rounds');
      getUserRounds();
    }, [getUserRounds])
  );

  // Toggle view type
  const toggleViewType = () => {
    setViewType(prev => prev === 'byRound' ? 'byDate' : 'byRound');
  };

  // Filter rounds based on selected range
  const filteredRounds = useMemo(() => {
    if (viewType === 'byDate') {
      return filterRoundsByTimeRange(rounds, timeRange);
    } else {
      return filterRoundsByCount(rounds, roundRange);
    }
  }, [rounds, viewType, timeRange, roundRange]);

  // Process chart data
  const { chartData, keyLabels, trend, colors, tees } = useMemo(() => {
    // Make sure rounds are chronologically sorted for evenly distributed dates
    const chronologicalRounds = [...filteredRounds].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const result = processChartData(chronologicalRounds, selectedStat, viewType);
    console.log("Chart data generated:", result);
    return result;
  }, [filteredRounds, selectedStat, viewType]);

  // Get domain information - Calculate min/max for better Y axis visualization
  const yAxisBounds = useMemo(() => {
    if (!chartData || !chartData.datasets || !chartData.datasets[0] || chartData.datasets[0].data.length === 0) {
      return { min: 0, max: 100 };
    }
    
    const data = chartData.datasets[0].data;
    const minY = Math.min(...data);
    const maxY = Math.max(...data);
    const range = maxY - minY;
    
    let adjustedMinY, adjustedMaxY;
    
    if (selectedStat === 'fairways' || selectedStat === 'greens') {
      // For fairways and greens, start at 0 and go up to next multiple of 5 above max
      adjustedMinY = 0;
      adjustedMaxY = Math.min(18, Math.ceil((maxY + 1) / 5) * 5);
    } else {
      // For score, differential, putts, add padding
      adjustedMinY = Math.max(0, Math.floor((minY - range * 0.1) / 5) * 5);
      adjustedMaxY = Math.ceil((maxY + range * 0.1) / 5) * 5;
    }
    
    return {
      min: adjustedMinY,
      max: adjustedMaxY
    };
  }, [chartData, selectedStat]);

  // Get chart config
  const chartConfig = useMemo(() => {
    // Determine if higher values are better for this stat
    const isHigherBetter = selectedStat === 'fairways' || selectedStat === 'greens';
    
    // Always get chronologically sorted rounds for consistent trend calculation
    const chronologicalRounds = [...filteredRounds].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Calculate trend from oldest to newest round
    const trendData = chronologicalRounds.length >= 2 ? 
      getStatValue(chronologicalRounds[chronologicalRounds.length-1], selectedStat) - 
      getStatValue(chronologicalRounds[0], selectedStat) : 0;
    
    // Determine color based on trend and stat type
    let lineColor;
    
    // No change = gray
    if (trendData === 0 || chronologicalRounds.length < 2) {
      lineColor = '128, 128, 128'; // Gray
    } 
    // For score, differential, putts: green when decreasing, red when increasing
    else if (selectedStat === 'score' || selectedStat === 'differential' || selectedStat === 'putts') {
      lineColor = trendData < 0 
        ? '40, 167, 69'  // Green (good) - score decreasing
        : '220, 53, 69'; // Red (bad) - score increasing
    }
    // For fairways, greens: green when increasing, red when decreasing
    else {
      lineColor = trendData > 0
        ? '40, 167, 69'  // Green (good) - fairways/greens increasing
        : '220, 53, 69'; // Red (bad) - fairways/greens decreasing
    }
    
    return {
      backgroundGradientFrom: "#ffffff",
      backgroundGradientTo: "#ffffff",
      color: (opacity = 1) => `rgba(${lineColor}, ${opacity})`,
      strokeWidth: 2,
      decimalPlaces: 0,
      propsForDots: {
        r: "5",
        strokeWidth: "1",
        stroke: "#fff"
      },
      useShadowColorFromDataset: false,
      fillShadowGradient: lineColor.includes('128') ? '#808080' : 
                          lineColor.includes('40') ? '#28a745' : '#dc3545',
      fillShadowGradientOpacity: 0.1 // Light fill under the curve
    };
  }, [selectedStat, filteredRounds]);

  // Available stats with icons
  const stats = [
    { 
      label: 'Score', 
      value: 'score' as StatType,
      icon: <Target size={18} color="#2f95dc" />
    },
    { 
      label: 'Differential', 
      value: 'differential' as StatType,
      icon: <Clock size={18} color="#2f95dc" />
    },
    { 
      label: 'Fairways', 
      value: 'fairways' as StatType,
      icon: <ArrowUp size={18} color="#2f95dc" />
    },
    { 
      label: 'Greens', 
      value: 'greens' as StatType,
      icon: <Flag size={18} color="#2f95dc" />
    },
    { 
      label: 'Putts', 
      value: 'putts' as StatType,
      icon: <BarChartIcon size={18} color="#2f95dc" />
    }
  ];

  // Range options
  const timeRangeOptions = [
    { label: '1M', value: '1m' },
    { label: '3M', value: '3m' },
    { label: '1Y', value: '1y' },
    { label: 'All', value: 'all' }
  ];

  const roundRangeOptions = [
    { label: '20', value: '20' },
    { label: '50', value: '50' },
    { label: '100', value: '100' },
    { label: 'All', value: 'all' }
  ];

  // Chart title
  const getChartTitle = () => {
    switch (selectedStat) {
      case 'score': return 'Score Trend';
      case 'differential': return 'Handicap Differential';
      case 'fairways': return 'Fairways Hit';
      case 'greens': return 'Greens in Regulation';
      case 'putts': return 'Putts per Round';
    }
  };

  // Collect unique tee types
  const uniqueTees = useMemo(() => {
    return Array.from(new Set(tees));
  }, [tees]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2f95dc" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => getUserRounds()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <View style={styles.header}>
        <Text style={styles.title}>Statistics</Text>
        <TouchableOpacity style={styles.viewTypeButton} onPress={toggleViewType}>
          {viewType === 'byRound' ? (
            <ArrowDownAZ size={20} color="#2f95dc" />
          ) : (
            <Calendar size={20} color="#2f95dc" />
          )}
          <Text style={styles.viewTypeLabel}>
            {viewType === 'byRound' ? 'By Round' : 'By Date'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stat selector */}
      <StatSelector
        stats={stats}
        selectedStat={selectedStat}
        onSelect={setSelectedStat}
      />

      {/* Range selector */}
      {viewType === 'byDate' ? (
        <RangeButtons
          currentRange={timeRange}
          options={timeRangeOptions}
          onChange={(value) => setTimeRange(value as TimeRange)}
        />
      ) : (
        <RangeButtons
          currentRange={roundRange}
          options={roundRangeOptions}
          onChange={(value) => setRoundRange(value as RoundRange)}
        />
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!chartData || !chartData.datasets || !chartData.datasets[0] || chartData.datasets[0].data.length === 0 ? (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>
              No rounds available for the selected time range.
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddRound')}
            >
              <Text style={styles.addButtonText}>Add Round</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>{getChartTitle()}</Text>
              {trend.value > 0 && (
                <View style={styles.trendContainer}>
                  {/* For score, differential and putts, we want down arrows to be green (lower is better) */}
                  {(selectedStat === 'score' || selectedStat === 'differential' || selectedStat === 'putts') ? (
                    trend.isPositive ? (
                      <ArrowDown size={16} color="#28a745" />
                    ) : (
                      <ArrowUp size={16} color="#dc3545" />
                    )
                  ) : (
                    /* For fairways and greens, we want up arrows to be green (higher is better) */
                    trend.isPositive ? (
                      <ArrowUp size={16} color="#28a745" />
                    ) : (
                      <ArrowDown size={16} color="#dc3545" />
                    )
                  )}
                  <Text
                    style={[
                      styles.trendValue,
                      trend.isPositive ? styles.goodTrend : styles.badTrend
                    ]}
                  >
                    {trend.value.toFixed(1)}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.chart}>
              <LineChart
                data={chartData}
                width={screenWidth}
                height={240}
                chartConfig={{
                  ...chartConfig,
                  // Add additional styling but keep the color logic from chartConfig
                  propsForBackgroundLines: {
                    strokeDasharray: '',
                  },
                  propsForLabels: {
                    fontSize: 12,
                  },
                  // Configure y-axis labels to be horizontal
                  propsForVerticalLabels: {
                    rotation: 85,
                    fontSize: 11,
                    fill: 'black'
                  },
                  // Configure x-axis labels to be angled
                  propsForHorizontalLabels: {
                    rotation: 0,
                    fontSize: 10,
                    fill: 'black'
                  }
                }}
                bezier
                style={styles.chartStyle}
                fromZero={selectedStat === 'fairways' || selectedStat === 'greens'}
                yAxisSuffix=""
                yAxisLabel=""
                withInnerLines={true}
                withOuterLines={true}
                withHorizontalLabels={true}
                withVerticalLabels={true}
                withDots={true}
                segments={5}
                yAxisInterval={1}
                formatYLabel={(value) => value}
                formatXLabel={(label) => label}
                verticalLabelRotation={0}
                horizontalLabelRotation={75}
                withShadow={true}
                // Custom dot rendering
                renderDotContent={({ x, y, indexData, index }) => {
                  // Only show dots for the first dataset (main data)
                  if (index > 0) return null;
                  return null; // We handle this with our interactive layer
                }}
                fromNumber={yAxisBounds.max}
                // Chart padding config available as chart-specific props
              />
              
              {/* Interactive data points area */}
              <View 
                style={[styles.chartInteractionLayer, { width: screenWidth, height: 240 }]}
                onStartShouldSetResponder={() => true}
                onMoveShouldSetResponder={() => true}
                onResponderGrant={(evt) => {
                  const { locationX } = evt.nativeEvent;
                  const pointWidth = screenWidth / chartData.datasets[0].data.length;
                  const index = Math.floor(locationX / pointWidth);
                  if (index >= 0 && index < chartData.datasets[0].data.length) {
                    setActivePointIndex(index);
                  }
                }}
                onResponderMove={(evt) => {
                  const { locationX } = evt.nativeEvent;
                  const pointWidth = screenWidth / chartData.datasets[0].data.length;
                  const index = Math.min(
                    Math.max(0, Math.floor(locationX / pointWidth)),
                    chartData.datasets[0].data.length - 1
                  );
                  setActivePointIndex(index);
                }}
                onResponderRelease={() => {
                  setActivePointIndex(null);
                }}
              />
              
              {/* Active point tooltip */}
              {activePointIndex !== null && chartData.datasets[0].data[activePointIndex] !== undefined && (
                <View 
                  style={[
                    styles.activePointLabel,
                    {
                      left: (activePointIndex / (chartData.datasets[0].data.length - 1)) * (screenWidth - 40) + 35,
                      top: 240 - ((chartData.datasets[0].data[activePointIndex] - yAxisBounds.min) / (yAxisBounds.max - yAxisBounds.min)) * 200 - 40
                    }
                  ]}
                >
                  <Text style={styles.activePointValue}>
                    {chartData.datasets[0].data[activePointIndex]}
                  </Text>
                  
                  <View style={styles.activePointDetails}>
                    <View style={styles.activePointDetail}>
                      <CalendarClock size={12} color="#666" />
                      <Text style={styles.activePointText}>
                        {formatFullDate(new Date(filteredRounds[activePointIndex].date))}
                      </Text>
                    </View>
                    
                    <View style={styles.activePointDetail}>
                      <Flag size={12} color="#666" />
                      <Text style={styles.activePointText} numberOfLines={1} ellipsizeMode="tail">
                        {typeof filteredRounds[activePointIndex].course === 'object' 
                          ? filteredRounds[activePointIndex].course.name 
                          : 'Unknown course'}
                      </Text>
                    </View>
                    
                    <View style={styles.activePointDetail}>
                      <Circle size={12} color={getTeeColor(filteredRounds[activePointIndex].tees)} />
                      <Text style={styles.activePointText}>
                        {filteredRounds[activePointIndex].tees}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
              
              {/* Chart details section */}
              <View style={styles.chartDetailsSection}>
                <Text style={styles.chartDetailsSectionTitle}>Chart Details</Text>
                <View style={styles.chartDetailsRow}>
                  <View style={styles.chartDetailItem}>
                    <Text style={styles.chartDetailLabel}>Rounds</Text>
                    <Text style={styles.chartDetailValue}>{filteredRounds.length}</Text>
                  </View>
                  <View style={styles.chartDetailItem}>
                    <Text style={styles.chartDetailLabel}>Average</Text>
                    <Text style={styles.chartDetailValue}>
                      {chartData.datasets[0].data.length > 0 
                        ? (chartData.datasets[0].data.reduce((a, b) => a + b, 0) / chartData.datasets[0].data.length).toFixed(1)
                        : "N/A"}
                    </Text>
                  </View>
                  <View style={styles.chartDetailItem}>
                    <Text style={styles.chartDetailLabel}>Best</Text>
                    <Text style={styles.chartDetailValue}>
                      {chartData.datasets[0].data.length > 0 
                        ? (selectedStat === 'fairways' || selectedStat === 'greens'
                            ? Math.max(...chartData.datasets[0].data)
                            : Math.min(...chartData.datasets[0].data))
                        : "N/A"}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.chartDetailsRow}>
                  <View style={styles.chartDetailItem}>
                    <Text style={styles.chartDetailLabel}>Trend</Text>
                    <View style={styles.trendDetail}>
                      {trend.value > 0 && (
                        <View style={styles.trendIconContainer}>
                          {/* For score, differential and putts, we want down arrows to be green (lower is better) */}
                          {(selectedStat === 'score' || selectedStat === 'differential' || selectedStat === 'putts') ? (
                            trend.isPositive ? (
                              <ArrowDown size={14} color="#28a745" />
                            ) : (
                              <ArrowUp size={14} color="#dc3545" />
                            )
                          ) : (
                            /* For fairways and greens, we want up arrows to be green (higher is better) */
                            trend.isPositive ? (
                              <ArrowUp size={14} color="#28a745" />
                            ) : (
                              <ArrowDown size={14} color="#dc3545" />
                            )
                          )}
                        </View>
                      )}
                      <Text 
                        style={[
                          styles.chartDetailValue,
                          trend.value > 0 ? (trend.isPositive ? styles.goodTrend : styles.badTrend) : {}
                        ]}
                      >
                        {trend.value.toFixed(1)}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.chartDetailItem}>
                    <Text style={styles.chartDetailLabel}>Date Range</Text>
                    <Text style={styles.chartDetailValue}>
                      {filteredRounds.length > 0 
                        ? `${formatFullDate(new Date(filteredRounds[0].date))} - ${formatFullDate(new Date(filteredRounds[filteredRounds.length-1].date))}` 
                        : "N/A"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}