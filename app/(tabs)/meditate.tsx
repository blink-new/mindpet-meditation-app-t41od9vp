import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface MeditationSession {
  id: string;
  title: string;
  instructor: string;
  duration: number;
  category: string;
  description: string;
  rating: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

const mockSessions: MeditationSession[] = [
  {
    id: '1',
    title: 'Morning Mindfulness',
    instructor: 'Sarah Chen',
    duration: 10,
    category: 'Mindfulness',
    description: 'Start your day with gentle awareness and intention setting.',
    rating: 4.8,
    difficulty: 'Beginner'
  },
  {
    id: '2',
    title: 'Deep Breathing',
    instructor: 'Marcus Johnson',
    duration: 5,
    category: 'Breathing',
    description: 'Learn the 4-7-8 breathing technique for instant calm.',
    rating: 4.9,
    difficulty: 'Beginner'
  },
  {
    id: '3',
    title: 'Body Scan Relaxation',
    instructor: 'Dr. Lisa Park',
    duration: 15,
    category: 'Body Scan',
    description: 'Progressive relaxation from head to toe.',
    rating: 4.7,
    difficulty: 'Intermediate'
  },
  {
    id: '4',
    title: 'Sleep Preparation',
    instructor: 'Michael Torres',
    duration: 20,
    category: 'Sleep',
    description: 'Wind down and prepare for restful sleep.',
    rating: 4.6,
    difficulty: 'Beginner'
  },
  {
    id: '5',
    title: 'Focus Enhancement',
    instructor: 'Dr. Amanda Lee',
    duration: 12,
    category: 'Focus',
    description: 'Sharpen your concentration and mental clarity.',
    rating: 4.8,
    difficulty: 'Intermediate'
  },
  {
    id: '6',
    title: 'Loving Kindness',
    instructor: 'Sarah Chen',
    duration: 18,
    category: 'Compassion',
    description: 'Cultivate love and compassion for yourself and others.',
    rating: 4.9,
    difficulty: 'Advanced'
  }
];

const categories = ['All', 'Breathing', 'Mindfulness', 'Body Scan', 'Sleep', 'Focus', 'Compassion'];

export default function MeditateScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSessions = mockSessions.filter(session => {
    const matchesCategory = selectedCategory === 'All' || session.category === selectedCategory;
    const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const CategoryChip = ({ category, isSelected, onPress }: {
    category: string;
    isSelected: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: isSelected ? '#6366F1' : '#FFFFFF',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        borderWidth: 1,
        borderColor: isSelected ? '#6366F1' : '#E5E7EB',
      }}
    >
      <Text style={{
        color: isSelected ? '#FFFFFF' : '#374151',
        fontWeight: '500',
        fontSize: 14,
      }}>
        {category}
      </Text>
    </TouchableOpacity>
  );

  const MeditationCard = ({ session }: { session: MeditationSession }) => (
    <TouchableOpacity
      onPress={() => router.push(`/session/${session.id}`)}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#1E293B', marginBottom: 4 }}>
            {session.title}
          </Text>
          <Text style={{ color: '#64748B', marginBottom: 2 }}>
            with {session.instructor}
          </Text>
          <Text style={{ color: '#64748B', fontSize: 12 }}>
            {session.difficulty} • {session.duration} min
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={{ color: '#64748B', fontSize: 12, marginLeft: 2 }}>
              {session.rating}
            </Text>
          </View>
          <View style={{
            backgroundColor: '#6366F1',
            borderRadius: 20,
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Ionicons name="play" size={16} color="white" />
          </View>
        </View>
      </View>
      <Text style={{ color: '#64748B', fontSize: 14, lineHeight: 20 }}>
        {session.description}
      </Text>
      <View style={{
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        alignSelf: 'flex-start',
        marginTop: 8,
      }}>
        <Text style={{ color: '#475569', fontSize: 12, fontWeight: '500' }}>
          {session.category}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* Header */}
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 }}>
          Meditation Library
        </Text>
        <Text style={{ color: '#64748B', marginBottom: 16 }}>
          Choose a session to help your pet grow stronger
        </Text>

        {/* Search Bar */}
        <View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          marginBottom: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 1,
        }}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Search meditations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              flex: 1,
              marginLeft: 12,
              fontSize: 16,
              color: '#1E293B',
            }}
          />
        </View>

        {/* Category Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16 }}
        >
          {categories.map((category) => (
            <CategoryChip
              key={category}
              category={category}
              isSelected={selectedCategory === category}
              onPress={() => setSelectedCategory(category)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Sessions List */}
      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
        {filteredSessions.length > 0 ? (
          filteredSessions.map((session) => (
            <MeditationCard key={session.id} session={session} />
          ))
        ) : (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Ionicons name="search" size={48} color="#9CA3AF" />
            <Text style={{ color: '#64748B', fontSize: 16, marginTop: 16 }}>
              No sessions found
            </Text>
            <Text style={{ color: '#9CA3AF', fontSize: 14, textAlign: 'center', marginTop: 4 }}>
              Try adjusting your search or category filter
            </Text>
          </View>
        )}
        
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}