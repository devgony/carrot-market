"use client";
import { getUnreadMessagesCount } from "@/lib/unread";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";

const SUPABASE_PUBLIC_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

interface Props {
  initialCount: number;
  chatRoomId: string;
  userId: number;
}
export default function UnreadCount({
  initialCount,
  chatRoomId,
  userId,
}: Props) {
  const [count, setCount] = useState(initialCount);
  const channel = useRef<RealtimeChannel>();

  useEffect(() => {
    const client = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
    channel.current = client.channel(`room-${chatRoomId}`);
    channel.current
      .on("broadcast", { event: "message" }, async (_) => {
        const counted = await getUnreadMessagesCount(chatRoomId, userId);
        setCount(() => counted);
      })
      .subscribe();
    return () => {
      channel.current?.unsubscribe();
    };
  }, [chatRoomId]);

  if (count === 0) {
    return null;
  }

  return (
    <p className="rounded-full bg-red-500 text-white py-1 px-3">{count}</p>
  );
}
