import db from "@/lib/db";
import getSession from "@/lib/session";
import { Prisma } from "@prisma/client";
import { revalidateTag } from "next/cache";

export const getChatRooms = async () => {
  const session = await getSession();
  /* 
  SELECT message.payload, message.createdAt
  FROM chatRoom, message
  WHERE chatRoom.id = message.chatRoomId
  AND message.id = (
    SELECT MAX(id)
    FROM message
    WHERE chatRoomId = chatRoom.id
  ) 
  */

  const chatRooms = await db.chatRoom.findMany({
    select: {
      id: true,
      _count: {
        select: {
          messages: {
            where: {
              user: {
                NOT: {
                  id: session.id,
                },
              },
              message_read_by: {
                none: {
                  userId: session.id,
                },
              },
            },
          },
        },
      },
      users: {
        select: {
          username: true,
          avatar: true,
        },
        where: {
          NOT: {
            id: session.id,
          },
        },
        take: 1,
      },
      messages: {
        select: {
          payload: true,
          updated_at: true,
        },
        orderBy: {
          id: "desc",
        },
        take: 1,
      },
    },
    where: {
      users: {
        some: {
          id: session.id,
        },
      },
    },
  });

  // const unreadMessages = await db.message.count({
  //   where: {
  //     message_read_by: {
  //       none: {
  //         userId: session.id,
  //       },
  //     },
  //   },
  // });

  const flattenedChatRooms = chatRooms
    .map((chatRoom) => {
      const { updated_at, payload } = chatRoom.messages[0] ?? {};
      const { avatar, username } = chatRoom.users[0] ?? {};

      return {
        id: chatRoom.id,
        avatar,
        username,
        updated_at,
        payload,
        unreadMessagesCount: chatRoom._count.messages,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime() // TODO: sort on DB
    );

  return flattenedChatRooms;
};

export type ChatRoomWithLastMessage = Prisma.PromiseReturnType<
  typeof getChatRooms
>;

export const deleteChatRoom = async (id: string) => {
  const session = await getSession();

  const chatRoom = await db.chatRoom.findFirst({
    where: {
      id,
      users: {
        some: {
          id: session.id,
        },
      },
    },
  });

  if (!chatRoom) {
    throw new Error("Chat room not found");
  }

  await db.messageReadBy.deleteMany({
    where: {
      message: {
        chatRoomId: id,
      },
    },
  });

  await db.message.deleteMany({
    where: {
      chatRoomId: id,
    },
  });

  await db.chatRoom.delete({
    where: {
      id,
    },
  });

  revalidateTag("chat-rooms");
  return chatRoom;
};
