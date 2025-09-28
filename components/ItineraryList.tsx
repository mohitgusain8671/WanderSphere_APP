import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Dimensions,
  RefreshControl,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAppStore } from '../store';
import { format } from 'date-fns';
import { COLORS } from '../utils/constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ItineraryListProps {
  visible: boolean;
  onSelectItinerary: (itinerary: any) => void;
  onClose: () => void;
}

const ItineraryList: React.FC<ItineraryListProps> = ({ visible, onSelectItinerary, onClose }) => {
  const { colors, isDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all'); // all, recent, favorite
  const [refreshing, setRefreshing] = useState(false);
  const hasLoadedRef = useRef(false);
  
  // Use proper Zustand selectors to avoid infinite loop
  const itineraries = useAppStore(state => state.itineraries || []);
  const isItineraryLoading = useAppStore(state => state.isItineraryLoading || false);
  const getUserItineraries = useAppStore(state => state.getUserItineraries);
  const getItineraryById = useAppStore(state => state.getItineraryById);
  const deleteItinerary = useAppStore(state => state.deleteItinerary);
  
  const [fetchingItineraryId, setFetchingItineraryId] = useState<string | null>(null);

  const loadItineraries = async () => {
    try {
      await getUserItineraries();
    } catch (error) {
      Alert.alert('Error', 'Failed to load itineraries. Please try again.');
    }
  };

  useEffect(() => {
    if (visible && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadItineraries();
    }
  }, [visible]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadItineraries();
    setRefreshing(false);
  };

  const handleDeleteItinerary = (itineraryId: string) => {
    Alert.alert(
      'Delete Itinerary',
      'Are you sure you want to delete this itinerary? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteItinerary(itineraryId);
              Alert.alert('Success', 'Itinerary deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete itinerary');
            }
          },
        },
      ]
    );
  };

  const filteredItineraries = (itineraries || []).filter((itinerary: any) => {
    const matchesSearch = 
      itinerary.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      itinerary.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = () => {
      switch (filterBy) {
        case 'recent':
          const recentDate = new Date();
          recentDate.setMonth(recentDate.getMonth() - 1);
          return new Date(itinerary.createdAt) > recentDate;
        case 'favorite':
          return itinerary.rating >= 4;
        default:
          return true;
      }
    };

    return matchesSearch && matchesFilter();
  });

  const handleItineraryPress = async (itinerary: any) => {
    try {
      setFetchingItineraryId(itinerary.id);
      const result = await getItineraryById(itinerary.id);
      
      if (result.success) {
        onSelectItinerary(result.data);
      } else {
        Alert.alert('Error', 'Failed to load itinerary details. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load itinerary details. Please try again.');
    } finally {
      setFetchingItineraryId(null);
    }
  };

  const renderItineraryCard = (itinerary: any) => (
    <TouchableOpacity
      key={itinerary._id}
      style={[
        styles.itineraryCard, 
        { 
          backgroundColor: colors.card,
          opacity: fetchingItineraryId === itinerary._id ? 0.6 : 1
        }
      ]}
      onPress={() => handleItineraryPress(itinerary)}
      activeOpacity={0.7}
      disabled={fetchingItineraryId === itinerary._id}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleSection}>
          <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
            {itinerary.title || itinerary.destination}
          </Text>
          <Text style={[styles.cardDestination, { color: colors.textSecondary }]}>
            {itinerary.destination}
          </Text>
        </View>
        {fetchingItineraryId === itinerary._id ? (
          <View style={styles.deleteButton}>
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>Loading...</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteItinerary(itinerary._id)}
          >
            <MaterialIcons name="delete-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            {format(new Date(itinerary.startDate), 'MMM dd')} - {format(new Date(itinerary.endDate), 'MMM dd, yyyy')}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color={COLORS.primary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            {itinerary.duration} days
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="wallet-outline" size={16} color={COLORS.primary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            ${itinerary.budget || 'N/A'} budget
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.ratingSection}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={star <= (itinerary.rating || 0) ? "star" : "star-outline"}
              size={14}
              color={star <= (itinerary.rating || 0) ? "#FFD700" : colors.textSecondary}
            />
          ))}
          {itinerary.rating && (
            <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
              ({itinerary.rating})
            </Text>
          )}
        </View>
        
        <Text style={[styles.createdDate, { color: colors.textSecondary }]}>
          Created {format(new Date(itinerary.createdAt), 'MMM dd, yyyy')}
        </Text>
      </View>

      {itinerary.generatedPlan?.highlights && (
        <View style={styles.highlightsSection}>
          <Text style={[styles.highlightsText, { color: colors.textSecondary }]} numberOfLines={2}>
            {itinerary.generatedPlan.highlights.slice(0, 2).join(' • ')}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="map-outline" size={80} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No Itineraries Yet
      </Text>
      <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
        Start planning your first adventure by generating a new itinerary!
      </Text>
    </View>
  );

  const renderFilterButton = (filter: string, label: string, icon: string) => (
    <TouchableOpacity
      key={filter}
      style={[
        styles.filterButton,
        {
          backgroundColor: filterBy === filter ? COLORS.primary : colors.card,
          borderColor: colors.border,
        }
      ]}
      onPress={() => setFilterBy(filter)}
    >
      <Ionicons
        name={icon as any}
        size={16}
        color={filterBy === filter ? '#fff' : colors.textSecondary}
      />
      <Text
        style={[
          styles.filterButtonText,
          { color: filterBy === filter ? '#fff' : colors.textSecondary }
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          My Itineraries
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search destinations..."
          placeholderTextColor={colors.textSecondary}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity onPress={() => setSearchTerm('')}>
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Buttons */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {renderFilterButton('all', 'All', 'list-outline')}
        {renderFilterButton('recent', 'Recent', 'time-outline')}
        {renderFilterButton('favorite', 'Favorites', 'heart-outline')}
      </ScrollView>

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={[styles.resultsText, { color: colors.textSecondary }]}>
          {filteredItineraries.length} itinerar{filteredItineraries.length !== 1 ? 'ies' : 'y'} found
        </Text>
      </View>

      {/* Itineraries List */}
      <ScrollView
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {isItineraryLoading && (!itineraries || itineraries.length === 0) ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading itineraries...
            </Text>
          </View>
        ) : filteredItineraries.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.cardsContainer}>
            {filteredItineraries.map(renderItineraryCard)}
          </View>
        )}
      </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  placeholder: {
    width: 32,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  resultsText: {
    fontSize: 14,
  },
  listContainer: {
    flex: 1,
  },
  cardsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  itineraryCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitleSection: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDestination: {
    fontSize: 14,
  },
  deleteButton: {
    padding: 4,
  },
  cardDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 4,
  },
  createdDate: {
    fontSize: 12,
  },
  highlightsSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 12,
  },
  highlightsText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
  },
});

export default ItineraryList;