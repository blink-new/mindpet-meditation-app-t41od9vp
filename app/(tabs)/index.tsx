import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import DataService, { PetStats } from '../../services/DataService';
import { notificationService } from '../../services/NotificationService';

export default function HomeScreen() {
  const [petStats, setPetStats] = useState<PetStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  // Animations
  const petBounce = new Animated.Value(1);
  const statsBounce = new Animated.Value(1);
  
  const dataService = DataService.getInstance();

  useEffect(() => {
    loadPetStats();
    initializeNotifications();
    
    // Pet bounce animation
    const bounceAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(petBounce, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(petBounce, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    bounceAnimation.start();

    return () => bounceAnimation.stop();
  }, []);

  const initializeNotifications = async () => {
    const enabled = await notificationService.initialize();
    setNotificationsEnabled(enabled);
    
    if (enabled) {
      // Schedule daily meditation reminder
      await notificationService.scheduleDailyMeditationReminder(9, 0);
      
      // Schedule pet care reminder in 2 hours
      await notificationService.schedulePetCareReminder(120);
    }
  };

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

  const handleFeedPet = async () => {
    try {
      console.log('Medium haptic feedback');
      
      // Animate stats
      Animated.sequence([
        Animated.timing(statsBounce, {
          toValue: 1.1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(statsBounce, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
      
      const updatedStats = await dataService.feedPet();
      setPetStats(updatedStats);
      
      // Schedule next reminder
      await notificationService.schedulePetCareReminder(120);
      
      Alert.alert('Yum! 🍎', 'Your pet enjoyed the healthy snack and feels much better!');
    } catch (error) {
      console.log('Warning haptic feedback');
      Alert.alert('Not Hungry', error.message);
    }
  };

  const handlePlayWithPet = async () => {
    try {
      console.log('Medium haptic feedback');
      
      // Animate pet
      Animated.sequence([
        Animated.timing(petBounce, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(petBounce, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      
      const updatedStats = await dataService.playWithPet();
      setPetStats(updatedStats);
      
      Alert.alert('Fun Time! 🎾', 'Your pet had a great time playing and is much happier!');
    } catch (error) {
      console.log('Warning haptic feedback');
      Alert.alert('Too Tired', error.message);
    }
  };

  const handleQuickMeditation = () => {
    router.push('/session/2'); // 5-minute breathing session
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning!';
    if (hour < 17) return 'Good afternoon!';
    return 'Good evening!';
  };

  const getPetStatusMessage = (stats: PetStats) => {
    if (stats.mood === 'happy') return 'Your pet is thriving!';
    if (stats.mood === 'neutral') return 'Your pet is doing okay.';
    if (stats.mood === 'sad') return 'Your pet needs some attention.';
    return 'Your pet really needs meditation!';
  };

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'happy': return '😊';
      case 'neutral': return '😐';
      case 'sad': return '😢';
      case 'sick': return '🤒';
      default: return '😐';
    }
  };

  const StatBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <View style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ fontSize: 14, color: '#64748B' }}>{label}</Text>
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#1E293B' }}>{value}%</Text>
      </View>
      <View style={{ width: '100%', height: 8, backgroundColor: '#E2E8F0', borderRadius: 4 }}>
        <View 
          style={{ 
            width: `${value}%`, 
            height: 8, 
            backgroundColor: color, 
            borderRadius: 4 
          }} 
        />
      </View>
    </View>
  );

  const ActionButton = ({ icon, label, onPress, color }: { 
    icon: string; 
    label: string; 
    onPress: () => void; 
    color: string; 
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        width: 70,
      }}
    >
      <View style={{
        width: 40,
        height: 40,
        backgroundColor: color + '20',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
      }}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={{ fontSize: 12, fontWeight: '500', color: '#374151' }}>{label}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, color: '#64748B' }}>Loading your pet...</Text>
      </SafeAreaView>
    );
  }

  if (!petStats) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, color: '#64748B' }}>Error loading pet data</Text>
        <TouchableOpacity
          onPress={loadPetStats}
          style={{ marginTop: 16, backgroundColor: '#6366F1', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '500' }}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <ScrollView style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
          <View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1E293B' }}>{getGreeting()}</Text>
            <Text style={{ color: '#64748B' }}>{getPetStatusMessage(petStats)}</Text>
          </View>
          <TouchableOpacity 
            onPress={async () => {
              console.log('Light haptic feedback');
              Alert.alert(
                'Notifications',
                notificationsEnabled 
                  ? 'Notifications are enabled! You\'ll get reminders to care for your pet.' 
                  : 'Enable notifications to get meditation reminders and pet care alerts.',
                notificationsEnabled 
                  ? [{ text: 'OK' }]
                  : [
                      { text: 'Later', style: 'cancel' },
                      { 
                        text: 'Enable', 
                        onPress: async () => {
                          const enabled = await notificationService.initialize();
                          setNotificationsEnabled(enabled);
                        }
                      }
                    ]
              );
            }}
            style={{
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
            }}
          >
            <Ionicons 
              name={notificationsEnabled ? "notifications" : "notifications-outline"} 
              size={20} 
              color={notificationsEnabled ? "#10B981" : "#6366F1"} 
            />
          </TouchableOpacity>
        </View>

        {/* Pet Avatar */}
        <View style={{ alignItems: 'center', paddingVertical: 24 }}>
          <Animated.View style={{
            width: 120,
            height: 120,
            backgroundColor: '#6366F1',
            borderRadius: 60,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            transform: [{ scale: petBounce }],
          }}>
            <Text style={{ fontSize: 48 }}>{getMoodEmoji(petStats.mood)}</Text>
          </Animated.View>
          <Text style={{ fontSize: 20, fontWeight: '600', color: '#1E293B', marginBottom: 4 }}>Zen</Text>
          <Text style={{ color: '#64748B' }}>Level {petStats.level} • Mindful Companion</Text>
          
          {/* XP Progress */}
          <View style={{ width: 192, marginTop: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontSize: 12, color: '#64748B' }}>XP</Text>
              <Text style={{ fontSize: 12, color: '#64748B' }}>
                {petStats.xp}/{petStats.level * 100}
              </Text>
            </View>
            <View style={{ width: '100%', backgroundColor: '#E2E8F0', borderRadius: 4, height: 8 }}>
              <View 
                style={{ 
                  backgroundColor: '#6366F1', 
                  height: 8, 
                  borderRadius: 4,
                  width: `${(petStats.xp / (petStats.level * 100)) * 100}%`
                }}
              />
            </View>
          </View>
        </View>

        {/* Pet Stats */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#1E293B', marginBottom: 16 }}>Pet Status</Text>
          <Animated.View style={{ transform: [{ scale: statsBounce }] }}>
            <StatBar label="Health" value={petStats.health} color="#10B981" />
            <StatBar label="Happiness" value={petStats.happiness} color="#F59E0B" />
            <StatBar label="Energy" value={petStats.energy} color="#6366F1" />
          </Animated.View>
        </View>

        {/* Quick Actions */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#1E293B', marginBottom: 16 }}>Quick Actions</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <ActionButton
              icon="restaurant"
              label="Feed"
              onPress={handleFeedPet}
              color="#10B981"
            />
            <ActionButton
              icon="game-controller"
              label="Play"
              onPress={handlePlayWithPet}
              color="#F59E0B"
            />
            <ActionButton
              icon="bed"
              label="Rest"
              onPress={() => Alert.alert('Rest', 'Your pet is resting peacefully...')}
              color="#6366F1"
            />
            <ActionButton
              icon="heart"
              label="Care"
              onPress={() => Alert.alert('Care', 'You show your pet some love!')}
              color="#EC4899"
            />
          </View>
        </View>

        {/* Progress Overview */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#1E293B', marginBottom: 16 }}>Today's Progress</Text>
          <View style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 1,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ color: '#64748B' }}>Meditation Streak</Text>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#6366F1' }}>{petStats.streak} days</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ color: '#64748B' }}>Total Sessions</Text>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#F59E0B' }}>{petStats.totalSessions}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: '#64748B' }}>Total Minutes</Text>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#10B981' }}>{petStats.totalMinutes} min</Text>
            </View>
          </View>
        </View>

        {/* Quick Start Meditation */}
        <View style={{ paddingHorizontal: 16, marginBottom: 32 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#1E293B', marginBottom: 16 }}>Quick Start</Text>
          <TouchableOpacity 
            onPress={handleQuickMeditation}
            style={{
              backgroundColor: '#6366F1',
              borderRadius: 16,
              padding: 24,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 18, marginBottom: 4 }}>
                  5-Minute Breathing
                </Text>
                <Text style={{ color: '#C7D2FE' }}>
                  Perfect for a quick energy boost
                </Text>
              </View>
              <View style={{
                width: 48,
                height: 48,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 24,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Ionicons name="play" size={24} color="white" />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}