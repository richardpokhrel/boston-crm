import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,

      setUser: (user) => set({ user }),
      setAccessToken: (accessToken) => set({ accessToken }),

      login: (user, accessToken) => set({ user, accessToken }),

      logout: () => set({ user: null, accessToken: null }),

      updateUser: (updates) =>
        set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),

      // Role helpers
      isAdmin: () => useAuthStore.getState().user?.role === 'admin',
      isCounsellor: () => useAuthStore.getState().user?.role === 'counsellor',
      hasRole: (roles) => roles.includes(useAuthStore.getState().user?.role),
    }),
    {
      name: 'boston-crm-auth',
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
    }
  )
)
