"use client";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";

const SUPABASE_PUBLIC_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

interface Props {
  initialPayload: string;
  chatRoomId: string;
}

export default function LastMessage({ initialPayload, chatRoomId }: Props) {
  const channel = useRef<RealtimeChannel>();
  const [payload, setPayload] = useState<string>(initialPayload);
  useEffect(() => {
    const client = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
    channel.current = client.channel(`room-${chatRoomId}`);
    channel.current
      .on("broadcast", { event: "message" }, (data) => {
        setPayload(data.payload.payload);
      })
      .subscribe();
    return () => {
      channel.current?.unsubscribe();
    };
  }, [chatRoomId]);
  return <p className="dark:text-gray-300">{payload}</p>;
}
