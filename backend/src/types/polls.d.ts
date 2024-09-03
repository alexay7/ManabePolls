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
};