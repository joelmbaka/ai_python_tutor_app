import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserState {
  isOnboarded: boolean;
  profile: {
    name: string;
    age: number;
    experience: 'beginner' | 'some' | 'advanced';
    interests: string[];
    preferredStyle: 'visual' | 'text' | 'mixed';
  } | null;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    notifications: boolean;
    soundEffects: boolean;
    codeStyle: 'colorful' | 'minimal' | 'classic';
  };
}

const initialState: UserState = {
  isOnboarded: false,
  profile: null,
  preferences: {
    theme: 'auto',
    notifications: true,
    soundEffects: true,
    codeStyle: 'colorful',
  },
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    completeOnboarding: (state, action: PayloadAction<UserState['profile']>) => {
      state.isOnboarded = true;
      state.profile = action.payload;
    },
    updateProfile: (state, action: PayloadAction<Partial<UserState['profile']>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    updatePreferences: (state, action: PayloadAction<Partial<UserState['preferences']>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    resetUser: (state) => {
      return initialState;
    },
  },
});

export const { completeOnboarding, updateProfile, updatePreferences, resetUser } = userSlice.actions;
export default userSlice.reducer;
