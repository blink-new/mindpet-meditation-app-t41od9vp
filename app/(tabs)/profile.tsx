import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DataService, { PetStats } from '../../services/DataService';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

const mockAchievements: Achievement[] = [
  {
    id: '1',
    title: 'First Steps',
    description: 'Complete your first meditation session',
    icon: '🌱',
    unlocked: true,
    unlockedAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'Week Warrior',
    description: 'Maintain a 7-day meditation streak',
    icon: '🔥',
    unlocked: true,
    unlockedAt: '2024-01-22'
  },
  {
    id: '3',
    title: 'Month Master',
    description: 'Maintain a 30-day meditation streak',
    icon: '🏆',
    unlocked: false
  },
  {
    id: '4',
    title: 'Zen Master',
    description: 'Complete 100 meditation sessions',
    icon: '🧘‍♀️',
    unlocked: false
  },
  {
    id: '5',
    title: 'Time Keeper',
    description: 'Meditate for 1000 total minutes',
    icon: '⏰',
    unlocked: false
  },
  {
    id: '6',
    title: 'Pet Whisperer',
    description: 'Reach pet level 10',
    icon: '🐾',
    unlocked: false
  }
];

export default function ProfileScreen() {
  const [petStats, setPetStats] = useState<PetStats | null>(null);
  const [loading, setLoading] = useState(true);
  const dataService = DataService.getInstance();

  useEffect(() => {
    loadPetStats();
  }, []);

  const loadPetStats = async () => {
    try {
      const stats = await dataService.getPetStats();
      setPetStats(stats);
    } catch (error) {
      console.error('Error loading pet stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, color }: {
    title: string;
    value: string | number;
    subtitle: string;
    color: string;
  }) => (
    <View style={{
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      flex: 1,
      marginHorizontal: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color, marginBottom: 4 }}>
        {value}
      </Text>
      <Text style={{ fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 2 }}>
        {title}
      </Text>
      <Text style={{ fontSize: 12, color: '#64748B' }}>
        {subtitle}
      </Text>
    </View>
  );

  const AchievementBadge = ({ achievement }: { achievement: Achievement }) => (
    <View style={{
      backgroundColor: achievement.unlocked ? '#FFFFFF' : '#F8FAFC',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      opacity: achievement.unlocked ? 1 : 0.6,
      borderWidth: achievement.unlocked ? 0 : 1,
      borderColor: '#E5E7EB',
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{
          width: 48,
          height: 48,
          backgroundColor: achievement.unlocked ? '#F0F9FF' : '#F1F5F9',
          borderRadius: 24,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}>
          <Text style={{ fontSize: 24 }}>{achievement.icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: achievement.unlocked ? '#1E293B' : '#64748B',
            marginBottom: 2,
          }}>
            {achievement.title}
          </Text>
          <Text style={{
            fontSize: 14,
            color: '#64748B',
            marginBottom: achievement.unlocked && achievement.unlockedAt ? 4 : 0,
          }}>
            {achievement.description}
          </Text>
          {achievement.unlocked && achievement.unlockedAt && (
            <Text style={{ fontSize: 12, color: '#10B981' }}>
              Unlocked {achievement.unlockedAt}
            </Text>
          )}
        </View>
        {achievement.unlocked && (
          <Ionicons name="checkmark-circle" size={24} color="#10B981" />
        )}
      </View>
    </View>
  );

  const StreakCalendar = () => {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    const getDayStatus = (day: number | null) => {
      if (!day || !petStats) return 'empty';
      
      const currentDay = today.getDate();
      if (day > currentDay) return 'future';
      
      // Mock meditation data - in real app, this would come from actual data
      const hasMediated = Math.random() > 0.3; // 70% chance of meditation
      return hasMediated ? 'completed' : 'missed';
    };

    return (
      <View style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
      }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#1E293B', marginBottom: 16 }}>
          This Month's Progress
        </Text>
        
        {/* Day labels */}
        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((dayLabel, index) => (
            <View key={index} style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '500' }}>
                {dayLabel}
              </Text>
            </View>
          ))}
        </View>
        
        {/* Calendar grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {days.map((day, index) => {
            const status = getDayStatus(day);
            let backgroundColor = '#F8FAFC';
            let textColor = '#64748B';
            
            if (status === 'completed') {
              backgroundColor = '#10B981';
              textColor = '#FFFFFF';
            } else if (status === 'missed') {
              backgroundColor = '#EF4444';
              textColor = '#FFFFFF';
            } else if (status === 'future') {
              backgroundColor = '#F1F5F9';
              textColor = '#9CA3AF';
            }
            
            return (
              <View
                key={index}
                style={{
                  width: `${100/7}%`,
                  aspectRatio: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 4,
                }}
              >
                {day && (
                  <View style={{
                    width: 28,
                    height: 28,
                    backgroundColor,
                    borderRadius: 14,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Text style={{
                      fontSize: 12,
                      fontWeight: '500',
                      color: textColor,
                    }}>
                      {day}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
        
        {/* Legend */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
            <View style={{
              width: 12,
              height: 12,
              backgroundColor: '#10B981',
              borderRadius: 6,
              marginRight: 4,
            }} />
            <Text style={{ fontSize: 12, color: '#64748B' }}>Meditated</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{
              width: 12,
              height: 12,
              backgroundColor: '#EF4444',
              borderRadius: 6,
              marginRight: 4,
            }} />
            <Text style={{ fontSize: 12, color: '#64748B' }}>Missed</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, color: '#64748B' }}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  if (!petStats) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, color: '#64748B' }}>Error loading profile</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <ScrollView style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1E293B' }}>
              Profile
            </Text>
            <TouchableOpacity style={{
              width: 40,
              height: 40,
              backgroundColor: '#FFFFFF',
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 1,
            }}>
              <Ionicons name="settings-outline" size={20} color="#6366F1" />
            </TouchableOpacity>
          </View>
          <Text style={{ color: '#64748B' }}>
            Track your meditation journey and achievements
          </Text>
        </View>

        {/* User Info */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <View style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: 20,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}>
            <View style={{
              width: 80,
              height: 80,
              backgroundColor: '#6366F1',
              borderRadius: 40,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}>
              <Text style={{ fontSize: 32 }}>🧘‍♀️</Text>
            </View>
            <Text style={{ fontSize: 20, fontWeight: '600', color: '#1E293B', marginBottom: 4 }}>
              Meditation Master
            </Text>
            <Text style={{ color: '#64748B', marginBottom: 8 }}>
              Level {petStats.level} • {petStats.streak} day streak
            </Text>
            <View style={{
              backgroundColor: '#F0F9FF',
              borderRadius: 20,
              paddingHorizontal: 12,
              paddingVertical: 6,
            }}>
              <Text style={{ color: '#0369A1', fontSize: 12, fontWeight: '500' }}>
                {petStats.totalSessions} sessions completed
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#1E293B', marginBottom: 16 }}>
            Your Stats
          </Text>
          <View style={{ flexDirection: 'row', marginBottom: 12 }}>
            <StatCard
              title="Current Streak"
              value={petStats.streak}
              subtitle="days in a row"
              color="#6366F1"
            />
            <StatCard
              title="Total Sessions"
              value={petStats.totalSessions}
              subtitle="meditations"
              color="#F59E0B"
            />
          </View>
          <View style={{ flexDirection: 'row' }}>
            <StatCard
              title="Total Time"
              value={petStats.totalMinutes}
              subtitle="minutes"
              color="#10B981"
            />
            <StatCard
              title="Pet Level"
              value={petStats.level}
              subtitle="growing strong"
              color="#EC4899"
            />
          </View>
        </View>

        {/* Calendar */}
        <View style={{ paddingHorizontal: 16 }}>
          <StreakCalendar />
        </View>

        {/* Achievements */}
        <View style={{ paddingHorizontal: 16, marginBottom: 32 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#1E293B', marginBottom: 16 }}>
            Achievements
          </Text>
          {mockAchievements.map((achievement) => (
            <AchievementBadge key={achievement.id} achievement={achievement} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}