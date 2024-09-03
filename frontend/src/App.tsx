import Polls from '@/pages/Polls';
import './App.css';
import DiscordLogin from '@/components/DiscordLogin';
import { useNavigate, useParams } from 'react-router-dom';
import Poll from '@/pages/Poll';
import { usePollStore } from '@/stores/pollStore';
import { useQuery } from '@tanstack/react-query';
import { PollType } from '@/types/polls';
import { api } from '@/api/requests';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export default function App() {
    const navigate = useNavigate();
    const {userInfo}=useAuthStore();
    const {poll}=useParams();

    const {setPollData}=usePollStore();

    const {data,isLoading} = useQuery({
        queryKey:["activepolls"],
        queryFn: async()=>{
            const polls = await api.get<PollType[]>("polls/active");

            if(polls.length>0){
                return polls[polls.length-1];
            }

            return null;
        },
        enabled:!!userInfo
    });

    useEffect(()=>{
        if(data){
            setPollData(data);
        }
    },[data,setPollData]);

    useEffect(()=>{
        const origin = localStorage.getItem("origin");

        if(origin){
            localStorage.removeItem("origin");
            navigate(origin);
        }
    },[navigate]);

    if(isLoading){
        return <div>Loading...</div>;
    }

    return (
        <div className='flex flex-col gap-4 w-full md:w-3/4'>
            <DiscordLogin/>
            {poll?<Poll/>:<Polls/>}
        </div>
    );
}
