import {ModeToggle} from "@/components/mode-toggle";
import {Button} from "@/components/ui/button";
import {useAuthStore} from "@/stores/authStore";
import {LogOut} from "lucide-react";
import React from "react";

export default function Header(): React.ReactElement {
    const {userInfo, logout} = useAuthStore();

    return (
        <div className="w-full flex flex-col gap-2 sm:flex-row justify-between items-center my-4">
            <a href="/" className="text-2xl font-bold">Manabe - Encuestas del mes</a>
            <div className=""></div>
            <div className="flex items-center gap-12">
                <ModeToggle/>
                {!!userInfo && (
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-4">
                            <a href={`/gacha/${userInfo.id}?user=${userInfo.username}`}
                               className='text-green-600 font-semibold hover:underline'>{userInfo?.username}</a>
                            <img className='w-9 border border-solid border-input rounded-md hover:bg-accent'
                                 src={`${import.meta.env.VITE_APP_DISCORD_AVATARS_URL}/${userInfo?.id}/${userInfo?.avatar}.webp`}
                                 alt=""/>
                        </div>
                        <Button className="text-red-500" variant="outline" size="icon" onClick={logout}>
                            <LogOut/>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}