export type OptionType = {
    _id:string;
    name: string;
    imageUrl: string;
    description: string;
    links: Array<{
        name: string;
        url: string;
    }>;
    difficulty:string;
    proposer:string;
}

export type Categories = "anime"|"manga"|"novel"|"vn"|"live";

export type PollType = {
    _id: string;
    month: string;
    year:string;
    anime: OptionType[];
    manga: OptionType[];
    novel: OptionType[];
    vn: OptionType[];
    live: OptionType[];
    active:boolean;
    results: Record<Categories,{voters:string[],winner:string}>
}