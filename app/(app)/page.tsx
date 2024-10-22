"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Autoplay from "embla-carousel-autoplay"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { Skeleton } from "@/components/ui/skeleton"
import messages from '@/messages.json'

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000) // Show skeleton for 2 seconds

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-grow flex flex-col items-center justify-center px-4 md:px-24 py-12">
        <section className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Dive into the World of Anonymous Feedback
          </h1>
          <p className="mt-3 md:mt-4 text-lg text-muted-foreground">
            True Feedback - Where your identity remains a secret.
          </p>
        </section>

        <Carousel
          plugins={[Autoplay({ delay: 3000 })]}
          className="w-full max-w-lg md:max-w-xl"
        >
          <CarouselContent>
            {isLoading
              ? Array(3).fill(0).map((_, index) => (
                  <CarouselItem key={index} className="p-4">
                    <Card>
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                      </CardHeader>
                      <CardContent className="flex flex-col md:flex-row items-start space-y-2 md:space-y-0 md:space-x-4">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <div className="w-full">
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2 mt-2" />
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))
              : messages.map((message: any, index: number) => (
                  <CarouselItem key={index} className="p-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>{message.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col md:flex-row items-start space-y-2 md:space-y-0 md:space-x-4">
                        <Mail className="flex-shrink-0 text-primary" />
                        <div>
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {message.received}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
          </CarouselContent>
        </Carousel>

        <div className="mt-8 md:mt-12">
          <Link href="/sign-up">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Get Started
            </Button>
          </Link>
        </div>
      </main>

      <footer className="text-center p-4 md:p-6 bg-secondary text-secondary-foreground">
        © 2024 True Feedback. All rights reserved.
      </footer>
    </div>
  )
}