import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SettingsState {
  app: {
    language: 'en' | 'es' | 'fr' | 'de';
    autoSave: boolean;
    offlineMode: boolean;
    dataUsage: 'wifi-only' | 'always' | 'manual';
  };
  learning: {
    difficulty: 'adaptive' | 'easy' | 'medium' | 'hard';
    showHints: boolean;
    autoAdvance: boolean;
    practiceMode: boolean;
    skipAnimations: boolean;
  };
  accessibility: {
    fontSize: 'small' | 'medium' | 'large' | 'xlarge';
    highContrast: boolean;
    reduceMotion: boolean;
    screenReader: boolean;
    colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  };
  privacy: {
    analyticsEnabled: boolean;
    crashReporting: boolean;
    usageStatistics: boolean;
    personalizedContent: boolean;
  };
}

const initialState: SettingsState = {
  app: {
    language: 'en',
    autoSave: true,
    offlineMode: false,
    dataUsage: 'wifi-only',
  },
  learning: {
    difficulty: 'adaptive',
    showHints: true,
    autoAdvance: false,
    practiceMode: false,
    skipAnimations: false,
  },
  accessibility: {
    fontSize: 'medium',
    highContrast: false,
    reduceMotion: false,
    screenReader: false,
    colorBlindMode: 'none',
  },
  privacy: {
    analyticsEnabled: true,
    crashReporting: true,
    usageStatistics: true,
    personalizedContent: true,
  },
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateAppSettings: (state, action: PayloadAction<Partial<SettingsState['app']>>) => {
      state.app = { ...state.app, ...action.payload };
    },
    
    updateLearningSettings: (state, action: PayloadAction<Partial<SettingsState['learning']>>) => {
      state.learning = { ...state.learning, ...action.payload };
    },
    
    updateAccessibilitySettings: (state, action: PayloadAction<Partial<SettingsState['accessibility']>>) => {
      state.accessibility = { ...state.accessibility, ...action.payload };
    },
    
    updatePrivacySettings: (state, action: PayloadAction<Partial<SettingsState['privacy']>>) => {
      state.privacy = { ...state.privacy, ...action.payload };
    },
    
    resetSettings: (state) => {
      return initialState;
    },
    
    resetToDefaults: (state, action: PayloadAction<keyof SettingsState>) => {
      const section = action.payload;
      if (section === 'app') {
        state.app = initialState.app;
      } else if (section === 'learning') {
        state.learning = initialState.learning;
      } else if (section === 'accessibility') {
        state.accessibility = initialState.accessibility;
      } else if (section === 'privacy') {
        state.privacy = initialState.privacy;
      }
    },
  },
});

export const {
  updateAppSettings,
  updateLearningSettings,
  updateAccessibilitySettings,
  updatePrivacySettings,
  resetSettings,
  resetToDefaults,
} = settingsSlice.actions;

export default settingsSlice.reducer;
