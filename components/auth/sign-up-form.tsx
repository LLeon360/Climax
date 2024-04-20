'use client';

import * as React from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FC, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "reactfire";
import { createUserFirestoreDocument } from "@/app/api/FirebaseAuth";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

interface SignUpFormProps {
  onShowLogin: () => void;
  onSignUp?: () => void;
}

export const SignUpForm: FC<SignUpFormProps> = ({ onShowLogin, onSignUp }) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });

  const auth = useAuth();

  const signup = async ({ email, password, firstName, lastName }: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      const user = await createUserWithEmailAndPassword(auth, email, password);
      const fullName = firstName + " " + lastName;
      if (user?.user.uid && user.user.email) {
        //IMPORTANT, we need to let the user submit a pfp somewhere if they use photoURL
        await createUserFirestoreDocument(user.user.uid, fullName, user.user.email, user.user.photoURL);
        toast({ title: "Account created!" });
        onSignUp?.();
      }
    } catch (err: any) {
      if ("code" in err && err.code.includes("already")) {
        toast({ title: "User already exists" });
      } else {
        toast({ title: "Error signing up", description: `${err}` });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(signup)}>
          <fieldset disabled={isLoading} className="space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormDescription>
                    A valid email is required to watch locked specials.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormDescription>
                    Must be at least 8 characters long.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Sign Up</Button>
          </fieldset>
        </form>
      </Form>

      <p className="mt-4 text-sm">
        Already joined?{" "}
        <Button variant="link" onClick={onShowLogin}>
          Sign in instead.
        </Button>
      </p>
    </>
  );
};
