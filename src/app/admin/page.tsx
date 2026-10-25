"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isStoreAdmin } from "@/lib/admin-access";

export default function AdminLogin(){
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    const [error,setError]=useState("");
    const [notice,setNotice]=useState("");
    const [loading,setLoading]=useState(false);
    const router=useRouter();
    async function handleLogin(event:React.FormEvent){
        event.preventDefault();setLoading(true);setError("");setNotice("");
        try{
            const {data,error:authError}=await supabase.auth.signInWithPassword({email:email.trim(),password});
            if(authError || !isStoreAdmin(data.user)){
                if(data.session)await supabase.auth.signOut();
                setError("Unable to sign in with an authorised administrator account.");return;
            }
            setPassword("");router.replace("/admin/dashboard");
        }catch{setError("Unable to sign in. Please try again later.");}
        finally{setLoading(false);}
    }
    async function resendConfirmation(){
        if(!email.trim())return;
        setLoading(true);setError("");setNotice("");
        try{
            const {error:resendError}=await supabase.auth.resend({type:"signup",email:email.trim()});
            if(resendError){setError("Unable to request confirmation. Please wait and try again.");return;}
            setNotice("If this email has an account awaiting confirmation, check its inbox and spam folder. Confirm the email, then return here to sign in.");
        }catch{setError("Unable to request confirmation. Please try again later.");}
        finally{setLoading(false);}
    }
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4"><div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border border-gray-100"><h1 className="text-2xl font-heading font-bold mb-6">Administrator sign in</h1><form onSubmit={handleLogin} className="space-y-4"><div><label htmlFor="admin-email" className="block text-sm font-medium mb-1">Email</label><input id="admin-email" type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-4 py-2 border rounded-lg"/></div><div><label htmlFor="admin-password" className="block text-sm font-medium mb-1">Password</label><input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} className="w-full px-4 py-2 border rounded-lg"/></div>{error?<p role="alert" className="text-red-700 text-sm">{error}</p>:null}<button disabled={loading} type="submit" className="w-full bg-gray-900 text-white py-2 rounded-lg disabled:opacity-50">{loading?"Signing in…":"Sign in"}</button><button type="button" disabled={loading || !email.trim()} onClick={resendConfirmation} className="w-full text-sm underline disabled:opacity-50">Resend confirmation email</button>{notice?<p role="status" className="text-gray-700 text-sm">{notice}</p>:null}</form></div></div>;
}

