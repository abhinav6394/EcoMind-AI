"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Input,
  Label,
  LabelInputContainer,
} from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Error } from "@/components/ui/error";
import { Separator } from "@/components/ui/separator";
import { IconBrandGithub, IconBrandGoogle } from "@tabler/icons-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import { toast } from "sonner";
import { BottomGradient } from "@/components/ui/bottom-gradient";

// Updated schema for sign up (you might want to add confirm password or name in real usage)
const signupFormValues = z.object({
  email: z.string().email("Please enter a correct mail address"),
  password: z
    .string()
    .min(1, "Password is required")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
      "Password must have at least one lowercase letter, one uppercase letter, one number, and one special character.",
    ),
});

// Helper for the signup form input keys
const formFields = ["email", "password"];

export default function SignupForm() {
  const signupFormInputs = {
    email: {
      required: "please enter your email",
      type: "email",
      pattern: null,
      placeholder: "Enter your email",
    },
    password: {
      required: "please enter your password",
      type: "password",
      placeholder: "********",
    },
  };

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(signupFormValues),
  });

  const onSubmit = async (data) => {
    const toastId = toast.loading("Signing up");
    await authClient.signUp.email(
      {
        email: data.email,
        password: data.password,
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          toast.dismiss(toastId);
          toast.info("Signed up successfully, redirecting");
        },
        onError: (err) => {
          toast.dismiss(toastId);
          const errorMessage =
            (err && err.error && err.error.message) ||
            "Something went wrong";
          toast.error(errorMessage);
        },
      }
    );
  };

  const handleGithubAuth = async (mode) => {
    const toastId = toast.loading(
      mode === "signup"
        ? "Signing up with Github"
        : "Logging in with Github"
    );
    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/workflows",
        fetchOptions: {
          onResponse: () => {
            toast.dismiss(toastId);
            toast.success(
              mode === "signup"
                ? "Signed up successfully with Github"
                : "Logged in successfully with Github"
            );
          },
        },
      });
    } catch (_err) {
      toast.dismiss(toastId);
      toast.error("Authentication failed.");
    }
  };

  const handleGoogleAuth = async (mode) => {
    const toastId = toast.loading(
      mode === "signup"
        ? "Signing up with Google"
        : "Logging in with Google"
    );
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/workflows",
        fetchOptions: {
          onResponse: () => {
            toast.dismiss(toastId);
            toast.success(
              mode === "signup"
                ? "Signed up successfully with Google"
                : "Logged in successfully with Google"
            );
          },
        },
      });
    } catch (_err) {
      toast.dismiss(toastId);
      toast.error("Authentication failed.");
    }
  };

  const isPending = form.formState.isSubmitting;

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="text-center">
        <Image
          src="/logo.png"
          height={80}
          width={140}
          alt="logo"
          className="mx-auto"
        />
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Enter your email and password to sign up for an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-2 space-y-8">
          {Object.entries(signupFormInputs).map(([key, value]) => (
            <LabelInputContainer key={key}>
              <Label>{key.toLocaleUpperCase()}</Label>
              <Error
                enabled={
                  !!(
                    form.formState.errors &&
                    form.formState.errors[key]
                  )
                }
              >
                {form.formState.errors &&
                  form.formState.errors[key] &&
                  form.formState.errors[key].message}
              </Error>
              <Input
                {...form.register(key)}
                type={value.type}
                autoComplete={key}
                placeholder={value.placeholder}
                className="placeholder:text-neutral-500"
              />
            </LabelInputContainer>
          ))}
          <Button
            type="submit"
            disabled={isPending}
            className="bg-primary group/btn w-full cursor-pointer text-white disabled:opacity-50"
          >
            Sign Up
            <BottomGradient />
          </Button>
          <div className="text-center text-sm">
            Already have an account?
            <Link href="/login" className="ml-1 text-blue-500 underline">
              Sign In
            </Link>
          </div>
        </form>
        <Separator className="my-4" />
        <CardFooter className="flex flex-col gap-4 px-0">
          <Button
            disabled={isPending}
            className="group/btn bg-secondary text-secondary-foreground flex w-full cursor-pointer"
            onClick={() => handleGithubAuth("signup")}
            type="button"
          >
            <IconBrandGithub /> Sign Up With Github
            <BottomGradient />
          </Button>

          <Button
            disabled={isPending}
            onClick={() => handleGoogleAuth("signup")}
            className="group/btn bg-primary flex w-full cursor-pointer text-white"
          >
            <IconBrandGoogle /> Continue With Google
            <BottomGradient />
          </Button>
        </CardFooter>
      </CardContent>
    </Card>
  );
}