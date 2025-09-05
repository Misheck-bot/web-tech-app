import { create } from 'zustand';

type AuthState = {
  token: string | null;
  displayName: string | null;
  setAuth: (token: string, displayName: string) => void;
  clear: () => void;
};

export const useAuth = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  displayName: localStorage.getItem('displayName'),
  setAuth: (token, displayName) => {
    localStorage.setItem('token', token);
    localStorage.setItem('displayName', displayName);
    set({ token, displayName });
  },
  clear: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('displayName');
    set({ token: null, displayName: null });
  }
}));


