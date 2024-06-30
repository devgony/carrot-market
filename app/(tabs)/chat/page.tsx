import Button from "@/components/button";
import { deleteChatRoom, getChatRooms } from "./actions";
import { formatToTimeAgo } from "@/lib/utils";
import Link from "next/link";
import { unstable_cache as nextCache } from "next/cache";
import UnreadCount from "@/components/unread-count";
import session from "@/lib/session";
import getSession from "@/lib/session";
import { notFound } from "next/navigation";
import LastMessage from "@/components/last-message";

const getCachedChatRooms = nextCache(getChatRooms, ["chat-rooms"], {
  tags: ["chat-rooms"],
});

export default async function Chat() {
  const chatRooms = await getCachedChatRooms();
  const session = await getSession();
  if (session.id === undefined) {
    return notFound();
  }
  return (
    <main className="flex flex-col gap-4 m-4">
      {chatRooms.length > 0 ? (
        chatRooms.map((chatRoom) => (
          <Link key={chatRoom.id} href={`/chats/${chatRoom.id}`}>
            <form
              key={chatRoom.id}
              className="flex items-center bg-white p-4 rounded-lg dark:bg-gray-800 justify-between"
              action={async () => {
                "use server";
                return await deleteChatRoom(chatRoom.id);
              }}
            >
              <section className="flex gap-2 items-center">
                <img
                  src={chatRoom.avatar ?? "/avatar.png"}
                  alt="avatar"
                  className="w-12 h-12 rounded-full"
                />
                <span>
                  <div className="flex gap-4">
                    <h2 className="text-lg font-semibold dark:text-white">
                      {chatRoom.username}
                    </h2>
                    <p className="text-neutral-400">
                      {chatRoom.updated_at && // TODO: why undefined?
                        formatToTimeAgo(chatRoom.updated_at.toString())}
                    </p>
                  </div>
                  {/* <p className="dark:text-gray-300">{chatRoom.payload}</p> */}
                  <LastMessage
                    initialPayload={chatRoom.payload}
                    chatRoomId={chatRoom.id}
                  />
                </span>
              </section>
              <span className="flex gap-4 items-center">
                <UnreadCount
                  initialCount={chatRoom.unreadMessagesCount}
                  chatRoomId={chatRoom.id}
                  userId={session.id!}
                />
                <span className="w-24">
                  <Button text="Delete" />
                </span>
              </span>
            </form>
          </Link>
        ))
      ) : (
        <p>No chat rooms</p>
      )}
    </main>
  );
}
