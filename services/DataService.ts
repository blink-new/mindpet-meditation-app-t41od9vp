import AsyncStorage from '@react-native-async-storage/async-storage';
import blink from './BlinkClient';

export interface PetStats {
  health: number;
  happiness: number;
  energy: number;
  level: number;
  xp: number;
  streak: number;
  totalSessions: number;
  totalMinutes: number;
  lastFed: string;
  lastPlayed: string;
  mood: 'happy' | 'neutral' | 'sad' | 'sick';
}

export interface MeditationSession {
  id: string;
  title: string;
  instructor: string;
  duration: number;
  category: string;
  description: string;
  completedAt?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress: number;
  target: number;
}

class DataService {
  private static instance: DataService;
  
  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  // Pet Stats Management
  async getPetStats(): Promise<PetStats> {
    try {
      const stats = await AsyncStorage.getItem('petStats');
      if (stats) {
        const parsedStats = JSON.parse(stats);
        // Apply time-based decay
        return this.applyTimeDecay(parsedStats);
      }
      
      // Default stats for new users
      const defaultStats: PetStats = {
        health: 80,
        happiness: 70,
        energy: 60,
        level: 1,
        xp: 0,
        streak: 0,
        totalSessions: 0,
        totalMinutes: 0,
        lastFed: new Date().toISOString(),
        lastPlayed: new Date().toISOString(),
        mood: 'neutral'
      };
      
      await this.savePetStats(defaultStats);
      return defaultStats;
    } catch (error) {
      console.error('Error getting pet stats:', error);
      throw error;
    }
  }

  async savePetStats(stats: PetStats): Promise<void> {
    try {
      await AsyncStorage.setItem('petStats', JSON.stringify(stats));
    } catch (error) {
      console.error('Error saving pet stats:', error);
      throw error;
    }
  }

  private applyTimeDecay(stats: PetStats): PetStats {
    const now = new Date();
    const lastUpdate = new Date(stats.lastFed || now);
    const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

    // Apply decay based on hours since last interaction
    const decayRate = Math.min(hoursSinceUpdate * 2, 30); // Max 30 points decay
    
    const updatedStats = {
      ...stats,
      health: Math.max(0, stats.health - decayRate),
      happiness: Math.max(0, stats.happiness - decayRate * 0.8),
      energy: Math.max(0, stats.energy - decayRate * 0.6),
      mood: this.calculateMood(stats.health - decayRate, stats.happiness - decayRate)
    };

    return updatedStats;
  }

  private calculateMood(health: number, happiness: number): PetStats['mood'] {
    const average = (health + happiness) / 2;
    
    if (average >= 80) return 'happy';
    if (average >= 50) return 'neutral';
    if (average >= 20) return 'sad';
    return 'sick';
  }

  // Pet Actions
  async feedPet(): Promise<PetStats> {
    const stats = await this.getPetStats();
    const now = new Date();
    const lastFed = new Date(stats.lastFed);
    const hoursSinceFed = (now.getTime() - lastFed.getTime()) / (1000 * 60 * 60);

    if (hoursSinceFed < 2) {
      throw new Error('Your pet is not hungry yet! Try again in a few hours.');
    }

    const updatedStats: PetStats = {
      ...stats,
      health: Math.min(100, stats.health + 15),
      happiness: Math.min(100, stats.happiness + 10),
      lastFed: now.toISOString(),
      mood: this.calculateMood(
        Math.min(100, stats.health + 15),
        Math.min(100, stats.happiness + 10)
      )
    };

    await this.savePetStats(updatedStats);
    return updatedStats;
  }

  async playWithPet(): Promise<PetStats> {
    const stats = await this.getPetStats();
    const now = new Date();
    const lastPlayed = new Date(stats.lastPlayed);
    const hoursSincePlayed = (now.getTime() - lastPlayed.getTime()) / (1000 * 60 * 60);

    if (hoursSincePlayed < 1) {
      throw new Error('Your pet is tired! Let them rest for a bit.');
    }

    const updatedStats: PetStats = {
      ...stats,
      happiness: Math.min(100, stats.happiness + 20),
      energy: Math.max(0, stats.energy - 10),
      lastPlayed: now.toISOString(),
      mood: this.calculateMood(
        stats.health,
        Math.min(100, stats.happiness + 20)
      )
    };

    await this.savePetStats(updatedStats);
    return updatedStats;
  }

  // Meditation Progress
  async completeMeditationSession(duration: number): Promise<PetStats> {
    const stats = await this.getPetStats();
    const now = new Date();

    // Calculate gains based on duration
    const xpGained = duration * 10;
    const healthGain = Math.min(25, duration * 2);
    const happinessGain = Math.min(20, duration * 1.5);
    const energyGain = Math.min(15, duration);

    // Update streak
    const today = now.toDateString();
    const lastSessionDate = await AsyncStorage.getItem('lastSessionDate');
    let newStreak = stats.streak;

    if (lastSessionDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastSessionDate === yesterday.toDateString()) {
        newStreak += 1;
      } else if (lastSessionDate !== today) {
        newStreak = 1;
      }
      
      await AsyncStorage.setItem('lastSessionDate', today);
    }

    // Calculate new level
    let newLevel = stats.level;
    let newXp = stats.xp + xpGained;
    const xpNeeded = newLevel * 100;
    
    if (newXp >= xpNeeded) {
      newLevel += 1;
      newXp = newXp - xpNeeded;
    }

    const updatedStats: PetStats = {
      ...stats,
      health: Math.min(100, stats.health + healthGain),
      happiness: Math.min(100, stats.happiness + happinessGain),
      energy: Math.min(100, stats.energy + energyGain),
      level: newLevel,
      xp: newXp,
      streak: newStreak,
      totalSessions: stats.totalSessions + 1,
      totalMinutes: stats.totalMinutes + duration,
      mood: this.calculateMood(
        Math.min(100, stats.health + healthGain),
        Math.min(100, stats.happiness + happinessGain)
      )
    };

    await this.savePetStats(updatedStats);
    
    // Check for achievements
    await this.checkAchievements(updatedStats);
    
    return updatedStats;
  }

  // Achievements
  async getAchievements(): Promise<Achievement[]> {
    try {
      const achievements = await AsyncStorage.getItem('achievements');
      if (achievements) {
        return JSON.parse(achievements);
      }
      
      const defaultAchievements: Achievement[] = [
        {
          id: 'first_session',
          title: 'First Steps',
          description: 'Complete your first meditation session',
          icon: 'star',
          progress: 0,
          target: 1
        },
        {
          id: 'week_streak',
          title: 'Week Warrior',
          description: 'Maintain a 7-day meditation streak',
          icon: 'flame',
          progress: 0,
          target: 7
        },
        {
          id: 'hundred_minutes',
          title: 'Century Club',
          description: 'Meditate for 100 total minutes',
          icon: 'time',
          progress: 0,
          target: 100
        },
        {
          id: 'level_five',
          title: 'Rising Master',
          description: 'Reach level 5 with your pet',
          icon: 'trophy',
          progress: 0,
          target: 5
        }
      ];
      
      await AsyncStorage.setItem('achievements', JSON.stringify(defaultAchievements));
      return defaultAchievements;
    } catch (error) {
      console.error('Error getting achievements:', error);
      return [];
    }
  }

  private async checkAchievements(stats: PetStats): Promise<void> {
    try {
      const achievements = await this.getAchievements();
      let updated = false;

      achievements.forEach(achievement => {
        if (achievement.unlockedAt) return; // Already unlocked

        switch (achievement.id) {
          case 'first_session':
            achievement.progress = stats.totalSessions;
            break;
          case 'week_streak':
            achievement.progress = stats.streak;
            break;
          case 'hundred_minutes':
            achievement.progress = stats.totalMinutes;
            break;
          case 'level_five':
            achievement.progress = stats.level;
            break;
        }

        if (achievement.progress >= achievement.target && !achievement.unlockedAt) {
          achievement.unlockedAt = new Date().toISOString();
          updated = true;
        }
      });

      if (updated) {
        await AsyncStorage.setItem('achievements', JSON.stringify(achievements));
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  }

  // Session History
  async getSessionHistory(): Promise<MeditationSession[]> {
    try {
      const history = await AsyncStorage.getItem('sessionHistory');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error getting session history:', error);
      return [];
    }
  }

  async addSessionToHistory(session: MeditationSession): Promise<void> {
    try {
      const history = await this.getSessionHistory();
      const sessionWithDate = {
        ...session,
        completedAt: new Date().toISOString()
      };
      
      history.unshift(sessionWithDate);
      
      // Keep only last 50 sessions
      const trimmedHistory = history.slice(0, 50);
      
      await AsyncStorage.setItem('sessionHistory', JSON.stringify(trimmedHistory));
    } catch (error) {
      console.error('Error adding session to history:', error);
    }
  }
}

export default DataService;