"use server";

import db from "./db";

export const getUnreadMessagesCount = async (
  chatRoomId: string,
  userId: number
) => {
  return await db.message.count({
    where: {
      chatRoomId,
      user: {
        NOT: {
          id: userId,
        },
      },
      message_read_by: {
        none: {
          userId,
        },
      },
    },
  });
};
