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
import { Input, Label, LabelInputContainer } from "@/components/ui/input";
// Removed Button import

import { Error } from "@/components/ui/error";
import { Separator } from "@/components/ui/separator";
import { IconBrandGithub, IconBrandGoogle } from "@tabler/icons-react";
import { toast } from "sonner";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
// Removed BottomGradient import

const loginformvalues = z.object({
  email: z.string().email("Please enter a correct mail address"),
  password: z
    .string()
    .min(1, "Password is required")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
      "Password must have at least one lowercase letter, one uppercase letter, one number, and one special character.",
    ),
});

// Helper for the login form input keys
const formFields = ["email", "password"];

export default function LoginForm() {
  const loginFormInputs = {
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
    resolver: zodResolver(loginformvalues),
  });

  const onSubmit = async (data) => {
    const toastId = toast.loading("Logging in");
    await authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          toast.dismiss(toastId);
          toast.info("Logged in successfully redirecting");
        },
        onError: (err) => {
          toast.dismiss(toastId);
          const errorMessage =
            (err && err.error && err.error.message) ||
            "something went wrong";
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
            toast.success("Logged in successfully redirecting");
          },
        },
      });
    } catch (err) {
      toast.dismiss(toastId);
      toast.error("Authentication failed.");
    }
  };

  const handleGoogleAuth = async (mode) => {
    const toastId = toast.loading(
      mode === "signup"
        ? "Signing up with Github"
        : "Logging in with google"
    );
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/workflows",
        fetchOptions: {
          onSuccess: () => {
            toast.dismiss(toastId);
            toast.success("Logged in successfully redirecting");
          },
          onError: (err) => {
            toast.dismiss(toastId);

            // Try to get a meaningful error message
            const errorMessage =
              (err && err.error && err.error.message) ||
              "something went wrong";
            toast.error(errorMessage);
          },
        },
      });
    } catch (err) {
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
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email and password to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-2 space-y-8">
          {Object.entries(loginFormInputs).map(([key, value]) => (
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
          <button
            type="submit"
            disabled={isPending}
            className="bg-primary group/btn w-full cursor-pointer text-white disabled:opacity-50 px-4 py-2 rounded"
          >
            Login
          </button>
          <div className="text-center text-sm">
            Don&apos;t have an account?
            <Link href={"/sign-up"} className="ml-1 text-blue-500 underline">
              Sign Up
            </Link>
          </div>
        </form>
        <Separator className="my-4" />
        <CardFooter className="flex flex-col gap-4 px-0">
          <button
            disabled={isPending}
            className="group/btn bg-secondary text-secondary-foreground flex w-full cursor-pointer px-4 py-2 rounded items-center justify-center gap-2"
            onClick={() => handleGithubAuth("login")}
            type="button"
          >
            <IconBrandGithub /> Login With Github
          </button>

          <button
            disabled={isPending}
            onClick={() => handleGoogleAuth("login")}
            className="group/btn bg-primary flex w-full cursor-pointer text-white px-4 py-2 rounded items-center justify-center gap-2"
            type="button"
          >
            <IconBrandGoogle /> Continue With Google
          </button>
        </CardFooter>
      </CardContent>
    </Card>
  );
}