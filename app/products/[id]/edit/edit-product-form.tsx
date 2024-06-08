"use client";

import _Input from "@/components/input";
import { useState } from "react";
import { PhotoIcon } from "@heroicons/react/24/solid";
import { useForm } from "react-hook-form";
import { ProductType, productSchema } from "../../add/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { editProduct } from "./actions";
import { onImageChange } from "@/lib/utils";
import Button from "@/components/button";

export default function EditProductForm({
  photo,
  title,
  price,
  description,
}: ProductType) {
  const [wasPhotoMutated, setIsPhotoMutated] = useState(false);
  const [preview, setPreview] = useState(`${photo}/width=500,height=500`);
  const [uploadUrl, setUploadUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProductType>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      photo,
      title,
      price,
      description,
    },
  });
  const onSubmit = handleSubmit(async (data: ProductType) => {
    const formData = new FormData();
    if (wasPhotoMutated) {
      if (!file) {
        console.error("file is not found");
        return;
      }
      const cloudflareForm = new FormData();
      cloudflareForm.append("file", file);
      const response = await fetch(uploadUrl, {
        method: "post",
        body: cloudflareForm,
      });

      if (response.status !== 200) {
        console.error("failed to upload photo");
        return;
      }
    }

    formData.append("photo", data.photo);
    formData.append("title", data.title);
    formData.append("price", data.price + "");
    formData.append("description", data.description);

    const errors = await editProduct(formData);
    if (errors) {
      console.log(errors);
    }
  });
  return (
    <form action={() => onSubmit()} className="p-5 flex flex-col gap-5">
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
        onChange={(event) => {
          onImageChange(event, setPreview, setFile, setUploadUrl, setValue);
          setIsPhotoMutated(true);
        }}
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
  );
}
