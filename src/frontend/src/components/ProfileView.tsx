import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { useGetUserPunches, useDeletePunch } from '../hooks/usePunches';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, User, LogOut, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import PunchCard from './PunchCard';

export default function ProfileView() {
    const { identity, clear } = useInternetIdentity();
    const { data: profile, isLoading: profileLoading } = useGetCallerUserProfile();
    const saveProfile = useSaveCallerUserProfile();
    const { data: userPunches, isLoading: punchesLoading } = useGetUserPunches();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editName, setEditName] = useState('');

    const isAuthenticated = !!identity;

    const handleLogout = async () => {
        await clear();
        queryClient.clear();
        navigate({ to: '/' });
        toast.success('Logged out');
    };

    const handleSaveProfile = async () => {
        if (!editName.trim()) {
            toast.error('Name cannot be empty');
            return;
        }

        try {
            await saveProfile.mutateAsync({ name: editName.trim() });
            setIsEditOpen(false);
            toast.success('Profile updated');
        } catch (error) {
            toast.error('Failed to update profile');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8">
                <Card className="max-w-md dragon-scales border-primary/30">
                    <CardHeader>
                        <CardTitle className="text-primary">Login Required</CardTitle>
                        <CardDescription>
                            You must be logged in to view your profile
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    if (profileLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const userName = profile?.name || 'Anonymous';
    const punchCount = userPunches?.length || 0;

    return (
        <div className="min-h-screen p-8 pt-24">
            <div className="container max-w-4xl mx-auto">
                {/* Profile Header */}
                <Card className="mb-8 dragon-scales border-primary/30">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-6">
                            <Avatar className="h-24 w-24 border-2 border-primary">
                                <AvatarFallback className="bg-primary/20 text-primary text-3xl font-bold">
                                    {userName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-primary font-display">{userName}</h1>
                                <p className="text-muted-foreground">
                                    {punchCount} {punchCount === 1 ? 'Punch' : 'Punches'}
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    No filters. No games.
                                </p>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="border-primary/30 hover:bg-primary/10"
                                            onClick={() => setEditName(userName)}
                                        >
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit Profile
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="dragon-scales border-primary/30">
                                        <DialogHeader>
                                            <DialogTitle className="text-primary">Edit Profile</DialogTitle>
                                            <DialogDescription>
                                                Update your display name
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="name">Name</Label>
                                                <Input
                                                    id="name"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="bg-background/50 border-primary/30"
                                                />
                                            </div>
                                            <Button
                                                onClick={handleSaveProfile}
                                                disabled={saveProfile.isPending}
                                                className="w-full forged-metal border-2 border-primary"
                                            >
                                                {saveProfile.isPending ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    'Save Changes'
                                                )}
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>

                                <Button
                                    onClick={handleLogout}
                                    variant="outline"
                                    className="border-destructive/30 hover:bg-destructive/10 text-destructive"
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Logout
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* User's Punches */}
                <div>
                    <h2 className="text-2xl font-bold text-primary mb-4 font-display">Your Punches</h2>
                    {punchesLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : userPunches && userPunches.length > 0 ? (
                        <div className="space-y-4">
                            {userPunches.map((punch) => (
                                <PunchCard key={punch.id} punch={punch} />
                            ))}
                        </div>
                    ) : (
                        <Card className="dragon-scales border-primary/30">
                            <CardContent className="py-12 text-center">
                                <p className="text-muted-foreground">
                                    No punches yet. Punch through the bullshit.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
