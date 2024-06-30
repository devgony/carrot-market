"use client";

import { InitialChatMessages } from "@/app/chats/[id]/page";
import { saveMessage } from "@/app/chats/actions";
import saveMessageReadBy from "@/lib/messageReadBy";
import revalidateTagOnServer from "@/lib/revalidateTagOnServer";
import { formatToTimeAgo } from "@/lib/utils";
import {
  ArrowUpCircleIcon,
  ArrowUturnLeftIcon,
} from "@heroicons/react/24/solid";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const SUPABASE_PUBLIC_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

interface ChatMessageListProps {
  chatRoomId: string;
  initialMessages: InitialChatMessages;
  userId: number;
  username: string;
  avatar: string;
}
export default function ChatMessagesList({
  chatRoomId,
  initialMessages,
  userId,
  username,
  avatar,
}: ChatMessageListProps) {
  const [messages, setMessages] = useState(initialMessages);
  useEffect(() => {
    setMessages(initialMessages);
  }, []);
  const [message, setMessage] = useState("");
  const channel = useRef<RealtimeChannel>();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { value },
    } = event;
    setMessage(value);
  };
  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const messageId = await saveMessage(message, chatRoomId);

    setMessages((prevMsgs) => [
      ...prevMsgs,
      {
        id: messageId,
        payload: message,
        created_at: new Date(),
        userId,
        user: {
          username: "string",
          avatar: "xxx",
        },
        read: false, // TODO: should it be false?
      },
    ]);

    channel.current?.send({
      type: "broadcast",
      event: "message",
      payload: {
        id: Date.now(),
        messageId,
        payload: message,
        created_at: new Date(),
        userId,
        user: {
          username,
          avatar,
        },
      },
    });
    setMessage("");
  };
  useEffect(() => {
    const client = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
    channel.current = client.channel(`room-${chatRoomId}`);
    channel.current
      .on("broadcast", { event: "message" }, async (payload) => {
        setMessages((prevMsgs) => [
          ...prevMsgs,
          { ...payload.payload, read: true },
        ]);

        const messageReadBy = {
          userId,
          messageId: payload.payload.messageId,
        };

        await saveMessageReadBy(messageReadBy);

        channel.current?.send({
          type: "broadcast",
          event: "ack",
          payload: messageReadBy,
        });
      })
      .subscribe();

    channel.current.on("broadcast", { event: "ack" }, (payload) => {
      const { userId, messageId } = payload.payload;
      setMessages((prevMsgs) =>
        prevMsgs.map((msg) => {
          if (msg.id === messageId) {
            return {
              ...msg,
              read: true,
            };
          }
          return msg;
        })
      );
    });

    revalidateTagOnServer("chat-rooms");

    return () => {
      channel.current?.unsubscribe();
    };
  }, [chatRoomId]);
  const router = useRouter();
  return (
    <div className="p-5 flex flex-col gap-5 min-h-screen justify-end">
      <ArrowUturnLeftIcon
        className="sticky top-5 size-10 text-orange-500 cursor-pointer"
        onClick={() => {
          router.back();
        }}
      />
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-2 items-start ${
            message.userId === userId ? "justify-end" : ""
          }`}
        >
          {message.userId === userId ? null : (
            <Image
              src={message.user.avatar ?? ""}
              alt={message.user.username}
              width={50}
              height={50}
              className="size-8 rounded-full"
            />
          )}
          <div
            className={`flex flex-col gap-1 ${
              message.userId === userId ? "items-end" : ""
            }`}
          >
            <section className="flex gap-2 items-center">
              {!message.read && message.userId === userId && (
                <p className="text-xs font-bold text-yellow-300">1</p>
              )}
              <span
                className={`${
                  message.userId === userId ? "bg-neutral-500" : "bg-orange-500"
                } p-2.5 rounded-md`}
              >
                {message.payload}
              </span>
              {!message.read &&
                message.userId !== userId && ( // TODO: can be merged with the my-message case?
                  <p className="text-xs font-bold text-yellow-300">1</p>
                )}
            </section>
            <span className="text-xs">
              {formatToTimeAgo(message.created_at.toString())}
            </span>
          </div>
        </div>
      ))}
      <form className="flex relative" onSubmit={onSubmit}>
        <input
          required
          onChange={onChange}
          value={message}
          className="bg-transparent rounded-full w-full h-10 focus:outline-none px-5 ring-2 focus:ring-4 transition ring-neutral-200 focus:ring-neutral-50 border-none placeholder:text-neutral-400"
          type="text"
          name="message"
          placeholder="Write a message..."
        />
        <button className="absolute right-0">
          <ArrowUpCircleIcon className="size-10 text-orange-500 transition-colors hover:text-orange-300" />
        </button>
      </form>
    </div>
  );
}
