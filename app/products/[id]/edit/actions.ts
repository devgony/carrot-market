"use server";

import getSession from "@/lib/session";
import { productSchema } from "../../add/schema";
import db from "@/lib/db";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

export const editProduct = async (formData: FormData) => {
  const data = {
    photo: formData.get("photo"),
    title: formData.get("title"),
    price: formData.get("price"),
    description: formData.get("description"),
  };
  const result = productSchema.safeParse(data);
  if (!result.success) {
    return result.error.flatten();
  } else {
    const session = await getSession();
    if (session.id) {
      const product = await db.product.update({
        data: {
          title: result.data.title,
          description: result.data.description,
          price: result.data.price,
          photo: result.data.photo,
          user: {
            connect: {
              id: session.id,
            },
          },
        },
        where: {
          id: 1,
        },
      });
      revalidateTag("product");
      redirect(`/products/${product.id}`);
    }
  }
};
