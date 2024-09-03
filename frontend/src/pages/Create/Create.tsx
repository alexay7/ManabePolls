import { useAuthStore } from "@/stores/authStore";
import React, { Children, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import { api } from "@/api/requests";
import { PollType } from "@/types/polls";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import PollCreator from "@/pages/Create/components/PollCreator";
import { usePollStore } from "@/stores/pollStore";
import { Button } from "@/components/ui/button";
import OptionCreator from "@/pages/Create/components/OptionCreator";
import { TrashIcon } from "lucide-react";

export default function Create():React.ReactElement{
    const navigate = useNavigate();

    const {userInfo}=useAuthStore();
    const {setPollData,pollData,setAvailablePolls,availablePolls,selectPoll,selectedPoll}=usePollStore();

    const pollTypes = [
        {
            name:"Anime",
            value:"anime"
        },
        {
            name:"Manga",
            value:"manga"
        },
        {
            name:"Novela",
            value:"novel"
        },
        {
            name:"Novela visual",
            value:"vn"
        },
        {
            name:"Live action",
            value:"live"
        }
    ];

    const [selectedType,setSelectedType]=useState<"anime"|"manga"|"novel"|"vn"|"live">("anime");
    const [createNewPoll,setCreateNewPoll]=useState<boolean>(false);
    const [addNewOption,setAddNewOption]=useState<boolean>(false);

    const {data=[]}=useQuery({
        queryKey:["polls"],
        queryFn: async()=>{
            if(!userInfo||!userInfo.admin) return [];

            return api.get<PollType[]>("polls");
        }
    });

    useEffect(()=>{
        if(!userInfo || !userInfo.admin){
            navigate("/");
        }
    },[userInfo,navigate]);

    useEffect(()=>{
        if(data.length>0){
            setAvailablePolls(data);
            selectPoll(data[0]._id);
        }
    },[data,setAvailablePolls,selectPoll]);

    useEffect(()=>{
        if(selectedPoll){
            const poll = data.find(poll=>poll._id===selectedPoll);
            if(poll){
                setPollData(poll);
            }
        }
    },[selectedPoll,data,setPollData]);

    async function deleteOption(optionName:string){
        if(!selectedPoll) return;

        const response = await api.delete<PollType>(`polls/${selectedPoll}/${selectedType}/options/${optionName}`);

        setPollData(response);
    }

    async function activatePoll(){
        if(!selectedPoll) return;

        const response = await api.patch<void,PollType>(`polls/${selectedPoll}/activate`);

        setPollData(response);
    }

    function renderOptions():React.ReactElement{
        if(!pollData) return (
            <div>
                <p>Esa encuesta no existe</p>
            </div>
        );

        const options = pollData[selectedType];

        if (options.length===0) return (
            <div>
                <p>No hay opciones</p>
            </div>
        );

        return (
            <ul className="w-full flex flex-col gap-4">
                {Children.toArray(options.map(option=>(
                    <li className="flex gap-4">
                        <div className="w-full flex py-2 items-center gap-8 bg-primary rounded-lg">
                            <div className="text-primary-foreground flex px-2 gap-8 items-center">
                                <div className="rounded-lg overflow-hidden w-[150px]">
                                    <img src={option.imageUrl} alt="" />
                                </div>
                                <div className="flex flex-col flex-1 gap-4 justify-between">
                                    <h2 className="text-3xl text-end japanese-text">{option.name}</h2>
                                    <div className="">
                                        <p className="line-clamp-6">{option.description}</p>
                                    </div>
                                    <div className="flex gap-4 items-center">
                                        <p className="font-semibold">Links:</p>
                                        {Children.toArray(option.links.map((link,index)=>(
                                            <a href={link.url} key={index} className="text-accent hover:underline border border-blue-950 rounded-lg px-2 py-1">{link.name}</a>
                                        )))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button className="w-10 bg-red-500 rounded-lg flex justify-center items-center cursor-pointer hover:bg-transparent hover:text-red-500 border-2 border-red-500 transition-colors" onClick={()=>{
                            deleteOption(option.name);
                        }}>
                            <TrashIcon/>
                        </button>
                    </li>
                )))}
            </ul>
        );
    }

    return(
        <div className='flex flex-col gap-4 w-full md:w-3/4 items-center'>
            <PollCreator open={createNewPoll} setOpen={setCreateNewPoll}/>
            <OptionCreator type={selectedType} open={addNewOption} setOpen={setAddNewOption}/>
            <div className="flex gap-4">
                <Select value={selectedPoll} onValueChange={(v)=>{
                    if(v==="new"){
                        setCreateNewPoll(true);
                        return;
                    }

                    selectPoll(v);
                }}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Elige una encuesta"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Encuestas</SelectLabel>
                            {Children.toArray(availablePolls.map(poll=>(
                                <SelectItem value={poll._id}>{poll.month} - {poll.year}</SelectItem>
                            )))}
                            <SelectItem className="cursor-pointer" value="new">+ Nueva encuesta</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Select value={selectedType} onValueChange={(v)=>{
                    setSelectedType(v as "anime"|"manga"|"novel"|"vn"|"live");
                }}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Elige un tipo"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Tipo</SelectLabel>
                            {Children.toArray(pollTypes.map(poll=>(
                                <SelectItem value={poll.value}>{poll.name}</SelectItem>
                            )))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            {!!pollData && (
                <div className="flex flex-col gap-4 items-center w-full">
                    {!pollData.active && (
                        <Button variant="destructive" onClick={activatePoll}>Activar encuesta</Button>
                    )}
                    <Button onClick={()=>setAddNewOption(true)}>Añadir opción nueva</Button>
                    {renderOptions()}
                </div>
            )}
        </div>
    );
}