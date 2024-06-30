import ChatMessagesList from "@/components/chat-messages-list";
import db from "@/lib/db";
import getSession from "@/lib/session";
import { Prisma } from "@prisma/client";
import { notFound } from "next/navigation";

async function getRoom(id: string) {
  const room = await db.chatRoom.findUnique({
    where: {
      id,
    },
    include: {
      users: {
        select: { id: true },
      },
    },
  });
  if (room) {
    const session = await getSession();
    const canSee = Boolean(room.users.find((user) => user.id === session.id!));
    if (!canSee) {
      return null;
    }
  }
  return room;
}

async function getMessages(chatRoomId: string) {
  const session = await getSession();
  const messageIds = await db.message.findMany({
    where: {
      chatRoomId,
      AND: [
        {
          NOT: {
            message_read_by: {
              some: {
                userId: session.id,
              },
            },
          },
        },
        {
          NOT: {
            userId: session.id,
          },
        },
      ],
    },
    select: {
      id: true,
    },
  });

  const upserted = await db.messageReadBy.createMany({
    data: messageIds.map(({ id }) => ({
      userId: session.id!,
      messageId: id,
      readAt: new Date(),
    })),
  });

  if (upserted.count > 0) {
    // revalidateTag(`chat-room-${chatRoomId}-messeges`);
    // console.log("revalidatePath", `/chats/${chatRoomId}`);
    // revalidatePath(`/chats/${chatRoomId}`);
  }

  const messages = await db.message.findMany({
    where: {
      chatRoomId,
    },
    select: {
      id: true,
      payload: true,
      created_at: true,
      userId: true,
      user: {
        select: {
          avatar: true,
          username: true,
        },
      },
      message_read_by: {
        select: {
          userId: true,
        },
      },
    },
  });

  const res = messages.map(({ message_read_by, ...others }) => {
    return {
      ...others,
      read: message_read_by.length > 0, // TODO: handle with SQL
    };
  });

  console.log(">>", res.length);

  return res;
}
export type InitialChatMessages = Prisma.PromiseReturnType<typeof getMessages>;

async function getUserProfile() {
  const session = await getSession();
  const user = await db.user.findUnique({
    where: {
      id: session.id!,
    },
    select: {
      username: true,
      avatar: true,
    },
  });
  return user;
}

// const cachedMessages = async (id: string) =>
//   await nextCache(getMessages, [`chat-room-${id}-messeges`], {
//     tags: [`chat-room-${id}-messeges`],
//   })(id);
export default async function ChatRoom({ params }: { params: { id: string } }) {
  const room = await getRoom(params.id);
  if (!room) {
    return notFound();
  }
  const initialMessages = await getMessages(params.id);
  const session = await getSession();
  const user = await getUserProfile();
  if (!user) {
    return notFound();
  }
  return (
    <ChatMessagesList
      chatRoomId={params.id}
      userId={session.id!}
      username={user.username}
      avatar={user.avatar!}
      initialMessages={initialMessages}
    />
  );
}
