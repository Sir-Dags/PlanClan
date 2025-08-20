
'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Icons } from "@/components/icons";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

export default function SignInPage() {
  const { signInWithGoogle, signInWithFacebook, signInWithMicrosoft, signUpWithEmail, signInWithEmail } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isSigningIn, setIsSigningIn] = React.useState(false);
  const { toast } = useToast();


  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);
    try {
      await signUpWithEmail(email, password);
      // Let the redirect handle it
    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Sign-up failed",
        description: error.message,
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);
    try {
      await signInWithEmail(email, password);
      // Let the redirect handle it
    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Sign-in failed",
        description: error.message,
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleOAuthSignIn = async (provider: () => Promise<void>) => {
    setIsSigningIn(true);
    try {
      await provider();
    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Sign-in failed",
        description: error.message,
      });
    } finally {
      setIsSigningIn(false);
    }
  }


  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Tabs defaultValue="signin" className="w-full max-w-md">
        <div className="text-center mb-6">
            <div className="flex justify-center items-center gap-2 mb-2">
                <Icons.Logo className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold font-headline">PlanClan</h1>
            </div>
            <p className="text-muted-foreground">Your clan's shared calendar, simplified.</p>
        </div>
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="signin">
            <Card>
                <CardHeader>
                    <CardTitle>Sign In</CardTitle>
                    <CardDescription>
                    Welcome back! Sign in to access your calendar.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleEmailSignIn}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="signin-email">Email</Label>
                            <Input id="signin-email" type="email" placeholder="m@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="signin-password">Password</Label>
                            <Input id="signin-password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col gap-4">
                        <Button className="w-full" type="submit" disabled={isSigningIn}>
                            {isSigningIn ? 'Signing In...' : 'Sign In'}
                        </Button>
                        <div className="relative w-full my-4">
                          <Separator className="absolute top-1/2 -translate-y-1/2" />
                          <span className="relative bg-card px-2 text-xs text-muted-foreground z-10 flex justify-center">OR CONTINUE WITH</span>
                        </div>
                         <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-2">
                            <Button variant="outline" className="w-full" onClick={() => handleOAuthSignIn(signInWithGoogle)} type="button" disabled={isSigningIn}><Icons.Google className="mr-2 h-4 w-4" /> Google</Button>
                            <Button variant="outline" className="w-full" onClick={() => handleOAuthSignIn(signInWithFacebook)} type="button" disabled={isSigningIn}><Icons.Facebook className="mr-2 h-4 w-4" /> Facebook</Button>
                            <Button variant="outline" className="w-full" onClick={() => handleOAuthSignIn(signInWithMicrosoft)} type="button" disabled={isSigningIn}><Icons.Microsoft className="mr-2 h-4 w-4" /> Microsoft</Button>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </TabsContent>
        <TabsContent value="signup">
            <Card>
                <CardHeader>
                    <CardTitle>Sign Up</CardTitle>
                    <CardDescription>
                    Create an account to start planning with your clan.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleEmailSignUp}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="signup-email">Email</Label>
                            <Input id="signup-email" type="email" placeholder="m@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="signup-password">Password</Label>
                            <Input id="signup-password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col gap-4">
                        <Button className="w-full" type="submit" disabled={isSigningIn}>
                            {isSigningIn ? 'Creating Account...' : 'Create Account'}
                        </Button>
                        <div className="relative w-full my-4">
                          <Separator className="absolute top-1/2 -translate-y-1/2" />
                          <span className="relative bg-card px-2 text-xs text-muted-foreground z-10 flex justify-center">OR CONTINUE WITH</span>
                        </div>
                        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-2">
                           <Button variant="outline" className="w-full" onClick={() => handleOAuthSignIn(signInWithGoogle)} type="button" disabled={isSigningIn}><Icons.Google className="mr-2 h-4 w-4" /> Google</Button>
                           <Button variant="outline" className="w-full" onClick={() => handleOAuthSignIn(signInWithFacebook)} type="button" disabled={isSigningIn}><Icons.Facebook className="mr-2 h-4 w-4" /> Facebook</Button>
                           <Button variant="outline" className="w-full" onClick={() => handleOAuthSignIn(signInWithMicrosoft)} type="button" disabled={isSigningIn}><Icons.Microsoft className="mr-2 h-4 w-4" /> Microsoft</Button>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </TabsContent>
        </Tabs>
    </div>
  );
}
