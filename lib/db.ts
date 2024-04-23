import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

db.user
  .create({
    data: {
      username: "test",
    },
  })
  .then((users) => {
    console.log(users);
  });

export default db;
