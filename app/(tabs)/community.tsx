import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CommunityPost {
  id: string;
  user: {
    name: string;
    avatar: string;
    level: number;
  };
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  achievement?: {
    title: string;
    icon: string;
  };
}

interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  level: number;
  streak: number;
  totalMinutes: number;
  rank: number;
}

const mockPosts: CommunityPost[] = [
  {
    id: '1',
    user: { name: 'Alex Chen', avatar: '🧘‍♀️', level: 8 },
    content: 'Just completed my 30-day meditation streak! My pet is absolutely glowing with health. The consistency really makes a difference.',
    timestamp: '2 hours ago',
    likes: 24,
    comments: 8,
    achievement: { title: 'Month Master', icon: '🏆' }
  },
  {
    id: '2',
    user: { name: 'Maya Patel', avatar: '🌸', level: 5 },
    content: 'Had a tough day at work, but my 10-minute breathing session helped me reset. My pet seems happier too!',
    timestamp: '4 hours ago',
    likes: 12,
    comments: 3
  },
  {
    id: '3',
    user: { name: 'Jordan Kim', avatar: '🍃', level: 12 },
    content: 'Pro tip: Try the body scan meditation before bed. Game changer for sleep quality and your pet loves the peaceful energy.',
    timestamp: '1 day ago',
    likes: 45,
    comments: 15
  },
  {
    id: '4',
    user: { name: 'Sam Rodriguez', avatar: '⭐', level: 3 },
    content: 'New to meditation but loving the app! My pet started at level 1 and we\'re growing together. Community support is amazing!',
    timestamp: '2 days ago',
    likes: 18,
    comments: 6
  }
];

const mockLeaderboard: LeaderboardUser[] = [
  { id: '1', name: 'Jordan Kim', avatar: '🍃', level: 12, streak: 45, totalMinutes: 1250, rank: 1 },
  { id: '2', name: 'Alex Chen', avatar: '🧘‍♀️', level: 8, streak: 30, totalMinutes: 890, rank: 2 },
  { id: '3', name: 'Maya Patel', avatar: '🌸', level: 5, streak: 15, totalMinutes: 420, rank: 3 },
  { id: '4', name: 'Sam Rodriguez', avatar: '⭐', level: 3, streak: 7, totalMinutes: 180, rank: 4 },
  { id: '5', name: 'You', avatar: '😊', level: 1, streak: 0, totalMinutes: 0, rank: 5 }
];

export default function CommunityScreen() {
  const [activeTab, setActiveTab] = useState<'feed' | 'leaderboard'>('feed');

  const CommunityPost = ({ post }: { post: CommunityPost }) => (
    <View style={{
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    }}>
      {/* User Info */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <View style={{
          width: 40,
          height: 40,
          backgroundColor: '#F1F5F9',
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}>
          <Text style={{ fontSize: 20 }}>{post.user.avatar}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#1E293B' }}>
              {post.user.name}
            </Text>
            <View style={{
              backgroundColor: '#6366F1',
              borderRadius: 8,
              paddingHorizontal: 6,
              paddingVertical: 2,
              marginLeft: 8,
            }}>
              <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '600' }}>
                LV {post.user.level}
              </Text>
            </View>
          </View>
          <Text style={{ color: '#64748B', fontSize: 12 }}>{post.timestamp}</Text>
        </View>
        {post.achievement && (
          <View style={{
            backgroundColor: '#FEF3C7',
            borderRadius: 8,
            paddingHorizontal: 8,
            paddingVertical: 4,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <Text style={{ fontSize: 12 }}>{post.achievement.icon}</Text>
            <Text style={{ color: '#92400E', fontSize: 10, fontWeight: '600', marginLeft: 4 }}>
              {post.achievement.title}
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <Text style={{ color: '#374151', fontSize: 14, lineHeight: 20, marginBottom: 12 }}>
        {post.content}
      </Text>

      {/* Actions */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginRight: 20,
        }}>
          <Ionicons name="heart-outline" size={18} color="#64748B" />
          <Text style={{ color: '#64748B', fontSize: 12, marginLeft: 4 }}>
            {post.likes}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <Ionicons name="chatbubble-outline" size={18} color="#64748B" />
          <Text style={{ color: '#64748B', fontSize: 12, marginLeft: 4 }}>
            {post.comments}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const LeaderboardCard = ({ user }: { user: LeaderboardUser }) => (
    <View style={{
      backgroundColor: user.name === 'You' ? '#F0F9FF' : '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: user.name === 'You' ? 2 : 0,
      borderColor: user.name === 'You' ? '#0EA5E9' : 'transparent',
    }}>
      {/* Rank */}
      <View style={{
        width: 32,
        height: 32,
        backgroundColor: user.rank <= 3 ? '#F59E0B' : '#E5E7EB',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
      }}>
        <Text style={{
          color: user.rank <= 3 ? '#FFFFFF' : '#6B7280',
          fontSize: 14,
          fontWeight: 'bold',
        }}>
          {user.rank}
        </Text>
      </View>

      {/* Avatar */}
      <View style={{
        width: 40,
        height: 40,
        backgroundColor: '#F1F5F9',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
      }}>
        <Text style={{ fontSize: 20 }}>{user.avatar}</Text>
      </View>

      {/* User Info */}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: '#1E293B',
            marginRight: 8,
          }}>
            {user.name}
          </Text>
          <View style={{
            backgroundColor: '#6366F1',
            borderRadius: 6,
            paddingHorizontal: 4,
            paddingVertical: 2,
          }}>
            <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '600' }}>
              LV {user.level}
            </Text>
          </View>
        </View>
        <Text style={{ color: '#64748B', fontSize: 12 }}>
          {user.streak} day streak • {user.totalMinutes} min total
        </Text>
      </View>

      {/* Trophy for top 3 */}
      {user.rank <= 3 && (
        <Ionicons 
          name="trophy" 
          size={20} 
          color={user.rank === 1 ? '#F59E0B' : user.rank === 2 ? '#9CA3AF' : '#CD7C2F'} 
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* Header */}
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 }}>
          Community
        </Text>
        <Text style={{ color: '#64748B', marginBottom: 16 }}>
          Connect with fellow meditators and their pets
        </Text>

        {/* Tab Selector */}
        <View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          padding: 4,
          flexDirection: 'row',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 1,
        }}>
          <TouchableOpacity
            onPress={() => setActiveTab('feed')}
            style={{
              flex: 1,
              backgroundColor: activeTab === 'feed' ? '#6366F1' : 'transparent',
              borderRadius: 8,
              paddingVertical: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{
              color: activeTab === 'feed' ? '#FFFFFF' : '#64748B',
              fontWeight: '600',
            }}>
              Community Feed
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('leaderboard')}
            style={{
              flex: 1,
              backgroundColor: activeTab === 'leaderboard' ? '#6366F1' : 'transparent',
              borderRadius: 8,
              paddingVertical: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{
              color: activeTab === 'leaderboard' ? '#FFFFFF' : '#64748B',
              fontWeight: '600',
            }}>
              Leaderboard
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
        {activeTab === 'feed' ? (
          <>
            {mockPosts.map((post) => (
              <CommunityPost key={post.id} post={post} />
            ))}
          </>
        ) : (
          <>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#1E293B',
              marginBottom: 16,
              textAlign: 'center',
            }}>
              Weekly Meditation Leaders
            </Text>
            {mockLeaderboard.map((user) => (
              <LeaderboardCard key={user.id} user={user} />
            ))}
          </>
        )}
        
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={{
        position: 'absolute',
        bottom: 100,
        right: 20,
        width: 56,
        height: 56,
        backgroundColor: '#6366F1',
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }}>
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}