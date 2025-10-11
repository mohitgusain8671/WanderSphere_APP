import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

interface BudgetCalculatorProps {
  visible: boolean;
  onClose: () => void;
}

interface BudgetItem {
  category: string;
  amount: number;
  icon: string;
  color: string;
}

export const BudgetCalculator: React.FC<BudgetCalculatorProps> = ({ visible, onClose }) => {
  const { colors, isDarkMode } = useTheme();
  
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState('');
  const [groupSize, setGroupSize] = useState('1');
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([
    { category: 'Accommodation', amount: 0, icon: 'bed', color: '#3B82F6' },
    { category: 'Transportation', amount: 0, icon: 'airplane', color: '#10B981' },
    { category: 'Food & Dining', amount: 0, icon: 'restaurant', color: '#F59E0B' },
    { category: 'Activities', amount: 0, icon: 'camera', color: '#8B5CF6' },
    { category: 'Shopping', amount: 0, icon: 'bag', color: '#EF4444' },
    { category: 'Miscellaneous', amount: 0, icon: 'card', color: '#6B7280' }
  ]);

  const updateBudgetItem = (index: number, amount: string) => {
    const newItems = [...budgetItems];
    newItems[index].amount = parseFloat(amount) || 0;
    setBudgetItems(newItems);
  };

  const getTotalBudget = () => {
    return budgetItems.reduce((total, item) => total + item.amount, 0);
  };

  const getBudgetPerPerson = () => {
    const total = getTotalBudget();
    const people = parseInt(groupSize) || 1;
    return total / people;
  };

  const getBudgetPerDay = () => {
    const total = getTotalBudget();
    const days = parseInt(duration) || 1;
    return total / days;
  };

  const resetCalculator = () => {
    setDestination('');
    setDuration('');
    setGroupSize('1');
    setBudgetItems(budgetItems.map(item => ({ ...item, amount: 0 })));
  };

  const shareCalculation = () => {
    const total = getTotalBudget();
    const perPerson = getBudgetPerPerson();
    const perDay = getBudgetPerDay();
    
    Alert.alert(
      'Budget Summary',
      `Trip to ${destination || 'Your Destination'}\n` +
      `Duration: ${duration || 'N/A'} days\n` +
      `Group Size: ${groupSize} people\n\n` +
      `Total Budget: $${total.toFixed(2)}\n` +
      `Per Person: $${perPerson.toFixed(2)}\n` +
      `Per Day: $${perDay.toFixed(2)}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Header */}
        <View style={{
          backgroundColor: '#10B981',
          paddingTop: 60,
          paddingBottom: 20,
          paddingHorizontal: 20,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16
          }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 12,
                padding: 8,
              }}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>

            <Text style={{
              color: 'white',
              fontSize: 20,
              fontWeight: '800',
            }}>
              Budget Calculator
            </Text>

            <TouchableOpacity
              onPress={resetCalculator}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 12,
                padding: 8,
              }}
            >
              <Ionicons name="refresh" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <Text style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: 14,
            textAlign: 'center',
          }}>
            Plan your travel budget with precision
          </Text>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* Trip Details */}
          <View style={{ padding: 20 }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '700',
              color: colors.text,
              marginBottom: 16,
            }}>
              Trip Details
            </Text>

            {/* Destination */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 8,
              }}>
                Destination
              </Text>
              <TextInput
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 16,
                  color: colors.text,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
                placeholder="Where are you going?"
                placeholderTextColor={colors.textSecondary}
                value={destination}
                onChangeText={setDestination}
              />
            </View>

            {/* Duration and Group Size */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: colors.text,
                  marginBottom: 8,
                }}>
                  Duration (days)
                </Text>
                <TextInput
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 12,
                    padding: 16,
                    fontSize: 16,
                    color: colors.text,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                  placeholder="7"
                  placeholderTextColor={colors.textSecondary}
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="numeric"
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: colors.text,
                  marginBottom: 8,
                }}>
                  Group Size
                </Text>
                <TextInput
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 12,
                    padding: 16,
                    fontSize: 16,
                    color: colors.text,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                  placeholder="1"
                  placeholderTextColor={colors.textSecondary}
                  value={groupSize}
                  onChangeText={setGroupSize}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Budget Categories */}
            <Text style={{
              fontSize: 18,
              fontWeight: '700',
              color: colors.text,
              marginBottom: 16,
            }}>
              Budget Breakdown
            </Text>

            {budgetItems.map((item, index) => (
              <View
                key={item.category}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: `${item.color}20`,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 16,
                }}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: colors.text,
                    marginBottom: 4,
                  }}>
                    {item.category}
                  </Text>
                  <TextInput
                    style={{
                      fontSize: 14,
                      color: colors.textSecondary,
                      backgroundColor: 'transparent',
                      padding: 0,
                    }}
                    placeholder="$0.00"
                    placeholderTextColor={colors.textSecondary}
                    value={item.amount > 0 ? item.amount.toString() : ''}
                    onChangeText={(text) => updateBudgetItem(index, text)}
                    keyboardType="numeric"
                  />
                </View>

                <Text style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: item.color,
                }}>
                  ${item.amount.toFixed(2)}
                </Text>
              </View>
            ))}

            {/* Budget Summary */}
            <View style={{
              backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
              borderRadius: 16,
              padding: 20,
              marginTop: 20,
              borderLeftWidth: 4,
              borderLeftColor: '#10B981',
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '700',
                color: '#10B981',
                marginBottom: 16,
              }}>
                Budget Summary
              </Text>

              <View style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: colors.text, fontWeight: '600' }}>Total Budget:</Text>
                  <Text style={{ color: '#10B981', fontWeight: '700', fontSize: 16 }}>
                    ${getTotalBudget().toFixed(2)}
                  </Text>
                </View>

                {parseInt(groupSize) > 1 && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: colors.text, fontWeight: '600' }}>Per Person:</Text>
                    <Text style={{ color: colors.text, fontWeight: '600' }}>
                      ${getBudgetPerPerson().toFixed(2)}
                    </Text>
                  </View>
                )}

                {parseInt(duration) > 0 && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: colors.text, fontWeight: '600' }}>Per Day:</Text>
                    <Text style={{ color: colors.text, fontWeight: '600' }}>
                      ${getBudgetPerDay().toFixed(2)}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Action Buttons */}
            <View style={{ marginTop: 24, gap: 12 }}>
              <TouchableOpacity
                onPress={shareCalculation}
                style={{
                  backgroundColor: '#10B981',
                  borderRadius: 12,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="share" size={20} color="white" style={{ marginRight: 8 }} />
                <Text style={{
                  color: 'white',
                  fontSize: 16,
                  fontWeight: '600',
                }}>
                  Share Budget
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={resetCalculator}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Ionicons name="refresh" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
                <Text style={{
                  color: colors.textSecondary,
                  fontSize: 16,
                  fontWeight: '600',
                }}>
                  Reset Calculator
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};