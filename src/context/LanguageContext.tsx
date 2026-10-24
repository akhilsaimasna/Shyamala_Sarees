"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from '@/lib/translations';

type LanguageContextType = {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: typeof translations['en'];
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const savedLang = localStorage.getItem('app-language') as Language;
        if (savedLang) {
            // Respect previously saved preference
            setLanguageState(savedLang);
        } else {
            // Auto-detect from browser language
            const browserLang = navigator.language || (navigator as any).userLanguage || '';
            if (browserLang.startsWith('te')) {
                // Browser is set to Telugu (te or te-IN)
                setLanguageState('te');
            }
            // Default stays 'en' for all other languages
        }
        setMounted(true);
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('app-language', lang);
    };

    const t = translations[language];

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
