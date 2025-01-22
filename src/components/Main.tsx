"use client"

import { useState, useRef } from "react";
import axios from "axios";
import { FaTurnUp } from "react-icons/fa6";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "./ui/textarea";
import useTweet from "@/hooks/useTweet";
import Result from "./Result";
import useResult from "@/hooks/useResult";
import { HiStop } from "react-icons/hi2";
import { toast } from "sonner";

export default function Main() {
    const [improvePrompt, setImprovePrompt] = useState('');
    const [isImprovingField, setIsImprovingField] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const moodRef = useRef('Casual');
    const actionRef = useRef('Formatting');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { tweet, setTweet } = useTweet();
    const { result, setResult } = useResult();

    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const response = await axios.post('/api/generate', { tweet, mood: moodRef.current, action: actionRef.current });
            setResult(response.data.message);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Error refining tweet')
        } finally {
            setIsGenerating(false);
        }
    }

    const handleRegenerate = async () => {
        if (!isImprovingField && !improvePrompt) {
            setIsImprovingField(true);
            return;
        };
        if (isImprovingField && !improvePrompt) {
            setIsImprovingField(false);
            return;
        }
        setIsGenerating(true);
        try {
            const response = await axios.post('/api/improve', { result, mood: moodRef.current, action: actionRef.current, improvePrompt, tweet });
            setResult(response.data.message);
            setImprovePrompt('');
            setIsImprovingField(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Error improving response')
        } finally {
            setIsGenerating(false);
        }
    }

    const copyToClipboard = () => {
        if (!result) return;
        navigator.clipboard.writeText(result);
        toast.success('Text copied to clipboard')
    };

    return (
        <main className="max-sm:w-full max-sm:px-2">
            <div className="w-[60vw] max-lg:w-[80vw] max-sm:w-full relative pt-6 pb-2 px-4 rounded-xl dark:border-white/20 border-black/40 bg-white bg-opacity-10 backdrop-blur-xl border flex flex-col items-center justify-center dark:shadow-none shadow-none z-50">
                <Textarea
                    ref={textareaRef}
                    value={tweet}
                    onChange={(e) => {
                        setTweet(e.target.value);
                        adjustTextareaHeight();
                    }}
                    placeholder="Paste your tweet"
                    className="h-fit dark:text-white shadow-none w-full bg-transparent focus:outline-none focus:border-none max-h-[300px] max-sm:text-xs"
                    rows={1}
                />

                <div className="flex justify-between items-end w-full mt-6">
                    <div className="flex gap-3">
                        <div>
                            <Select onValueChange={(value: string) => {
                                moodRef.current = value;
                            }}>
                                <SelectTrigger className="w-[95px] max-sm:w-[85px] max-sm:text-[10px] bg-gray-200/30 dark:bg-black/5 dark:hover:bg-white/5 transition-all duration-300 text-xs rounded-lg before:bg-opacity-90 backdrop-blur-lg border hover:bg-black/5 border-gray-400/50 dark:border-white/20 dark:text-white p-2">
                                    <SelectValue placeholder="Casual" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">Funny</SelectItem>
                                    <SelectItem value="Serious">Serious</SelectItem>
                                    <SelectItem value="Casual">Casual</SelectItem>
                                    <SelectItem value="Formal">Formal</SelectItem>
                                    <SelectItem value="Humorous">Humorous</SelectItem>
                                    <SelectItem value="Sarcastic">Sarcastic</SelectItem>
                                </SelectContent>
                            </Select>

                        </div>
                        <div>
                            <Select onValueChange={(value: string) => {
                                actionRef.current = value;
                            }}>
                                <SelectTrigger className="w-[100px] max-sm:w-[90px] max-sm:text-[10px] bg-gray-200/30 dark:bg-black/5 dark:hover:bg-white/5 hover:bg-black/5 transition-all duration-300 text-xs rounded-lg before:bg-opacity-5 backdrop-blur-lg border border-gray-400/50 dark:border-white/20 dark:text-white p-2">
                                    <SelectValue placeholder="Formatting" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Formatting">Formatting</SelectItem>
                                    <SelectItem value="Improving">Improving</SelectItem>
                                    <SelectItem value="Correcting">Correcting</SelectItem>
                                </SelectContent>
                            </Select>

                        </div>
                    </div>
                    <div>
                        <button className="bg-gray-200/30 dark:bg-black/5 rounded-lg before:bg-opacity-5 dark:hover:bg-white/5 hover:bg-black/5 backdrop-blur-lg border border-gray-400/50 dark:border-white/20 dark:text-white p-2" onClick={handleGenerate}>
                            {isGenerating ? <HiStop className="text-xs animate-pulse" /> : <FaTurnUp className="text-xs" />}
                        </button>
                    </div>
                </div>
            </div>
            <Result improvePrompt={improvePrompt} isImprovingField={isImprovingField} setImprovePrompt={setImprovePrompt} handleRegenerate={handleRegenerate} copyToClipboard={copyToClipboard} />
        </main>
    )
}