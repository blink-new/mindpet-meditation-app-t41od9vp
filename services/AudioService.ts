// Simple audio service placeholder
// In a real app, you would install expo-av

export interface MeditationAudio {
  id: string;
  name: string;
  duration: number;
  category: string;
  audioUrl: string;
  description: string;
}

class AudioService {
  private isPlaying = false;

  // Sample meditation audio tracks
  private audioTracks: MeditationAudio[] = [
    {
      id: 'breathing-basic',
      name: 'Basic Breathing',
      duration: 300, // 5 minutes
      category: 'Breathing',
      audioUrl: 'https://example.com/audio.mp3',
      description: 'Simple breathing meditation with gentle guidance'
    },
    {
      id: 'body-scan',
      name: 'Body Scan Relaxation',
      duration: 600, // 10 minutes
      category: 'Body Scan',
      audioUrl: 'https://example.com/audio.mp3',
      description: 'Progressive body relaxation technique'
    },
    {
      id: 'mindfulness-nature',
      name: 'Mindful Nature',
      duration: 900, // 15 minutes
      category: 'Mindfulness',
      audioUrl: 'https://example.com/audio.mp3',
      description: 'Connect with nature through mindful awareness'
    }
  ];

  async initialize() {
    console.log('Audio service initialized (mock)');
  }

  async playMeditationAudio(audioId: string) {
    const track = this.audioTracks.find(t => t.id === audioId);
    if (track) {
      console.log(`Playing meditation audio: ${track.name}`);
      this.isPlaying = true;
    }
  }

  async playBackgroundAmbient(type: 'rain' | 'forest' | 'ocean' | 'silence' = 'silence') {
    console.log(`Playing background ambient: ${type}`);
  }

  async pauseAudio() {
    console.log('Audio paused');
    this.isPlaying = false;
  }

  async resumeAudio() {
    console.log('Audio resumed');
    this.isPlaying = true;
  }

  async stopAudio() {
    console.log('Audio stopped');
    this.isPlaying = false;
  }

  async stopBackgroundAudio() {
    console.log('Background audio stopped');
  }

  async setVolume(volume: number) {
    console.log(`Volume set to: ${volume}`);
  }

  getIsPlaying() {
    return this.isPlaying;
  }

  getMeditationTracks() {
    return this.audioTracks;
  }

  async cleanup() {
    await this.stopAudio();
    await this.stopBackgroundAudio();
  }
}

export const audioService = new AudioService();