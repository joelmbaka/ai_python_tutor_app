import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CoinsState {
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
}

const initialState: CoinsState = {
  balance: 0,
  lifetimeEarned: 0,
  lifetimeSpent: 0,
};

const coinsSlice = createSlice({
  name: 'coins',
  initialState,
  reducers: {
    addCoins: (state, action: PayloadAction<number | undefined>) => {
      const raw = action.payload ?? 0;
      const amount = Math.max(0, Math.floor(raw));
      state.balance += amount;
      state.lifetimeEarned += amount;
    },
    spendCoins: (state, action: PayloadAction<number | undefined>) => {
      const raw = action.payload ?? 0;
      const amount = Math.max(0, Math.floor(raw));
      const toSpend = Math.min(amount, state.balance);
      state.balance -= toSpend;
      state.lifetimeSpent += toSpend;
    },
    resetCoins: () => ({ ...initialState }),
  },
});

export const { addCoins, spendCoins, resetCoins } = coinsSlice.actions;
export default coinsSlice.reducer;
