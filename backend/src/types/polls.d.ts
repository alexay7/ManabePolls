import { Types } from "mongoose";

export type OptionType = {
    _id:Types.ObjectId,
    name: string;
    imageUrl: string;
    description: string;
    links: {
        name: string;
        url: string;
    }[];
    difficulty?:string;
    proposer:string;
};

export type PollWinnerVoters = {
    anime: {
        voters:string[],
        winner:Types.ObjectId
    }
    manga: {
        voters:string[],
        winner:Types.ObjectId
    }
    novel: {
        voters:string[],
        winner:Types.ObjectId
    }
    vn: {
        voters:string[],
        winner:Types.ObjectId
    }
    live: {
        voters:string[],
        winner:Types.ObjectId
    }
};

export type PollType = {
    _id:Types.ObjectId,
    month: string;
    year: string;
    anime: Option[];
    manga: Option[];
    novel: Option[];
    vn: Option[];
    live: Option[];
    active: boolean;
    ended: boolean;
    results: PollWinnerVoters
};