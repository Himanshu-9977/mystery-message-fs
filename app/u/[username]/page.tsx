"use client"

import React, { useState } from "react"
import axios from "axios"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { useParams } from "next/navigation"
import { messageSchema } from "@/schemas/messageSchema"
import { ApiResponse } from "@/types/ApiResponse"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"

const specialChar = "||"

const parseStringMessages = (messageString: string): string[] => {
  return messageString.split(specialChar)
}

export default function MessagePage() {
  const params = useParams<{ username: string }>()
  const username = params.username

  const [suggestedMessages, setSuggestedMessages] = useState<string[]>([
    "What's your favorite movie?",
    "Do you have any pets?",
    "What's your dream job?"
  ])
  const [isSuggestLoading, setIsSuggestLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { toast } = useToast()

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  })

  const messageContent = form.watch("content")

  const handleMessageClick = (message: string) => {
    form.setValue("content", message)
  }

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    try {
      const response = await axios.post<ApiResponse>("/api/send-message", {
        username,
        ...data,
      })

      toast({
        title: response.data.message,
        variant: "default",
      })

      form.reset({ ...form.getValues(), content: "" })
    } catch (error) {
      const axiosError = error as any
      toast({
        title: "Error",
        description: axiosError.response?.data.message ?? "Failed to send message",
        variant: "destructive",
      })
    }
  }

  const fetchSuggestedMessages = async () => {
    setIsSuggestLoading(true)
    setError(null)
    try {
      const res = await axios.post("/api/suggest-messages")

      if (!res.data.success) {
        throw new Error("Failed to fetch messages")
      }

      setSuggestedMessages(parseStringMessages(res.data.data))
    } catch (error) {
      setError("An error occurred while fetching suggested messages.")
    } finally {
      setIsSuggestLoading(false)
    }
  }

  return (
    <Card className="max-w-4xl mx-auto my-8">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center">Send Anonymous Message</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message for @{username}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your anonymous message here"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={!messageContent || form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </Form>

        <Separator className="my-6" />

        <div className="space-y-4">
          <Button
            onClick={fetchSuggestedMessages}
            disabled={isSuggestLoading}
          >
            {isSuggestLoading ? "Fetching..." : "Suggest Messages"}
          </Button>

          {error ? (
            <p className="text-destructive">{error}</p>
          ) : (
            <div className="space-y-2">
              {isSuggestLoading ? (
                Array(3).fill(0).map((_, index) => (
                  <Skeleton key={index} className="w-full h-10" />
                ))
              ) : (
                suggestedMessages.map((message, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full text-left"
                    onClick={() => handleMessageClick(message)}
                  >
                    {message}
                  </Button>
                ))
              )}
            </div>
          )}
        </div>

        <Separator className="my-6" />

        <div className="text-center">
          <p className="mb-4">Get Your Message Board</p>
          <Link href="/sign-up">
            <Button>Create Your Account</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}