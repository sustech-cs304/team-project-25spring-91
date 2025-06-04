// src/components/auth/sign-up-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth-context";
import axios from "axios";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

export enum UserRole {
  REGULAR_USER = "user",
  GYM_OWNER = "gym_owner",
  ADMIN = "admin"
}

export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { loginWithOAuth, signUp } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<UserRole>(UserRole.REGULAR_USER);


  const handleOAuthSignIn = (provider: 'github' | 'microsoft') => {
    setIsLoading(true);
    try {
      loginWithOAuth(provider);
      // No need for success toast here as we're redirecting
    } catch (error) {
      setIsLoading(false);
      toast.error(`${provider} login failed`, {
        description: error instanceof Error ? error.message : "Something went wrong"
      });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const trimPassword = password.trim();
      const trimConfirmPassword = confirmPassword.trim();

      if (trimPassword != trimConfirmPassword) {
        toast.error("Password does not match the confirmed password");
        return;
      }

      await signUp(email, password, displayName, role);

      toast.success("Sign up successful!", {
        description: "Welcome! Your account has been created." 
      });

      router.push('/dashboard/statistics');
      // router.push('/dashboard');

    } catch (error) {
      let errorMessage = 'Failed to sign up';

      if (axios.isAxiosError(error) && error.response && error.response.data) {

          errorMessage = error.response.data.message || errorMessage;
      } else if (error instanceof Error) {
          errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Sign Up</CardTitle>
        <CardDescription>Create a new account to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="displayName" className="text-sm font-medium">
              Display Name
            </label>
            <Input
              id="displayName"
              type="text"
              placeholder="Jakeman"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="confirm-password" className="text-sm font-medium">
              Confirm Password
            </label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Select Your Role</Label>
            <RadioGroup
              defaultValue={UserRole.REGULAR_USER}
              onValueChange={(value) => setRole(value as UserRole)}
              className="flex pt-2 space-x-4"
              disabled={isLoading}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value={UserRole.REGULAR_USER}
                  id="role-regular"
                />
                <Label htmlFor="role-regular" className="font-normal">
                  Regular User
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value={UserRole.GYM_OWNER}
                  id="role-gym-owner"
                />
                <Label htmlFor="role-gym-owner" className="font-normal">
                  Gym Owner
                </Label>
              </div>
            </RadioGroup>
          </div>


          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOAuthSignIn('microsoft')}
              disabled={isLoading}
              className="flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 21 21">
                <title>Microsoft</title>
                <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
              </svg>
              Microsoft
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOAuthSignIn('github')}
              disabled={isLoading}
              className="flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.417 22 12c0-5.523-4.477-10-10-10z"
                  fill="currentColor"
                />
              </svg>
              GitHub
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Button
            variant="link"
            className="p-0 h-auto"
            onClick={() => router.push("/sign-in")}
          >
            Sign in
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
} 