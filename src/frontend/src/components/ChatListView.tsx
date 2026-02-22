import { MessageCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function ChatListView() {
    return (
        <div className="min-h-screen bg-background pt-14">
            <div className="container max-w-4xl mx-auto px-4 py-8">
                <div className="flex items-center gap-3 mb-6">
                    <MessageCircle className="h-8 w-8 text-[#00FFFF]" />
                    <h1 className="text-3xl font-bold text-[#DC143C]">Messages</h1>
                </div>

                <Alert className="border-[#00FFFF]/30 bg-[#00FFFF]/5">
                    <AlertCircle className="h-4 w-4 text-[#00FFFF]" />
                    <AlertDescription>
                        Chat feature coming soon! Connect with other users and start conversations.
                    </AlertDescription>
                </Alert>

                <div className="mt-6 space-y-4">
                    <Card className="bg-[#1a1a1a] border-[#DC143C]/20 p-4">
                        <p className="text-center text-muted-foreground">
                            No conversations yet
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
}
