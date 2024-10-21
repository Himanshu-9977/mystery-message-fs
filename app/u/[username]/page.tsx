"use client";

import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { useParams } from "next/navigation";
import { messageSchema } from "@/schemas/messageSchema";
import { ApiResponse } from "@/types/ApiResponse";

const specialChar = "||";

const parseStringMessages = (messageString: string): string[] => {
  return messageString.split(specialChar);
};

export default function Message_page() {
  const params = useParams<{ username: string }>();
  const username = params.username;

  const [suggestedMessages, setSuggestedMessages] = useState<string[]>([
    "What's your favorite movie?", 
    "Do you have any pets?", 
    "What's your dream job?"
  ]);
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  });

  const messageContent = form.watch("content");

  const handleMessageClick = (message: string) => {
    form.setValue("content", message);
  };

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    try {
      const response = await axios.post<ApiResponse>("/api/send-message", {
        username,
        ...data,
      });

      toast({
        title: response.data.message,
        variant: "default",
      });

      form.reset({ ...form.getValues(), content: "" });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message ?? "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const fetchSuggestedMessages = async () => {
    setIsSuggestLoading(true);
    setError(null);
    try {
      const res = await axios.post("/api/suggest-messages");

      if (!res.data.success) {
        throw new Error("Failed to fetch messages");
      }

      setSuggestedMessages(parseStringMessages(res.data.data));
    } catch (error) {
      setError("An error occurred while fetching suggested messages.");
    } finally {
      setIsSuggestLoading(false);
    }
  };

  return (
    <div className="container mx-auto my-8 p-6 bg-white rounded max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Public Profile Link
      </h1>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="message">Send Anonymous Message to @{username}</label>
          <textarea
            id="message"
            placeholder="Write your anonymous message here"
            className="w-full p-2 border rounded resize-none"
            {...form.register("content")}
          />
          <p className="text-sm text-red-600">
            {form.formState.errors.content?.message}
          </p>
        </div>

        <div className="flex justify-center">
          <Button type="submit" disabled={!messageContent}>
            {form.formState.isSubmitting ? "Sending..." : "Send Message"}
          </Button>
        </div>
      </form>

      <div className="my-8">
        <Button
          onClick={fetchSuggestedMessages}
          className="mb-4"
          disabled={isSuggestLoading}
        >
          {isSuggestLoading ? "Fetching..." : "Suggest Messages"}
        </Button>

        {error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          suggestedMessages.map((message, index) => (
            <Button
              key={index}
              variant="outline"
              className="block w-full text-left mb-2"
              onClick={() => handleMessageClick(message)}
            >
              {message}
            </Button>
          ))
        )}
      </div>

      <Separator className="my-6" />

      <div className="text-center">
        <div className="mb-4">Get Your Message Board</div>
        <Link href={"/sign-up"}>
          <Button>Create Your Account</Button>
        </Link>
      </div>
    </div>
  );
}
