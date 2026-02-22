import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useGetConversation, useSendMessage, useGetOnlineStatus } from '../hooks/useChat';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Principal } from '@dfinity/principal';
import { Skeleton } from '@/components/ui/skeleton';

export default function ChatScreen() {
    const navigate = useNavigate();
    const { userId } = useParams({ strict: false });
    const { identity } = useInternetIdentity();
    const [message, setMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const otherUserPrincipal = userId ? Principal.fromText(userId) : null;
    const { data: conversation, isLoading } = useGetConversation(otherUserPrincipal);
    const { data: isOnline } = useGetOnlineStatus(otherUserPrincipal);
    const sendMessage = useSendMessage();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation]);

    const handleSendMessage = async () => {
        if (!message.trim() || !otherUserPrincipal) return;

        try {
            await sendMessage.mutateAsync({
                receiverId: otherUserPrincipal,
                content: message.trim(),
            });
            setMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleEmojiClick = (emoji: string) => {
        setMessage((prev) => prev + emoji);
    };

    const quickEmojis = ['🔥', '💀', '⛓️', '🩸'];

    return (
        <div className="fixed inset-0 bg-background pt-14 pb-16 flex flex-col">
            {/* Header */}
            <div className="h-16 bg-[#1a1a1a] border-b border-[#DC143C]/20 flex items-center gap-4 px-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate({ to: '/chat' })}
                    className="hover:bg-[#DC143C]/10"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>

                <Avatar className="h-10 w-10 border-2 border-[#00FFFF]/30">
                    <AvatarFallback className="bg-[#DC143C]/20 text-[#DC143C]">
                        U
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                    <p className="font-semibold text-foreground">User</p>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                            {isOnline ? 'Online' : 'In the fight'}
                        </span>
                        <img
                            src="/assets/generated/dragon-icon-small.dim_32x32.png"
                            alt="Dragon"
                            className="h-4 w-4"
                        />
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div
                className="flex-1 overflow-y-auto p-4 space-y-4"
                style={{
                    backgroundImage: 'url(/assets/generated/dragon-scale-texture.dim_512x512.png)',
                    backgroundRepeat: 'repeat',
                    backgroundSize: '256px',
                    opacity: 0.95,
                }}
            >
                {isLoading && (
                    <>
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-16 w-3/4" />
                        ))}
                    </>
                )}

                {conversation?.map((msg) => {
                    const isOwn = msg.senderId.toString() === identity?.getPrincipal().toString();
                    return (
                        <div
                            key={msg.id}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                                    isOwn
                                        ? 'bg-[#DC143C] text-white rounded-br-none'
                                        : 'bg-[#a8a8a8] text-black rounded-tl-none'
                                }`}
                            >
                                <p className="text-sm">{msg.content}</p>
                                <p className="text-xs opacity-70 mt-1">
                                    {new Date(Number(msg.timestamp) / 1_000_000).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="bg-[#1a1a1a] border-t border-[#DC143C]/20 p-4 space-y-2">
                {/* Quick Emojis */}
                <div className="flex gap-2 justify-center">
                    {quickEmojis.map((emoji) => (
                        <Button
                            key={emoji}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEmojiClick(emoji)}
                            className="text-xl hover:bg-[#00FFFF]/10"
                        >
                            {emoji}
                        </Button>
                    ))}
                </div>

                {/* Input Field */}
                <div className="flex gap-2">
                    <Input
                        type="text"
                        placeholder="Type your punch..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        className="flex-1 bg-background/50 border-[#DC143C]/30 focus:border-[#00FFFF]"
                    />
                    <Button
                        onClick={handleSendMessage}
                        disabled={!message.trim() || sendMessage.isPending}
                        size="icon"
                        className="bg-[#00FFFF] hover:bg-[#00FFFF]/90 text-black"
                    >
                        <img
                            src="/assets/generated/dragon-claw-send.dim_24x24.png"
                            alt="Send"
                            className="h-5 w-5"
                        />
                    </Button>
                </div>
            </div>
        </div>
    );
}
