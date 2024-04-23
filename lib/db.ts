import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// async function create_sms() {
//   const token = await db.sMSToken.create({
//     data: {
//       token: "1212112",
//       user: {
//         connect: {
//           id: 1,
//         },
//       },
//     },
//   });
//   console.log(token);
// }
async function test() {
  const token = await db.sMSToken.findUnique({
    where: {
      id: 1,
    },
    include: {
      user: true,
    },
  });
  console.log(token);
}
test();

export default db;
