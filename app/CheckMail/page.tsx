"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function CheckMail() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Check Your Email</CardTitle>
          <CardDescription className="text-center">
            We've sent you a verification link
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex justify-center">
            <svg
              className="w-24 h-24 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              We've sent a verification email to your inbox. Please check your email and click the verification link to activate your account.
            </p>
            <p className="text-xs text-gray-500">
              Didn't receive the email? Check your spam folder.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Link href="/Login" className="w-full">
            <Button variant="outline" className="w-full">
              Return to Login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}