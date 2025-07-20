import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import DataService from '../../services/DataService';
import { audioService } from '../../services/AudioService';
import { notificationService } from '../../services/NotificationService';

interface MeditationSession {
  id: string;
  title: string;
  instructor: string;
  duration: number;
  category: string;
  description: string;
  rating: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  audioId?: string;
}

const mockSessions: { [key: string]: MeditationSession } = {
  '1': {
    id: '1',
    title: 'Morning Mindfulness',
    instructor: 'Sarah Chen',
    duration: 10,
    category: 'Mindfulness',
    description: 'Start your day with gentle awareness and intention setting.',
    rating: 4.8,
    difficulty: 'Beginner',
    audioId: 'breathing-basic'
  },
  '2': {
    id: '2',
    title: 'Deep Breathing',
    instructor: 'Marcus Johnson',
    duration: 5,
    category: 'Breathing',
    description: 'Learn the 4-7-8 breathing technique for instant calm.',
    rating: 4.9,
    difficulty: 'Beginner',
    audioId: 'breathing-basic'
  },
  '3': {
    id: '3',
    title: 'Body Scan Relaxation',
    instructor: 'Dr. Lisa Park',
    duration: 15,
    category: 'Body Scan',
    description: 'Progressive relaxation from head to toe.',
    rating: 4.7,
    difficulty: 'Intermediate',
    audioId: 'body-scan'
  },
  '4': {
    id: '4',
    title: 'Sleep Preparation',
    instructor: 'Michael Torres',
    duration: 20,
    category: 'Sleep',
    description: 'Wind down and prepare for restful sleep.',
    rating: 4.6,
    difficulty: 'Beginner',
    audioId: 'body-scan'
  },
  '5': {
    id: '5',
    title: 'Focus Enhancement',
    instructor: 'Dr. Amanda Lee',
    duration: 12,
    category: 'Focus',
    description: 'Sharpen your concentration and mental clarity.',
    rating: 4.8,
    difficulty: 'Intermediate',
    audioId: 'mindfulness-nature'
  },
  '6': {
    id: '6',
    title: 'Loving Kindness',
    instructor: 'Sarah Chen',
    duration: 18,
    category: 'Compassion',
    description: 'Cultivate love and compassion for yourself and others.',
    rating: 4.9,
    difficulty: 'Advanced',
    audioId: 'breathing-basic'
  }
};

export default function SessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [session, setSession] = useState<MeditationSession | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState('Breathe In');
  const [backgroundAmbient, setBackgroundAmbient] = useState<'rain' | 'forest' | 'ocean' | 'silence'>('silence');
  
  // Animations
  const breathingScale = new Animated.Value(1);
  const progressRotation = new Animated.Value(0);
  
  const dataService = DataService.getInstance();

  useEffect(() => {
    // Initialize services
    audioService.initialize();
    notificationService.initialize();
    
    if (id && mockSessions[id]) {
      const sessionData = mockSessions[id];
      setSession(sessionData);
      setTimeRemaining(sessionData.duration * 60); // Convert minutes to seconds
    }

    return () => {
      // Cleanup audio when leaving
      audioService.cleanup();
    };
  }, [id]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsPlaying(false);
            setIsCompleted(true);
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying, timeRemaining]);

  // Breathing animation effect
  useEffect(() => {
    if (session?.category === 'Breathing' && isPlaying) {
      const breathingCycle = () => {
        // 4 seconds in, 4 seconds hold, 4 seconds out
        const cycle = Math.floor((Date.now() / 1000) % 12);
        
        if (cycle < 4) {
          setBreathingPhase('Breathe In');
          Animated.timing(breathingScale, {
            toValue: 1.3,
            duration: 4000,
            useNativeDriver: true,
          }).start();
        } else if (cycle < 8) {
          setBreathingPhase('Hold');
        } else {
          setBreathingPhase('Breathe Out');
          Animated.timing(breathingScale, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }).start();
        }
      };

      const breathingInterval = setInterval(breathingCycle, 1000);
      breathingCycle(); // Start immediately

      return () => clearInterval(breathingInterval);
    }
  }, [session?.category, isPlaying]);

  // Progress animation
  useEffect(() => {
    if (session) {
      const progress = getProgressPercentage();
      Animated.timing(progressRotation, {
        toValue: progress,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [timeRemaining, session]);

  const handleSessionComplete = async () => {
    if (!session) return;
    
    try {
      // Stop audio
      await audioService.stopAudio();
      await audioService.stopBackgroundAudio();
      
      // Haptic feedback (mock)
      console.log('Success haptic feedback');
      
      // Complete session in data service
      await dataService.completeMeditationSession(session.duration);
      
      // Send completion notification
      await notificationService.scheduleSessionCompleteNotification(
        session.title, 
        session.duration * 10
      );
      
      Alert.alert(
        'Session Complete! 🎉',
        `Great job! Your pet gained energy and XP from your ${session.duration}-minute meditation.`,
        [
          {
            text: 'View Pet',
            onPress: () => router.replace('/(tabs)/')
          },
          {
            text: 'Another Session',
            onPress: () => router.replace('/(tabs)/meditate')
          }
        ]
      );
    } catch (error) {
      console.error('Error completing session:', error);
      Alert.alert('Session Complete!', 'Great job on completing your meditation!');
    }
  };

  const togglePlayPause = async () => {
    try {
      if (!hasStarted) {
        setHasStarted(true);
        
        // Start audio if available
        if (session?.audioId) {
          await audioService.playMeditationAudio(session.audioId);
        }
        
        // Start background ambient if selected
        if (backgroundAmbient !== 'silence') {
          await audioService.playBackgroundAmbient(backgroundAmbient);
        }
      }
      
      if (isPlaying) {
        await audioService.pauseAudio();
      } else {
        await audioService.resumeAudio();
      }
      
      setIsPlaying(!isPlaying);
      console.log('Impact haptic feedback');
    } catch (error) {
      console.error('Error toggling audio:', error);
      setIsPlaying(!isPlaying);
    }
  };

  const handleStop = async () => {
    Alert.alert(
      'End Session?',
      'Are you sure you want to end this meditation session?',
      [
        { text: 'Continue', style: 'cancel' },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: async () => {
            await audioService.cleanup();
            router.back();
          }
        }
      ]
    );
  };

  const toggleBackgroundAmbient = async () => {
    const ambients: Array<'silence' | 'rain' | 'forest' | 'ocean'> = ['silence', 'rain', 'forest', 'ocean'];
    const currentIndex = ambients.indexOf(backgroundAmbient);
    const nextAmbient = ambients[(currentIndex + 1) % ambients.length];
    
    setBackgroundAmbient(nextAmbient);
    await audioService.playBackgroundAmbient(nextAmbient);
    console.log('Light haptic feedback');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!session) return 0;
    const totalSeconds = session.duration * 60;
    return ((totalSeconds - timeRemaining) / totalSeconds) * 100;
  };

  const getAmbientIcon = () => {
    switch (backgroundAmbient) {
      case 'rain': return 'rainy';
      case 'forest': return 'leaf';
      case 'ocean': return 'water';
      default: return 'volume-mute';
    }
  };

  if (!session) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, color: '#64748B' }}>Session not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 16, backgroundColor: '#6366F1', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '500' }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (isCompleted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Animated.View style={{
            width: 120,
            height: 120,
            backgroundColor: '#10B981',
            borderRadius: 60,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
            transform: [{ scale: breathingScale }],
          }}>
            <Ionicons name="checkmark" size={60} color="white" />
          </Animated.View>
          
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1E293B', textAlign: 'center', marginBottom: 8 }}>
            Well Done!
          </Text>
          
          <Text style={{ fontSize: 18, color: '#64748B', textAlign: 'center', marginBottom: 32 }}>
            You completed "{session.title}"
          </Text>
          
          <View style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: 24,
            width: '100%',
            marginBottom: 32,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#1E293B', textAlign: 'center', marginBottom: 16 }}>
              Session Summary
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ color: '#64748B' }}>Duration</Text>
              <Text style={{ fontWeight: '600', color: '#1E293B' }}>{session.duration} minutes</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ color: '#64748B' }}>Category</Text>
              <Text style={{ fontWeight: '600', color: '#1E293B' }}>{session.category}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#64748B' }}>XP Gained</Text>
              <Text style={{ fontWeight: '600', color: '#6366F1' }}>+{session.duration * 10}</Text>
            </View>
          </View>
          
          <View style={{ flexDirection: 'row', width: '100%' }}>
            <TouchableOpacity
              onPress={() => router.replace('/(tabs)/meditate')}
              style={{
                flex: 1,
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: 'center',
                marginRight: 8,
                borderWidth: 1,
                borderColor: '#E5E7EB',
              }}
            >
              <Text style={{ color: '#374151', fontWeight: '500' }}>More Sessions</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => router.replace('/(tabs)/')}
              style={{
                flex: 1,
                backgroundColor: '#6366F1',
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: 'center',
                marginLeft: 8,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '500' }}>Check Pet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1E293B' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>
        
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
            {session.title}
          </Text>
          <Text style={{ color: '#94A3B8', fontSize: 12 }}>
            with {session.instructor}
          </Text>
        </View>
        
        <TouchableOpacity
          onPress={toggleBackgroundAmbient}
          style={{
            width: 40,
            height: 40,
            backgroundColor: backgroundAmbient !== 'silence' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.1)',
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={getAmbientIcon()} size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        {/* Progress Circle */}
        <View style={{ alignItems: 'center', marginBottom: 48 }}>
          <Animated.View style={{
            width: 240,
            height: 240,
            borderRadius: 120,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
            position: 'relative',
            transform: session?.category === 'Breathing' && isPlaying ? [{ scale: breathingScale }] : [],
          }}>
            {/* Progress indicator */}
            <View style={{
              position: 'absolute',
              width: 240,
              height: 240,
              borderRadius: 120,
              borderWidth: 4,
              borderColor: 'rgba(255, 255, 255, 0.2)',
            }} />
            <Animated.View style={{
              position: 'absolute',
              width: 240,
              height: 240,
              borderRadius: 120,
              borderWidth: 4,
              borderColor: '#6366F1',
              borderTopColor: 'transparent',
              borderRightColor: 'transparent',
              transform: [{
                rotate: progressRotation.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0deg', '360deg'],
                })
              }],
            }} />
            
            {/* Time Display */}
            <Text style={{ color: '#FFFFFF', fontSize: 48, fontWeight: 'bold', marginBottom: 8 }}>
              {formatTime(timeRemaining)}
            </Text>
            <Text style={{ color: '#94A3B8', fontSize: 16 }}>
              {session.duration} min session
            </Text>
          </Animated.View>
        </View>

        {/* Breathing Guide */}
        {session.category === 'Breathing' && isPlaying && (
          <View style={{ alignItems: 'center', marginBottom: 48 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: '600', marginBottom: 8 }}>
              {breathingPhase}
            </Text>
            <Text style={{ color: '#94A3B8', fontSize: 16 }}>
              Follow the rhythm
            </Text>
          </View>
        )}

        {/* Instructions */}
        {!hasStarted && (
          <View style={{ alignItems: 'center', marginBottom: 48 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '600', marginBottom: 8, textAlign: 'center' }}>
              Ready to begin?
            </Text>
            <Text style={{ color: '#94A3B8', fontSize: 14, textAlign: 'center', lineHeight: 20 }}>
              {session.description}
            </Text>
          </View>
        )}

        {/* Controls */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <TouchableOpacity
            onPress={togglePlayPause}
            style={{
              width: 80,
              height: 80,
              backgroundColor: '#6366F1',
              borderRadius: 40,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#6366F1',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Ionicons 
              name={isPlaying ? "pause" : "play"} 
              size={32} 
              color="white" 
              style={{ marginLeft: isPlaying ? 0 : 4 }}
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleStop}
            style={{
              width: 60,
              height: 60,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 30,
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 20,
            }}
          >
            <Ionicons name="stop" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Session Info */}
        <View style={{ position: 'absolute', bottom: 40, left: 24, right: 24 }}>
          <View style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 12,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <View>
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '500' }}>
                {session.category}
              </Text>
              <Text style={{ color: '#94A3B8', fontSize: 12 }}>
                {session.difficulty} Level • {backgroundAmbient !== 'silence' ? backgroundAmbient : 'Silent'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={{ color: '#94A3B8', fontSize: 12, marginLeft: 4 }}>
                {session.rating}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}