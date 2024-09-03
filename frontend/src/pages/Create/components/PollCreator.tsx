import { api } from "@/api/requests";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePollStore } from "@/stores/pollStore";
import { PollType } from "@/types/polls";
import React, { useState } from "react";

interface PollCreatorProps{
    open:boolean;
    setOpen:React.Dispatch<React.SetStateAction<boolean>>;
}

export default function PollCreator({open,setOpen}:PollCreatorProps):React.ReactElement{
    const {addPoll}=usePollStore();

    const [year,setYear]=useState<string>(new Date().getFullYear().toString());
    const [month,setMonth]=useState<string>("");

    async function createPoll(e:React.FormEvent<HTMLFormElement>){
        e.preventDefault();

        const response = await api.post<{month:string,year:string},PollType>("polls/create",{
            month,
            year
        });

        if(response){
            addPoll(response);
            setOpen(false);
        }
    }

    return(
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Nueva encuesta</DialogTitle>
                    <DialogDescription>Introduce el mes y año de la encuesta</DialogDescription>
                </DialogHeader>
                <form id="pollcreate" onSubmit={createPoll} className="flex flex-col gap-4">
                    <Select required value={month} onValueChange={(v)=>{
                        setMonth(v);
                    }}>
                        <SelectTrigger>
                            <SelectValue placeholder="Mes"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Mes</SelectLabel>
                                <SelectItem value="Enero">Enero</SelectItem>
                                <SelectItem value="Febrero">Febrero</SelectItem>
                                <SelectItem value="Marzo">Marzo</SelectItem>
                                <SelectItem value="Abril">Abril</SelectItem>
                                <SelectItem value="Mayo">Mayo</SelectItem>
                                <SelectItem value="Junio">Junio</SelectItem>
                                <SelectItem value="Julio">Julio</SelectItem>
                                <SelectItem value="Agosto">Agosto</SelectItem>
                                <SelectItem value="Septiembre">Septiembre</SelectItem>
                                <SelectItem value="Octubre">Octubre</SelectItem>
                                <SelectItem value="Noviembre">Noviembre</SelectItem>
                                <SelectItem value="Diciembre">Diciembre</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Input required placeholder="Año" value={year} onChange={(e)=>{
                        setYear(e.target.value);
                    }}/>
                </form>
                <DialogFooter>
                    <Button form="pollcreate">Crear</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}