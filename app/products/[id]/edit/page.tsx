import _Input from "@/components/input";
import { getProduct, onImageChange } from "@/lib/utils";
import { unstable_cache as nextCache, revalidateTag } from "next/cache";
import { notFound } from "next/navigation";
import EditProductForm from "./edit-product-form";

const getCachedProduct = nextCache(getProduct, ["product-detail"], {
  tags: ["product-detail", "product"],
});

export default async function EditProduct({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return notFound();
  }

  const product = await getCachedProduct(id);
  if (product === null) {
    return notFound();
  }

  return (
    <EditProductForm
      photo={product.photo}
      title={product.title}
      price={product.price}
      description={product.description}
    />
  );
}
