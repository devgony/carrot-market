"use client";

import Button from "@/components/button";
import _Input from "@/components/input";
import { PhotoIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { uploadProduct } from "./actions";
import { useForm } from "react-hook-form";
import { ProductType, productSchema } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { onImageChange } from "@/lib/utils";

export default function AddProduct() {
  const [preview, setPreview] = useState("");
  const [uploadUrl, setUploadUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProductType>({
    resolver: zodResolver(productSchema),
  });

  const onSubmit = handleSubmit(async (data: ProductType) => {
    if (!file) {
      return;
    }
    const cloudflareForm = new FormData();
    cloudflareForm.append("file", file);
    const response = await fetch(uploadUrl, {
      method: "post",
      body: cloudflareForm,
    });

    if (response.status !== 200) {
      console.error("response status is not 200");
      return;
    }
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("price", data.price + "");
    formData.append("description", data.description);
    formData.append("photo", data.photo);

    const errors = await uploadProduct(formData);
    if (errors) {
      console.error(errors);
    }
  });
  const onValid = async () => {
    await onSubmit();
  };
  return (
    <div>
      <form action={onValid} className="p-5 flex flex-col gap-5">
        <label
          htmlFor="photo"
          className="border-2 aspect-square flex items-center justify-center flex-col text-neutral-300 border-neutral-300 rounded-md border-dashed cursor-pointer bg-center bg-cover"
          style={{
            backgroundImage: `url(${preview})`,
          }}
        >
          {preview === "" ? (
            <>
              <PhotoIcon className="w-20" />
              <div className="text-neutral-400 text-sm">
                사진을 추가해주세요.
                {errors.photo?.message}
              </div>
            </>
          ) : null}
        </label>
        <input
          onChange={(event) =>
            onImageChange(event, setPreview, setFile, setUploadUrl, setValue)
          }
          type="file"
          id="photo"
          name="photo"
          accept="image/*"
          className="hidden"
        />
        <_Input
          required
          placeholder="제목"
          type="text"
          {...register("title")}
          errors={[errors.title?.message ?? ""]}
        />
        <_Input
          type="number"
          required
          placeholder="가격"
          {...register("price")}
          errors={[errors.price?.message ?? ""]}
        />
        <_Input
          type="text"
          required
          placeholder="자세한 설명"
          {...register("description")}
          errors={[errors.description?.message ?? ""]}
        />
        <Button text="작성 완료" />
      </form>
    </div>
  );
}
