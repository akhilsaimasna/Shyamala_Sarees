"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles, Phone } from "lucide-react";

interface Message {
    role: "user" | "assistant";
    content: string;
}

const SUGGESTED_QUESTIONS = [
    "What sarees do you have for weddings? 💍",
    "What's a good gift saree under ₹5000?",
    "How do I care for silk sarees?",
    "Do you ship outside India? ✈️",
];

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "నమస్కారం! Hello! 🌸 I'm Shyamala, your personal saree assistant. How can I help you find your perfect saree today?",
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [hasNewMessage, setHasNewMessage] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (isOpen) {
            setHasNewMessage(false);
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    // Show a notification bubble after 5 seconds if chat is closed
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!isOpen) setHasNewMessage(true);
        }, 5000);
        return () => clearTimeout(timer);
    }, [isOpen]);

    const sendMessage = async (text?: string) => {
        const messageText = text || input.trim();
        if (!messageText || isLoading) return;

        const newMessages: Message[] = [
            ...messages,
            { role: "user", content: messageText },
        ];
        setMessages(newMessages);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: newMessages }),
            });
            const data = await res.json();
            setMessages([...newMessages, { role: "assistant", content: typeof data.message === "string" ? data.message : "Please WhatsApp our team at +91 9440653443 for help." }]);
        } catch {
            setMessages([
                ...newMessages,
                {
                    role: "assistant",
                    content: "Sorry, I'm having trouble connecting 🙏 Please WhatsApp us at +91 9440653443!",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Chat Window */}
            <div
                className={`fixed bottom-24 right-4 md:right-6 z-50 transition-all duration-500 ease-out ${
                    isOpen
                        ? "opacity-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 translate-y-8 pointer-events-none"
                }`}
            >
                <div className="w-[340px] md:w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
                    style={{ height: "520px" }}>

                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#800000] to-[#B08D57] px-5 py-4 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
                                🌸
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">Shyamala</p>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    <p className="text-white/80 text-xs">Saree Assistant · Online</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <a
                                href="https://wa.me/919440653443"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors"
                                title="Chat on WhatsApp"
                            >
                                <Phone size={14} className="text-white" />
                            </a>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                            >
                                <X size={16} className="text-white" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-[#FAF7F2]">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                {msg.role === "assistant" && (
                                    <div className="w-7 h-7 rounded-full bg-[#800000]/10 flex items-center justify-center mr-2 flex-shrink-0 mt-1 text-sm">
                                        🌸
                                    </div>
                                )}
                                <div
                                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                        msg.role === "user"
                                            ? "bg-[#800000] text-white rounded-br-sm"
                                            : "bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100"
                                    }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="w-7 h-7 rounded-full bg-[#800000]/10 flex items-center justify-center mr-2 text-sm">🌸</div>
                                <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm">
                                    <div className="flex gap-1.5 items-center h-4">
                                        <span className="w-2 h-2 bg-[#B08D57] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                                        <span className="w-2 h-2 bg-[#B08D57] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                                        <span className="w-2 h-2 bg-[#B08D57] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggestions (show only at start) */}
                    {messages.length === 1 && (
                        <div className="px-3 py-2 flex gap-2 overflow-x-auto flex-shrink-0 bg-white border-t border-gray-100 scrollbar-hide">
                            {SUGGESTED_QUESTIONS.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => sendMessage(q)}
                                    className="flex-shrink-0 text-xs bg-[#800000]/5 hover:bg-[#800000]/10 text-[#800000] border border-[#800000]/20 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="px-4 py-3 bg-white border-t border-gray-100 flex-shrink-0">
                        <div className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2 border border-gray-200 focus-within:border-[#800000] transition-colors">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                placeholder="Ask about sarees..."
                                className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder:text-gray-400"
                            />
                            <button
                                onClick={() => sendMessage()}
                                disabled={!input.trim() || isLoading}
                                className="w-8 h-8 bg-[#800000] hover:bg-[#600000] disabled:bg-gray-300 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                            >
                                <Send size={14} className="text-white" />
                            </button>
                        </div>
                        <p className="text-center text-[10px] text-gray-400 mt-2">
                            Powered by AI · <a href="https://wa.me/919440653443" className="underline hover:text-[#800000]">Order on WhatsApp</a>
                        </p>
                    </div>
                </div>
            </div>

            {/* Floating Button */}
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                className="fixed bottom-6 right-4 md:right-6 z-50 w-14 h-14 bg-gradient-to-br from-[#800000] to-[#B08D57] hover:scale-110 active:scale-95 text-white rounded-full shadow-lg shadow-[#800000]/30 flex items-center justify-center transition-all duration-300"
                aria-label="Open chat"
            >
                {isOpen ? (
                    <X size={22} />
                ) : (
                    <MessageCircle size={22} />
                )}

                {/* Notification dot */}
                {!isOpen && hasNewMessage && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-[10px] font-bold animate-bounce">
                        1
                    </span>
                )}
            </button>
        </>
    );
}
