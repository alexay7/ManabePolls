import {Dialog, DialogContent, DialogDescription, DialogTitle} from "@/components/ui/dialog";
import {useAuthStore} from "@/stores/authStore";
import {DiscordUserData} from "@/types/discord";
import React, {useEffect} from "react";
import {useSearchParams} from "react-router-dom";
import trustMeBro1 from "@/assets/trustmebro.webp";
import trustMeBro2 from "@/assets/trustmebro2.webp";
import trustMeBro3 from "@/assets/trustmebro3.webp";
import DiscordIcon from "@/assets/discord.svg?react";

export default function DiscordLogin(): React.ReactElement {
    const [searchParams, setSearchParams] = useSearchParams();
    const {
        accessToken,
        tokenType,
        setAccessToken,
        setTokenType,
        userInfo,
        setUserInfo,
        setLoading,
        loading
    } = useAuthStore();

    const modalRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function getToken(code: string) {
            const result = await fetch(`${import.meta.env.VITE_APP_API_URL}/discord/token`, {
                method: 'POST',
                body: JSON.stringify({code}),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            setSearchParams({});
            if (result.status !== 200) {
                setAccessToken(undefined);
                setTokenType(undefined);
                localStorage.removeItem("bearerToken");
                localStorage.removeItem("auth-storage")
                setLoading(false);
                return;
            }

            const data = await result.json();

            setAccessToken(data["access_token"]);
            setTokenType(data["token_type"]);
        }

        const code = searchParams.get('code');

        if (code && !accessToken) {
            setLoading(true);
            getToken(code);
        }
    }, [searchParams, setAccessToken, setTokenType, setSearchParams, accessToken]);

    useEffect(() => {
        async function getUserInfo() {
            const result = await fetch(`${import.meta.env.VITE_APP_API_URL}/discord/p/getMe`, {
                headers: {
                    "Authorization": `${tokenType} ${accessToken}`
                }
            });

            if (result.status !== 200) {
                setLoading(false);
                return;
            }

            const {accessToken: manabeToken, userInfo} = await result.json() as {
                accessToken: string,
                userInfo: DiscordUserData
            };

            setUserInfo({...userInfo, admin: userInfo.id === import.meta.env.VITE_APP_ADMIN_ID});
            // Save token in session storage
            localStorage.setItem("bearerToken", manabeToken);
            setLoading(false);
        }

        const manabeToken = localStorage.getItem("bearerToken");

        if (accessToken && !manabeToken) {
            getUserInfo();
        }
    }, [accessToken, setUserInfo]);

    useEffect(() => {
        const modal = modalRef.current;
        if (modal) {
            modal.querySelector(`button`)?.remove();
        }
    }, [modalRef]);

    function showRandomTrustMeBroImage() {
        const images = [trustMeBro1, trustMeBro2, trustMeBro3];

        return images[Math.floor(Math.random() * images.length)];
    }

    return (
        <Dialog open={!userInfo && !loading}>
            <DialogContent ref={modalRef}>
                <DialogTitle>Inicia sesión con Discord</DialogTitle>
                <DialogDescription>
                    <div className="flex gap-8">
                        <div className="w-1/3 flex flex-col items-center gap-2">
                            <img src={showRandomTrustMeBroImage()} alt=""/>
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-evenly gap-4 lg:gap-0">
                            <p>Necesitamos confirmar tu identidad para poder votar en las encuestas del mes. Tranquilo,
                                no vamos a hacer nada con tus datos de Discord. Trust me Bro.</p>
                            <p className="text-2xl japanese-text">「にぱー」</p>
                            <a className="bg-[#747df8] text-white w-2/3 py-2 text-center rounded-sm flex items-center justify-center gap-2 text-xl"
                               href={import.meta.env.VITE_APP_DISCORD_URL} onClick={() => {
                                localStorage.setItem("origin", window.location.pathname);
                            }}><DiscordIcon className="w-8"/> Discord</a>
                        </div>
                    </div>
                </DialogDescription>
            </DialogContent>
        </Dialog>
    );
}