# Carrot Market

# 2. INTRODUCTION

## 2.5 Project Setup

```sh
npx create-next-app@latest
```

- clear `page.tsx` and `globals.css`

# 3 TAILWIND

## 3.2 Card Component

## 3.3 Modifiers

- for darkmode

```
   dark:bg-gray-700
// modifier:class
```

## 3.4 Tailwind Variables

- ring: handle all sides of borders with `Variables`
- `placeholder:drop-shadow` : use sudo-element to access children

## 3.5 Responsive Modifiers

```
sm:bg-red-100 md:bg-green-100 lg:bg-cyan-100 xl:bg-orange-100 2xl:bg-purple-100
```

## 3.6 Form Modifiers

- show form validation error with tailwind

```ts
<input
  className="peer"
  type="email"
  ..
/>
<span className="text-red-500 font-medium hidden peer-invalid:block ">
  Email is required.
</span>
```

## 3.7 State Modifiers

- To all children

```
*:outline-none
```

- If has

```
has-[:invalid]:ring-red-100
```

## 3.8 Lists and Animations

- List

```
odd:bg-gray-100
even:bg-cyan-100
first:border-0
last:border-0
```

- Animation

```
animate-pulse
animate-ping
animate-bounce
animate-spin
```

## 3.9 Group Modifiers

- Handle the state of `any children` of the group.

```ts
<div key={index} className=".. group">
  ..
  <span className=".. group-hover:text-red-500">
    {person}
  </span>
  ..
</div>
```

## 3.10 JIT

```ts
// tailwind.config.ts
  theme: {
    extend: {
      margin: {
        tomato: "120px",
      },
      borderRadius: {
        "sexy-name": "11.11px",
      },
    },
  },

// page.tsx
<button className=".. rounded-sexy-name mt-tomato">
```

## 3.11 Directives

### Base

- default styles like resetting padding, margin..

### Utility

- compiler convert utility class names to css styles

### Component: set of ?

- To encapsulate utility classes
- To use plugins

### @layer directive

- extends each layers {Base | Utility | Component}

### @apply

- apply directives to the layer

```
@layer base {
  a {
    @apply text-blue-500;
  }
}

@layer utilities {
  .text-bigger-hello {
    @apply text-3xl font-semibold;
  }
}

@layer components {
  .btn {
    @apply w-full bg-black h-10 text-white rounded-sexy-name mt-tomato;
  }
}
```

## 3.12 Plugins

```sh
npm install -D @tailwindcss/forms
```

```ts
// tailwind.config.ts
plugins: [require("@tailwindcss/forms")],
```

# 4. AUTHENTICATION UI

## 4.0 Home Screen

- impl login home styles

## 4.1 Create Account Screen

```sh
npm install @heroicons/react

mkdir app/create-account \
app/login

touch app/create-account/page.tsx \
app/login/page.tsx
```

## 4.2 Form Components

```sh
mkdir components

touch components/form-btn.tsx \
components/form-input.tsx
components/social-login.tsx
```

## 4.3 Log in Screen

```sh
mkdir app/sms

touch app/sms/page.tsx \
components/social-login.tsx
```

- remind that now `tsconfig` convert import alias to relative path

```ts
// tsconfig.json
..
"paths": {
  "@/*": [
    "./*"
  ]
}
```

# 5. SERVER ACTIONS

## 5.0 Route Handlers

```sh
mkdir -p app/www/users
touch app/www/users/route.ts
```

- legacy way to handle route

```ts
// app/login/page.tsx
"use client";
..
const onClick = async () => {
  const response = await fetch("/www/users", {
    method: "POST",
    body: JSON.stringify({
      username: "nico",
      password: "1234",
    }),
  });
  console.log(await response.json());
};
```

```ts
// app/www/users/route.ts
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  console.log(request);
  return Response.json({
    ok: true,
  });
}

export async function POST(request: NextRequest) {
  const data = await request.json();
  console.log("log the user in!!!");
  return Response.json(data);
}
```

- but with Server action, we don't need even this

## 5.1 Server Action

1. define handleForm with `use server`
2. assign to form.action
3. input tag should use unique `name` to distinguish each params

```ts
// app/login/page.tsx
async function handleForm(formData: FormData) {
  "use server";
  console.log(formData.get("email"), formData.get("password"));
  console.log("i run in the server baby!");
}
..
<form action={handleForm} className="flex flex-col gap-3">
..
   <FormInput name="email" ..
   <FormInput name="password" ..
```

```ts
// components/form-input.tsx
..
  <input name={name} ..
```

## 5.2 useFormStatus

- useFormStatus gives the status of parent form like pending, data, method, action ..
- it should be with `use client` and inside of form tag

```ts
// components/form-btn.tsx
"use client";
import { useFormStatus } from "react-dom";
..
export default function FormButton({ text }: FormButtonProps) {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} .. >
      {pending ? "로딩 중" : text}
    </button>
  );
}
```

## 5.3 useFormState

- callback of `useFormState` should be with `use server`
- 2nd arg of `useFormState` is initState
- `useFormState` itself should be with `use client`

```ts
// app/login/actions.ts
"use server";

export async function handleForm(prevState: any, formData: FormData) {
  console.log(prevState);
  await new Promise((resolve) => setTimeout(resolve, 5000));
  return {
    errors: ["wrong password", "password too short"],
  };
}

// app/login/page.tsx
"use client";

export default function LogIn() {
  const [state, action] = useFormState(handleForm, null);
  ..
  <form action={action} .. >
```

# 6. VALIDATION

## 6.0 Introduction to Zod

```sh
npm i zod
touch app/create-account/actions.ts
```

- single field validation with zod

```ts
// app/create-account/actions.ts
import { z } from "zod";
const usernameSchema = z.string().min(5).max(10);
usernameSchema.parse(data.username); // throw error
```

## 6.1 Validation Errors

- object validation with zod
- recoverable error with `safeParse`

```ts
// app/create-account/actions.ts
const formSchema = z.object({
  username: z.string().min(3).max(10),
  email: z.string().email(),
  password: z.string().min(10),
  confirm_password: z.string().min(10),
});
..
const result = formSchema.safeParse(data);
if (!result.success) {
  return result.error.flatten();
}
```

```ts
// app/create-account/page.tsx
const [state, dispatch] = useFormState(createAccount, null);
..
<FormInput .. errors={state?.fieldErrors.email} />
```

## 6.2 Refinement

- refine each field with `.refine(field => bool)`
- refine whole schema with `superRefine(schema => bool)`
  - set path of error

```ts
const formSchema = z
  .object({
    username: z
      .string({
        invalid_type_error: "Username must be a string!",
        required_error: "Where is my username???",
      })
      .min(3, "Way too short!!!")
      .max(10, "That is too looooong!")
      .refine(
        (username) => !username.includes("potato"),
        "No potatoes allowed!",
      ),
    email: z.string().email(),
    password: z.string().min(10),
    confirm_password: z.string().min(10),
  })
  .superRefine(({ password, confirm_password }, ctx) => {
    if (password !== confirm_password) {
      ctx.addIssue({
        code: "custom",
        message: "Two passwords should be equal",
        path: ["confirm_password"],
      });
    }
  });
```

## 6.3 Transformation

```ts
username: z
  .string({
    invalid_type_error: "Username must be a string!",
    required_error: "Where is my username???",
  })
  .min(3, "Way too short!!!")
  .trim()
  .toLowerCase()
  .transform((username) => `🔥 ${username}`)
..
password: z
  .string()
  .min(4)
  .regex(
    passwordRegex,
    "Passwords must contain at least one UPPERCASE, lowercase, number and special characters #?!@$%^&*-",
  ),
```

## 6.4 Refactor

```sh
mv components/form-input.tsx components/input.tsx
mv components/form-btn.tsx components/button.tsx
```

- inherit `InputHTMLAttributes<HTMLInputElement>`

```ts
// components/input.tsx
export default function Input({
  name,
  errors = [],
  ...rest
}: InputProps & InputHTMLAttributes<HTMLInputElement>) {
      <input
        ..
        {...rest}
```

## 6.6 Log In Validation

- path alias by tsconfig

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": [
        "./*"
      ]
    }
..
```

- implement login action like create-account
- sms page base

```sh
mkdir lib
touch lib/constants.ts \
app/sms/actions.ts
```
