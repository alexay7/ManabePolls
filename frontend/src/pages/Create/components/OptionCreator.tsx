import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { Children, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { OptionType, PollType } from "@/types/polls";
import { Button } from "@/components/ui/button";
import {z} from "zod";
import { api } from "@/api/requests";
import { usePollStore } from "@/stores/pollStore";

interface OptionCreatorProps {
    type: "anime" | "manga" | "novel" | "vn" | "live";

    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function OptionCreator({ type, open, setOpen }: OptionCreatorProps): React.ReactElement {
    const {selectedPoll,setPollData}=usePollStore();

    const [image, setImage] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [links, setLinks] = useState<OptionType["links"]>([]);
    const [difficulty, setDifficulty] = useState<string>("");
    const [proposer, setProposer] = useState<string>("");

    const formRef = useRef<HTMLFormElement>(null);

    function getDefaultLabelNameByType(type: string) {
        switch (type) {
        case "anime":
            return "Anilist";
        case "manga":
            return "Anilist";
        case "novel":
            return "Anilist";
        case "vn":
            return "VNDB";
        case "live":
            return "Letterboxd";
        default:
            return "Opción";
        }
    }

    function addLink() {
        setLinks([...links, { name: getDefaultLabelNameByType(type), url: "" }]);
    }

    function modifyLink(index: number, key: "name" | "url", value: string) {
        const newLinks = links.map((link, i) => {
            if (i === index) {
                return {
                    ...link,
                    [key]: value
                };
            }
            return link;
        });

        setLinks(newLinks);
    }

    async function createOption(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const formSchema = z.object({
            name: z.string().min(1),
            imageUrl: z.string().min(1).url(),
            description: z.string().min(1),
            links: z.array(z.object({
                name: z.string().min(1),
                url: z.string().min(1).url()
            })).optional(),
            difficulty: z.string().optional(),
            proposer: z.string().min(1),
        });

        const result = formSchema.safeParse({
            name,
            imageUrl:image,
            description,
            links:links,
            difficulty,
            proposer
        });

        if(!result.success){
            return;
        }

        const response = await api.put<{
            name:string,
            imageUrl:string,
            description:string,
            links?:OptionType["links"]
            proposer:string
        },PollType>(`polls/${selectedPoll}/${type}/options`, result.data);

        if(response){
            setPollData(response);

            setName("");
            setDescription("");
            setImage("");
            setLinks([]);
            setProposer("");
            setDifficulty("");
        }
    }

    function generateLink(){
        switch(type){
        case "anime":
            return `https://learnnatively.com/search/jpn/videos/?q=${name}`;
        case "manga":
            return `https://learnnatively.com/search/jpn/books/?q=${name}`;
        case "novel":
            return `https://learnnatively.com/search/jpn/books/?q=${name}`;
        case "vn":
            return `https://jpdb.io/visual-novel-difficulty-list?q=${name}`;
        case "live":
            return `https://learnnatively.com/search/jpn/videos/?q=${name}`;
        default:
            return "";
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-h-[calc(100vh-10%)] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Nueva opción</DialogTitle>
                    <DialogDescription>Crear la opción</DialogDescription>
                </DialogHeader>
                <form id="optioncreate" ref={formRef} onSubmit={createOption} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2 flex-1">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="name">Nombre*</Label>
                            <Button size="sm" variant="ghost">Cotejar</Button>
                        </div>
                        <Input required value={name} id="name" type="text" onChange={(e)=>setName(e.target.value)}/>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex flex-col gap-2 flex-1">
                            <Label htmlFor="image">Imagen*</Label>
                            <Input required value={image} id="image" type="text" onChange={(e) => setImage(e.target.value)} />
                        </div>
                        <div className="w-[150px]">
                            <img src={image} alt="" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="description">Descripción*</Label>
                        <Textarea required value={description} onChange={(e)=>setDescription(e.target.value)}/>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-4 items-center">
                            <Label htmlFor="difficulty">Dificultad</Label>
                            {!!name&&(
                                <div className="text-xs flex gap-2 text-muted-foreground">
                                    <a href={generateLink()} target="_blank" rel="noreferrer">Link</a>
                                </div>
                            )}
                        </div>
                        <Input value={difficulty} id="difficulty" type="text" onChange={(e)=>setDifficulty(e.target.value)}/>
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                        <Label htmlFor="name">Id del usuario que propone*</Label>
                        <Input required value={proposer} id="proposer" type="text" onChange={(e)=>setProposer(e.target.value)}/>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>Links</Label>
                        {Children.toArray(links.map((link, index) => (
                            <div className="flex gap-4" key={index}>
                                <Input required className="w-[16ch]" type="text" placeholder="Nombre" value={link.name} onChange={(e)=>{
                                    modifyLink(index, "name", e.target.value);
                                }}/>
                                <Input required type="text" placeholder="URL" value={link.url} onChange={(e)=>{
                                    modifyLink(index, "url", e.target.value);
                                }}/>
                            </div>
                        )))}
                        <div className="">
                            <Button type="button" onClick={addLink}>+</Button>
                        </div>
                    </div>
                </form>
                <DialogFooter>
                    <Button form="optioncreate">Crear</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}