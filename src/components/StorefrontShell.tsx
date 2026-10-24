"use client";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LanguageModal from "@/components/LanguageModal";
import ChatBot from "@/components/ChatBot";

export default function StorefrontShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    if (pathname === "/" || pathname === "/products") return <>{children}</>;
    return <><LanguageModal /><Header />{children}<Footer /><ChatBot /></>;
}
