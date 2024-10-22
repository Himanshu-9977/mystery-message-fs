"use client"; 

import React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User } from "next-auth";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { Separator } from "@radix-ui/react-separator";

const Navbar = () => {
  const { data: session } = useSession();
  const user: User = session?.user;

  const router = useRouter()

  const handlesignout = () => {
    router.replace("/")
    signOut()
  }

  return (
    <nav className="p-4 md:p-6 shadow-md bg-background text-foreground">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <a href="#" className="text-xl font-bold mb-4 md:mb-0">
          Mystery Message
        </a>
        {session ? (
          <>
            <span className="mr-4">Welcome, {user?.username || user?.email}{" "} </span>
            
              <Button
                onClick={handlesignout}
                className="w-full md:w-auto bg-slate-100 text-black"
                variant="outline"
                >
                Logout
              </Button>
  
          </>
        ) : (
          <Link href="/sign-in">
            <Button
              className="w-full md:w-auto"
              variant={"default"}
            >
              Login
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;