"use client";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isStoreAdmin } from "@/lib/admin-access";

export default function AdminGuard({children}:{children:ReactNode}) {
    const router=useRouter();
    const [authorized,setAuthorized]=useState(false);
    useEffect(()=>{
        let active=true;
        async function verify(){
            const {data,error}=await supabase.auth.getUser();
            if(!active)return;
            if(error || !isStoreAdmin(data.user)){setAuthorized(false);router.replace("/admin");return;}
            setAuthorized(true);
        }
        void verify();
        const {data:{subscription}}=supabase.auth.onAuthStateChange(()=>{
            setAuthorized(false);
            // Avoid starting an Auth request while its state-change lock is held.
            setTimeout(()=>{if(active)void verify();},0);
        });
        return ()=>{active=false;subscription.unsubscribe();};
    },[router]);
    if(!authorized)return <p className="p-8 text-center" role="status">Verifying administrator access…</p>;
    return <><div className="flex justify-end px-6 pt-4"><button className="text-sm underline" onClick={async()=>{setAuthorized(false);await supabase.auth.signOut();router.replace("/admin");}}>Sign out</button></div>{children}</>;
}
