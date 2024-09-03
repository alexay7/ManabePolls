import { OptionType, PollType } from "@/types/polls";
import { create } from "zustand";

type PollStore = {
    availablePolls: PollType[];
    setAvailablePolls: (polls: PollType[]) => void;

    addPoll: (poll: PollType) => void;

    selectedPoll: string;
    selectPoll: (id: string) => void;

    pollData: PollType | null;
    setPollData: (data: PollType) => void;
    
    getRandomizedOptions: (category: "anime" | "manga" | "novel" | "vn" | "live") => OptionType[];

    addOption: (category:"anime"|"manga"|"novel"|"vn"|"live", option: string) => void;
}

export const usePollStore = create<PollStore>((set,get) => ({
    availablePolls: [],
    setAvailablePolls: (polls: PollType[]) => set({ availablePolls: polls }),

    addPoll: (poll: PollType) => set((state) => ({
        availablePolls: [...state.availablePolls, poll],
        selectedPoll: poll._id,
        pollData: poll
    })),

    selectedPoll: "",
    selectPoll: (id: string) => set({ selectedPoll: id }),

    pollData: null,
    setPollData: (data: PollType) => set({ pollData: data }),

    getRandomizedOptions: (category) => {
        const { pollData } = get();
        if (!pollData) return [];

        return pollData[category].sort(() => Math.random() - 0.5);
    },

    addOption: (category, option) => {
        set((state) => {
            if (!state.pollData) return state;

            return {
                pollData: {
                    ...state.pollData,
                    [category]: [...state.pollData[category], option]
                }
            };});
    }
}));