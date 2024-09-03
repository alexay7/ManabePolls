import { api } from "@/api/requests";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/authStore";
import { usePollStore } from "@/stores/pollStore";
import { HttpError } from "@/types/error";
import { OptionType } from "@/types/polls";
import React, { Children, Fragment, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { twMerge } from "tailwind-merge";

export default function Poll():React.ReactElement{
    const navigate = useNavigate();
    const {poll}=useParams();
    const { toast } = useToast();

    const {userInfo}=useAuthStore();
    const {pollData}=usePollStore();

    // Cada usuario puede elegir las opciones que le de la gana menos la suya
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [drawerOpen, setDrawerOpen] = useState(false);

    function selectOption(option:OptionType){
        if(!userInfo)return;
        
        if(selectedOptions.includes(option._id)){
            setSelectedOptions(selectedOptions.filter(o=>o!==option._id));
        }else{
            setSelectedOptions([...selectedOptions, option._id]);
        }
    }

    if(!poll||!pollData){
        return <></>;
    }

    const category = poll as "anime"|"manga"|"novel"|"vn"|"live";

    async function emitVote(){
        if(!userInfo||!pollData)return;

        if(selectedOptions.length===0){
            toast({
                title:"No has seleccionado ninguna opción",
                description:"Por favor, selecciona al menos una opción para emitir tu voto",
                variant:"destructive"
            });
            return;
        }

        let ownOption = false;

        for(const option of selectedOptions){
            const optionData = pollData[category].find(o=>o._id===option);
            if(optionData?.proposer===userInfo.id){
                ownOption = true;
                break;
            }
        }

        if(ownOption){
            toast({
                title:"No puedes votar por tu propia opción",
                description:"Lo siento, pero no puedes votar por la opción que tú mismo has propuesto",
                variant:"destructive"
            });
            return;
        }

        const newVote = {
            options:selectedOptions
        };

        api.post(`votes/${pollData._id}/${category}`,newVote).then(()=>{
            toast({
                title:"Voto emitido",
                description:"Tu voto ha sido emitido correctamente",
                variant:"default"
            });
            setSelectedOptions([]);
            setDrawerOpen(false);
            navigate("/");
        }).catch((err)=>{
            const error = err as HttpError;

            if(error.message==="You have already voted in this category"){
                toast({
                    title:"Ya has votado en esta categoría",
                    description:"Lo siento, pero ya has votado en esta categoría",
                    variant:"destructive"
                });

                setSelectedOptions([]);
                setDrawerOpen(false);
                navigate("/");
            }
        });
    }

    return(
        <Fragment>
            <div className="flex flex-col gap-4 mt-8 select-none">
                <h1 className="text-3xl">Encuesta para el {poll} de {pollData.month.toLowerCase()} de {pollData.year}</h1>
                <p className="text-lg text-muted-foreground">Puedes seleccionar todas las opciones que te parezcan atractivas, no hay límite de votos.</p>
                <ul className="flex flex-col gap-4">
                    {Children.toArray(pollData[category].map((option)=>(
                        <li className="bg-card-foreground rounded-lg py-2">
                            <label className="w-full flex items-center gap-8 cursor-pointer flex-col sm:flex-row" htmlFor={option._id}>
                                <input type="checkbox" className={twMerge("sm:ml-8 p-4 cursor-pointer",option.proposer===userInfo?.id ? "bg-background":"")} id={option._id} checked={selectedOptions.includes(option._id)} onChange={()=>{
                                    if(!userInfo || option.proposer===userInfo.id){
                                    // Notify user that they can't vote for their own option
                                        toast({
                                            title:"No puedes votar por tu propia opción",
                                            description:"Lo siento, pero no puedes votar por la opción que tú mismo has propuesto",
                                            variant:"destructive"
                                        });
                                        return;
                                    }

                                    selectOption(option);
                                }}/>
                                <div className="text-primary-foreground flex flex-col-reverse sm:flex-row px-2 gap-4 items-center">
                                    <div className="flex flex-col flex-1 gap-4 justify-between">
                                        <h2 className="text-lg sm:text-3xl font-semibold japanese-text">{option.name}</h2>
                                        <div className="">
                                            <p className="line-clamp-5">{option.description}
                                            </p>
                                        </div>
                                        <div className="flex gap-4">
                                            <p className="font-semibold">Link:</p>
                                            {Children.toArray(option.links.map((link)=>(
                                                <a href={link.url} target="_blank" rel="noreferrer" className="text-primary-foreground hover:underline">{link.name}</a>
                                            )))}
                                        </div>
                                    </div>
                                    <div className="rounded-lg overflow-hidden w-3/4 sm:w-1/4 group shadow-md shadow-muted-foreground">
                                        <img className="group-hover:scale-150 transition-transform" src={option.imageUrl} alt="" />
                                    </div>
                                </div>
                            </label>
                        </li>
                    )))}
                </ul>
                <div className="w-full">
                    <Drawer open={drawerOpen} onClose={()=>setDrawerOpen(false)}>
                        <DrawerTrigger disabled={selectedOptions.length===0} className="bg-secondary text-primary border-primary border-4 w-full py-2 rounded-lg disabled:opacity-70" onClick={()=>setDrawerOpen(true)}>
                            Emitir voto
                        </DrawerTrigger>
                        <DrawerContent className="max-w-screen-lg mx-auto">
                            <DrawerHeader>
                                <DrawerTitle>¿Estás seguro?</DrawerTitle>
                                <DrawerDescription>Estos serán tus votos para {category} del mes de {pollData.month.toLowerCase()} de {pollData.year}</DrawerDescription>
                            </DrawerHeader>
                            {/* Show the images of user votes */}
                            <div className="flex gap-4 justify-center flex-wrap">
                                {Children.toArray(selectedOptions.map((optionId)=>{
                                    const option = pollData[category].find(o=>o._id===optionId);

                                    return(
                                        <div className="rounded-lg overflow-hidden w-[100px] group flex flex-col gap-2">
                                            <img className="group-hover:scale-150 transition-transform" src={option?.imageUrl} alt="" />
                                            <p className="text-xs japanese-text">{option?.name}</p>
                                        </div>
                                    );
                                }))}
                            </div>
                            <DrawerFooter>
                                <Button onClick={emitVote}>Confirmar</Button>
                                <DrawerClose onClick={()=>{
                                    setDrawerOpen(false);
                                }}>Cancelar</DrawerClose>
                            </DrawerFooter>
                        </DrawerContent>
                    </Drawer>
                </div>
            </div>
        </Fragment>
    );
}