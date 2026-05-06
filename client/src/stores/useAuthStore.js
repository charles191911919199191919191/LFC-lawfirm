import { create } from 'zustand';

const initialUser = localStorage.getItem('lawfirm_user');

export const useAuthStore = create((set) => ({
  user: initialUser ? JSON.parse(initialUser) : null,
  token: localStorage.getItem('lawfirm_token') || null,
  setAuth: (user, token) => {
    localStorage.setItem('lawfirm_user', JSON.stringify(user));
    localStorage.setItem('lawfirm_token', token);
    set({ user, token });
  },
  clearAuth: () => {
    localStorage.removeItem('lawfirm_user');
    localStorage.removeItem('lawfirm_token');
    set({ user: null, token: null });
  }
}));
