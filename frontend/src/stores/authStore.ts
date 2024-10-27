import {create} from 'zustand';
import { persist } from 'zustand/middleware';
import { DiscordUserData } from '../types/discord';

type AuthStore = {
    accessToken: string | null;
    setAccessToken: (token: string|undefined) => void;

    tokenType: string | null;
    setTokenType: (token: string|undefined) => void;

    loading: boolean;
    setLoading: (loading: boolean) => void;

    userInfo: DiscordUserData & {admin:boolean} | null;
    setUserInfo: (data: (DiscordUserData & {admin:boolean})|null) => void;

    bearerToken: string | null;
    setBearerToken: (token: string) => void;

    logout: () => void;
};

export const useAuthStore = create(
    persist<AuthStore>((set) => ({
        accessToken: null,
        setAccessToken: (token: string|undefined) => set({ accessToken: token }),

        tokenType: null,
        setTokenType: (token: string|undefined) => set({ tokenType: token }),

        loading: false,
        setLoading: (loading: boolean) => set({ loading }),

        userInfo: null,
        setUserInfo: (data: (DiscordUserData & {admin:boolean})|null) => set({ userInfo: data }),

        bearerToken: null,
        setBearerToken: (token: string) => set({ bearerToken: token }),

        logout: () => {
            sessionStorage.removeItem("bearerToken");
            set({ accessToken: null, tokenType: null, userInfo: null });
            window.location.href = "/";
        }
    }
    ),{
        name: 'auth-storage',
        getStorage: () => localStorage
    }
    )
);