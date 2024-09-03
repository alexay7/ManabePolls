import React, { Children } from "react";
import nothingImage from "@/assets/nothing.webp";
import { useNavigate } from "react-router-dom";
import { usePollStore } from "@/stores/pollStore";
import { useQuery } from "@tanstack/react-query";
import { Categories } from "@/types/polls";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/api/requests";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function Polls():React.ReactElement{
    const navigate = useNavigate();

    const {pollData}=usePollStore();
    const {userInfo}=useAuthStore();

    const {data:userVotes,isLoading}=useQuery({
        queryKey:["uservotes"],
        queryFn: async()=>{
            return api.get<Record<Categories,boolean>>(`votes/${pollData!._id}/myvotes`);
        },
        enabled:!!userInfo && !!pollData
    });

    const medios:{
        name:string;
        key:Categories;
        link:string
    }[] = [
        {
            name: "Anime del mes",
            key:"anime",
            link:"/anime"
        },
        {
            name: "Manga del mes",
            key:"manga",
            link:"/manga"
        },
        {
            name: "Novela del mes",
            key:"novel",
            link:"/novel"
        },
        {
            name: "Novela visual del mes",
            key:"vn",
            link:"/vn"
        },
        {
            name: "Live action del mes",
            key:"live",
            link:"/live"
        }
    ];

    if(isLoading){
        return <div>Loading...</div>;
    }

    return(
        <div className="flex justify-center">
            {(pollData&&!!userVotes)?(
                <div className="mt-8">
                    <h1 className="text-4xl text-center">Encuesta del mes de {pollData.month.toLowerCase()}</h1>
                    <ul className="flex flex-wrap gap-4 mt-8">
                        {Children.toArray(medios.map((medio)=>(
                            <li className="w-full sm:w-[calc(50%-.5rem)] text-card">
                                <TooltipProvider delayDuration={100}>
                                    <Tooltip>
                                        <TooltipTrigger disabled={userVotes[medio.key]} className="w-full py-8 text-2xl disabled:opacity-20 bg-card-foreground rounded-lg" onClick={()=>{
                                            navigate(`${medio.link}`);
                                        }}>
                                            {medio.name}
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            {userVotes[medio.key]?"Ya has votado en esta categoría":"Haz click para votar en esta categoría"}
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </li>
                        )))}
                    </ul>
                </div>
            ):(
                <div className="flex flex-col sm:flex-row rounded-xl mt-8 pt-4 bg-card-foreground px-4">
                    <div className="flex justify-center flex-1 sm:mt-8 lg:mt-16">
                        <p className="text-center text-xl md:text-2xl lg:text-3xl text-primary-foreground font-bold">Todavía no hay encuestas activas, inténtalo más tarde</p>
                    </div>
                    <div className="flex justify-end">
                        <img src={nothingImage} alt="Nada" className="w-[350px]"/>
                    </div>
                </div>
            )}
        </div>
    );
}