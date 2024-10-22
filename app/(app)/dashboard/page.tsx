'use client';

import React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { Loader2, RefreshCcw } from 'lucide-react';
import { MessageCard } from '@/components/messageCard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Message } from '@/models/User';
import { ApiResponse } from '@/types/ApiResponse';

function UserDashboard() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const [acceptMessages, setAcceptMessages] = useState(false);

  const { toast } = useToast();
  const { data: session } = useSession();

  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/api/accept-messages');
      if (response.data.success) {
        setAcceptMessages(response.data.isAcceptingMessages as boolean);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message || 'Failed to fetch message settings',
        variant: 'destructive',
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [toast]);

  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      setIsLoading(true);
      try {
        const response = await axios.get<ApiResponse>('/api/get-messages');
        if (response.data.success) {
          setMessages(response.data.messages || []);
          if (refresh) {
            toast({
              title: 'Refreshed messages successfully',
              description: 'Showing latest messages',
            });
          }
        } else {
          throw new Error(response.data.message);
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast({
          title: 'Error fetching messages',
          description: axiosError.response?.data.message || 'Failed to fetch messages',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    if (!session || !session.user) return;
    
    fetchMessages();
    fetchAcceptMessages();
  }, [session, fetchAcceptMessages, fetchMessages]);

  const handleSwitchChange = async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.post<ApiResponse>('/api/accept-messages', {
        acceptMessages: !acceptMessages,
      });
      
      if (response.data.success) {
        setAcceptMessages(!acceptMessages);
        toast({
          title: 'Success',
          description: response.data.message,
        });
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message || 'Failed to update message settings',
        variant: 'destructive',
      });
      // Revert back to the original state since the update failed
      setAcceptMessages(acceptMessages);
    } finally {
      setIsSwitchLoading(false);
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((message) => message._id !== messageId));
  };

  if (!session || !session.user) {
    router.replace("/");
    return <div className='text-xl font-sans'>Session is over</div>;
  }

  const { username } = session.user;
  const baseUrl = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : '';
  const profileUrl = `${baseUrl}/u/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: 'URL Copied!',
      description: 'Profile URL has been copied to clipboard.',
    });
  };

  return (
    <div className="container mx-auto my-8 p-6 space-y-8">
      <h1 className="text-4xl font-bold tracking-tight">User Dashboard</h1>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={profileUrl}
              readOnly
              className="flex-grow p-2 border rounded-md bg-gray-50"
            />
            <Button onClick={copyToClipboard}>Copy</Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                checked={acceptMessages}
                onCheckedChange={handleSwitchChange}
                disabled={isSwitchLoading}
              />
              <span className="font-medium">
                Accept Messages: {acceptMessages ? 'On' : 'Off'}
              </span>
              {isSwitchLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-8" />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Your Messages</h2>
          <Button
            onClick={() => fetchMessages(true)}
            variant="outline"
            className="flex items-center space-x-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
            <span>Refresh</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {messages.length > 0 ? (
            messages.map((message) => (
              <MessageCard
                key={message._id as string}
                message={message}
                onMessageDelete={handleDeleteMessage}
              />
            ))
          ) : (
            <div className="col-span-2 text-center py-8 bg-white rounded-lg shadow">
              <p className="text-gray-500">No messages to display.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;