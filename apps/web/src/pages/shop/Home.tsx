import HomeCarousell from "@/components/home/HomeCarousell"
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { flashMessage_Success } from "@/lib/flash";

export default function Home(){

const location = useLocation();

  useEffect(() => {
    if (location.state?.toast) {
        flashMessage_Success(location.state.toast);
      window.history.replaceState({}, document.title); // clear state
    }
  }, [location.state?.toast]);


    return(
        <div>
           
           <HomeCarousell></HomeCarousell>
           <hr className="mt-5"/>
            
        </div>
    )
} 