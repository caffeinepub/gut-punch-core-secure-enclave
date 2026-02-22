import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileText, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function SafeDraftScreen() {
    const [draftText, setDraftText] = useState('');

    const handleSave = () => {
        if (!draftText.trim()) {
            toast.error('Nothing to save');
            return;
        }
        
        // Save to localStorage
        localStorage.setItem('foreverraw-safe-draft', draftText);
        toast.success('Draft saved securely');
    };

    return (
        <div className="min-h-screen p-8 pt-24">
            <div className="container max-w-4xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-5xl font-bold text-primary blood-glow mb-4 font-display">
                        Safe Draft
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        Write without fear. The Dragon guards your words.
                    </p>
                </div>

                <Card className="dragon-scales border-primary/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-primary">
                            <FileText className="h-6 w-6" />
                            Your Private Space
                        </CardTitle>
                        <CardDescription>
                            Draft messages safely before sending. No filters. No games.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Textarea
                            placeholder="Write your truth here..."
                            value={draftText}
                            onChange={(e) => setDraftText(e.target.value)}
                            className="min-h-[400px] bg-background/50 border-primary/30 text-lg"
                        />
                        
                        <Button
                            onClick={handleSave}
                            className="w-full h-14 text-lg font-bold forged-metal border-2 border-primary hover:shadow-blood"
                        >
                            <Save className="h-5 w-5 mr-2" />
                            SAVE DRAFT
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
