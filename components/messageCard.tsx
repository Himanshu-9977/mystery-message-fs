"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Message } from "@/models/User";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { ApiResponse } from "@/types/ApiResponse";

type MessageCardProps = {
  message: Message;
  onMessageDelete: (messageId: string) => void;
}

const MessageCard = ({ message, onMessageDelete }: MessageCardProps) => {

  // console.log("message hai -> ", message);

  const { toast } = useToast();
  const date = new Date(message.createdAt)
  const formattedDate = date.toDateString()


  const handleDeleteConfirm = async () => {

    const message_id = message.createdAt.toString();
    const response = await axios.delete<ApiResponse>(`/api/delete-message/${message_id}`);
    // note imp -> whenever sending data via url so to call that link we have to use square braket in that api call place like {delete-msg[message_id]}

    // console.log("response of delete -> ", response);

    toast({
      title : response.data.message,
    })
    onMessageDelete(message_id);
  };

  return (
    <div>
      <Card>
        <CardHeader className=" flex-row justify-between" >
          <CardTitle>{message.content}</CardTitle>
          <AlertDialog>
            <AlertDialogTrigger asChild className="sticky">
              <Button variant="destructive" className="w-20 h-8 ">
                <X className=" w-5 h-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteConfirm} >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <CardDescription></CardDescription>
        </CardHeader>

        <CardContent>{formattedDate}</CardContent>
      </Card>
    </div>
  );
};

export  {MessageCard}