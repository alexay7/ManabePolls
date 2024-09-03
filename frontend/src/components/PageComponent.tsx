import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Outlet, useNavigate } from "react-router-dom";

export default function PageComponent():React.ReactElement{
    const navigate = useNavigate();

    return (
        <div className="w-full flex flex-col items-center min-h-[calc(100vh-4rem)] justify-between">
            <Header/>
            <Outlet/>
            <div className="w-full flex justify-end mt-8">
                <Button variant="link" onClick={()=>{
                    navigate("/privacy");
                }}>Política de privacidad</Button>
            </div>
        </div>
    );
}