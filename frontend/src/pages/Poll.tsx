import { api } from "@/api/requests";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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

    const {userInfo,tickets,consumeTicket}=useAuthStore();
    const {pollData}=usePollStore();

    // Cada usuario puede elegir las opciones que le de la gana menos la suya
    const [selectedOptions, setSelectedOptions] = useState<{
        option:string,
        ticket:boolean
    }[]>([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [ticketUsed, setTicketUsed] = useState(false);

    function selectOption(option:OptionType){
        if(!userInfo)return;
        
        const newSelectedOptions = [...selectedOptions];

        const optionIndex = newSelectedOptions.findIndex((o)=>o.option===option._id);

        if(optionIndex===-1){
            newSelectedOptions.push({
                option:option._id,
                ticket:false
            });

            setSelectedOptions(newSelectedOptions);
        } else{
            // If the option has a ticket, remove it
            if(newSelectedOptions[optionIndex].ticket){
                setTicketUsed(false);
            }

            newSelectedOptions.splice(optionIndex,1);
            setSelectedOptions(newSelectedOptions);
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
            const optionData = pollData[category].find(o=>o._id===option.option);
            if(optionData?.proposer===userInfo.id&&!option.ticket){
                ownOption = true;
                break;
            }

            if(option.ticket){
                consumeTicket();
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
            } else if(error.message==="You don't have enough tickets"){
                toast({
                    title:"No tienes suficientes tickets",
                    description:"Lo siento pero no tienes suficientes tickets para votar doble en esta categoría",
                    variant:"destructive"
                });
            }
        });
    }

    return(
        <Fragment>
            <div className="flex flex-col gap-4 mt-8 select-none">
                <h1 className="text-3xl">Encuesta para el {poll} de {pollData.month.toLowerCase()} de {pollData.year}</h1>
                <p className="text-lg text-muted-foreground">Puedes seleccionar todas las opciones que te parezcan atractivas, no hay límite de votos.</p>
                {tickets>0&&!ticketUsed&&(
                    <p className="text-center mt-4 animate-bounce">¡Tienes {tickets} {tickets===1?"ticket disponible":"tickets disponibles"}!</p>
                )}
                <ul className="flex flex-col gap-8">
                    {Children.toArray(pollData[category].map((option)=>(
                        <li className="flex gap-2 md:flex-row flex-col">
                            <div className={twMerge("bg-card-foreground rounded-lg py-2 flex-grow",
                                selectedOptions.some((o)=>o.option===option._id&&o.ticket)?"border-green-400 border-4":""
                            )}>
                                <label className="w-full flex items-center gap-8 cursor-pointer flex-col sm:flex-row" htmlFor={option._id}>
                                    <input type="checkbox" className={twMerge("sm:ml-8 p-4 cursor-pointer",option.proposer===userInfo?.id ? "bg-background":"")} id={option._id} checked={selectedOptions.some((o)=>o.option===option._id)}
                                        onChange={()=>{
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
                            </div>
                            {tickets>0&&!ticketUsed&&(selectedOptions.some((o)=>o.option===option._id) || option.proposer===userInfo?.id)&&(
                                <TooltipProvider delayDuration={100}>
                                    <Tooltip>
                                        <TooltipTrigger className="w-full md:w-[12%] py-8 bg-green-500 rounded-lg flex-shrink-0 border-amber-300 border-4" onClick={()=>{
                                            setTicketUsed(true);
                                            const newSelectedOptions = [...selectedOptions];
                                            const optionIndex = newSelectedOptions.findIndex((o)=>o.option===option._id);

                                            if(optionIndex===-1){
                                                // Es una obra que ha propuesto el usuario, crear un voto
                                                newSelectedOptions.push({
                                                    option:option._id,
                                                    ticket:true
                                                });
                                            }else{
                                                newSelectedOptions[optionIndex].ticket = true;
                                            }
                                            setSelectedOptions(newSelectedOptions);
                                        }}>
                                            <div className="flex items-center ml-4 gap-6 md:flex-col md:ml-0">
                                                <p className="text-3xl w-9 h-9 bg-background rounded-full flex justify-center items-center border-amber-300 border-4"></p>
                                                <p className="text-white text-3xl font-bold tracking-[13px] md:tracking-widest uppercase md:[writing-mode:vertical-lr] drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">Ticket x2</p>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                        Consume un ticket para que tu voto valga doble
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
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
                                {Children.toArray(selectedOptions.map((opt)=>{
                                    const option = pollData[category].find((o)=>o._id===opt.option);

                                    return(
                                        <div className={twMerge("rounded-lg overflow-hidden w-[110px] group flex flex-col gap-2 pb-1",
                                            opt.ticket?"border-green-400 border-4":"border-white border-2"
                                        )}>
                                            <img className="group-hover:scale-150 transition-transform" src={option?.imageUrl} alt="" />
                                            <p className="text-xs japanese-text text-center px-1">{option?.name}</p>
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