import {Children, ReactElement, useEffect, useState} from "react";
import {useParams, useSearchParams} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import {api} from "@/api/requests.ts";
import {useAuthStore} from "@/stores/authStore.ts";
import {twMerge} from "tailwind-merge";
import {useToast} from "@/hooks/use-toast.ts";

type Char = {
    character: {
        id: string;
        name: {
            native: string;
            english: string;
        };
        image: string;
        rarity: number;
    };
    pinned: boolean;
    yikes: boolean;
};

export default function Gacha(): ReactElement {
    // Get the user from the params
    const {user} = useParams();

    const {toast} = useToast();
    const [searchParams] = useSearchParams();
    const {userInfo} = useAuthStore();

    const [chars, setChars] = useState<Char[]>([]);
    const [filters, setFilters] = useState({
        allChars: false
    });

    const userName = searchParams.get("user");

    const {data} = useQuery({
        queryKey: ["gacha", user],
        queryFn: async () => {
            const res = await api.get<{ chars: Char[] }>(`gacha/${user}`);

            if (!res || !res.chars) return [];

            return res.chars;
        },
        enabled: !!user
    });

    useEffect(() => {
        if (data) {
            //     Apply the filters
            setChars(data.filter((char) => {
                if (filters.allChars) {
                    return !char.yikes;
                }

                return true;
            }));
        }
    }, [data, filters]);

    async function pinChar(charId: string) {
        const res = await api.post(`gacha/char/${charId}/pin`).catch(() => {
            return;
        });

        if (res) {
            toast({
                title: "Personaje fijado",
                description: "El personaje ha sido fijado correctamente",
                variant: "default"
            });

            //     Modify the state to reflect the change
            setChars((chars) => {
                return chars.map((char) => {
                    if (char.character.id === charId) {
                        return {
                            ...char,
                            pinned: true
                        };
                    }

                    return char;
                });
            });
        } else {
            toast({
                title: "Error",
                description: "No se ha podido fijar el personaje",
                variant: "destructive"
            });
        }
    }

    async function unPinChar(charId: string) {
        const res = await api.post(`gacha/char/${charId}/unpin`).catch(() => {
            return;
        });

        if (res) {
            toast({
                title: "Personaje desfijado",
                description: "El personaje ha sido desfijado correctamente",
                variant: "default"
            });

            //     Modify the state to reflect the change
            setChars((chars) => {
                return chars.map((char) => {
                    if (char.character.id === charId) {
                        return {
                            ...char,
                            pinned: false
                        };
                    }

                    return char;
                });
            });
        } else {
            toast({
                title: "Error",
                description: "No se ha podido desfijar el personaje",
                variant: "destructive"
            });
        }
    }

    async function yikesChar(charId: string) {
        const res = await api.post(`gacha/char/${charId}/yikes`).catch(() => {
            return;
        });

        if (res) {
            toast({
                title: "Personaje yikes",
                description: "El personaje ha sido marcado como yikes correctamente",
                variant: "default"
            });

            //     Modify the state to reflect the change
            setChars((chars) => {
                return chars.map((char) => {
                    if (char.character.id === charId) {
                        return {
                            ...char,
                            yikes: true
                        };
                    }

                    return char;
                });
            });
        } else {
            toast({
                title: "Error",
                description: "No se ha podido marcar el personaje como yikes",
                variant: "destructive"
            });
        }
    }

    async function unYikesChar(charId: string) {
        const res = await api.post(`gacha/char/${charId}/unyikes`).catch(() => {
            return;
        });

        if (res) {
            toast({
                title: "Personaje no yikes",
                description: "El personaje ha sido desmarcado como yikes correctamente",
                variant: "default"
            });

            //     Modify the state to reflect the change
            setChars((chars) => {
                return chars.map((char) => {
                    if (char.character.id === charId) {
                        return {
                            ...char,
                            yikes: false
                        };
                    }

                    return char;
                });
            });
        } else {
            toast({
                title: "Error",
                description: "No se ha podido desmarcar el personaje como yikes",
                variant: "destructive"
            });
        }
    }

    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <h1 className="text-4xl font-bold">Personajes
                de{userName ? ` ${userName}` : `l usuario con id ${user}`}</h1>
            <div className="flex flex-row gap-2 items-center">
                {/*    Checkbox for yikes filter */}
                <input
                    type="checkbox"
                    checked={!filters.allChars}
                    onChange={(e) => {
                        setFilters({
                            ...filters,
                            allChars: !e.target.checked
                        });
                    }}
                />
                <label>Mostrar todos los personajes</label>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {Children.toArray(chars.map((char: Char) => (
                    <a
                        className={twMerge("flex flex-col items-center justify-between gap-2 border-4 rounded-md w-32 overflow-hidden group pb-2 shadow-accent shadow-md hover:rotate-6 transition-transform hover:animate-pulse", char.character.rarity === 5 ? "border-green-500" : "border-amber-400")}
                        rel="noreferrer"
                        href={`https://anilist.co/character/${char.character.id}`}
                        target="_blank"
                    >
                        <div className="flex flex-col gap-2 justify-center items-center">
                            <div
                                className={twMerge("flex w-32 h-48 overflow-hidden border-b-2 relative", char.character.rarity === 5 ? "border-green-500" : "border-amber-400")}>
                                <p className={twMerge("absolute top-2 left-2 bg-foreground text-white rounded-md p-1 font-bold", char.character.rarity === 5 ? "bg-green-500" : "bg-amber-400")}>
                                    {char.character.rarity === 5 ? "SR" : "R"}
                                </p>
                                <img src={char.character.image} alt={char.character.name.native}
                                    className="group-hover:scale-110 transition-transform w-32"/>
                            </div>
                            <div className="flex px-2">
                                <p className="text-center text-sm font-semibold">{char.character.name.native} ({char.character.name.english})</p>
                            </div>
                        </div>
                        {!!userInfo && userInfo.id === user && (
                            <div className="flex w-full justify-center gap-2 px-4">
                                <button
                                    className={twMerge("border-2 bg-foreground p-2 rounded-md  transition-colors", !char.pinned ? "border-red-500 hover:bg-red-500" : "border-green-500 hover:bg-green-500")}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();

                                        if (char.pinned) {
                                            unPinChar(char.character.id);
                                        } else {
                                            pinChar(char.character.id);
                                        }
                                    }}
                                >📍
                                </button>
                                <button
                                    className={twMerge("border-2 bg-foreground p-2 rounded-md  transition-colors", char.yikes ? "border-red-500 hover:bg-red-500" : "border-green-500 hover:bg-green-500")}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();

                                        if (char.yikes) {
                                            unYikesChar(char.character.id);
                                        } else {
                                            yikesChar(char.character.id);
                                        }
                                    }}
                                >
                                    {char.yikes ? "👎" : "👍"}
                                </button>
                            </div>
                        )}
                    </a>
                )))}
            </div>
        </div>
    );
}