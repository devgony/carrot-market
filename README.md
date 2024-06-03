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
  <span className=".. group-hover:text-red-500">{person}</span>
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
        "No potatoes allowed!"
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

## 6.7 Coerce

- `validator` helps to verify complex patterns like phone number

```sh
npm i validator
npm i --save-dev @types/validator
```

- `z.coerce.nubmer()` tries to convert strnig to nubmer

```ts
// app/sms/actions.ts
const tokenSchema = z.coerce.number().min(100000).max(999999);
```

## 6.8 SMS Validation

- actions: if prevState does not have token, validate phone else token
- page: if state has token, show only token formInput.

# 7. PRISMA

## 7.1 Schemas

```sh
npm i prisma
npx prisma init
```

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id         Int      @id @default(autoincrement())
  username   String   @unique
  email      String?  @unique
  password   String?
  phone      String?  @unique
  github_id  String?  @unique
  avatar     String?
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
}
```

```sh
npx prisma migrate dev
```

## 7.2 Prisma Client

- Prisma client supports types from `node_modules/.prisma/client/index.d.ts`

```ts
// touch lib/db.ts
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
```

## 7.3 Prisma Studio

```sh
npx prisma studio
```

## 7.4 Relationships

- User : SMSToken = 1 : N

```
person --> phone#   --> sms(token)
token  --> SMSToken <-> User --> log the user in
```

```ts
// lib/db.ts
async function create_sms() {
  const token = await db.sMSToken.create({
    data: {
      token: "1212112",
      user: {
        connect: {
          id: 1,
        },
      },
    },
  });
}
```

## 7.5 onDelete

```prisma
// schema.prisma
model SMSToken {
  ..
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
```

# 8 AUTHENTICATION

## 8.1 Database Validation

- validate with async email query, refine, safeParseAsync

```ts
const checkUniqueEmail = async (email: string) => {
  const user = await db.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });
  return Boolean(user) === false;
};
..
  email: z
    ..
    .refine(
      checkUniqueEmail,
      "There is an account already registered with that email."
    ),
..
export async function createAccount(prevState: any, formData: FormData) {
  ..
  const result = await formSchema.safeParseAsync(data);
```

- shouldn't it be superRefine to refine `object`?

```ts
z.object.refine(checkPasswords, {
  message: "Both passwords should be the same!",
  path: ["confirm_password"],
});
```

## 8.2 Password Hashing

```sh
npm i bcrypt @types/bcrypt
```

```ts
const hashedPassword = await bcrypt.hash(result.data.password, 12);
```

## 8.3 Iron Session

```sh
npm i iron-session
mkdir -p app/profile/
touch app/profile/page.tsx
```

- [password generator](https://1password.com/password-generator/)
  - `process.env.COOKIE_PASSWORD` should be longer than 32 bytes

```ts
// log the user in
const cookie = await getIronSession<typeof user>(cookies(), {
  cookieName: "delicious-karrot",
  password: process.env.COOKIE_PASSWORD!,
});
cookie.id = user.id;
await cookie.save();

redirect("/profile");
```

## 8.5 Email Log In

- zod.`spa` is alias of safeParseAsync
- extract getSession
- checkEmailExists at zod -> can separate with biz logic

```sh
touch lib/session.ts
```

- impl login/actions.ts with getSession, unify error with zod

## 8.6 superRefine

- move checkUniqueUsername and checkUniqueEmail to callback of superRefine
- To enhance efficiency through lazy evaluation.
  1. fatal: true
  2. return z.NEVER
  3. evaluate superRefine earlier than refine

```ts
// app/create-account/actions.ts
.superRefine(async ({ username }, ctx) => {
  const user = await db.user.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
    },
  });
  if (user) {
    ctx.addIssue({
      code: "custom",
      message: "This username is already taken",
      path: ["username"],
      fatal: true,
    });
    return z.NEVER;
  }
})
```

## 8.7 Log Out

- instead of `onClick`, use form.action with `use server`

```ts
// app/profile/page.tsx
const logOut = async () => {
    "use server";
    const session = await getSession();
    await session.destroy();
    redirect("/");
  };
  return (
    <div>
      <h1>Welcome! {user?.username}!</h1>
      <form action={logOut}>
        <button>Log out</button>
      </form>
      ..
```

- `next/navigation.notFound` will redirect to 404
- To solve volatile cookie error: `it had the secure attribute but was not received over a secure connection`, add `cookieOptions.secure: false`

```ts
// lib/session.ts
export default function getSession() {
  return getIronSession<SessionContent>(cookies(), {
    cookieName: "delicious-karrot",
    password: process.env.COOKIE_PASSWORD!,
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
    },
  });
}
```

## 8.9 Middleware

```
GET /profile --> middleware() --> <Profile /> : <404 />
```

- middleware evaluated whenever server gets requests

```ts
// touch middleware.ts
export async function middleware(request: NextRequest) {
  const session = await getSession();
  console.log(session);
  if (request.nextUrl.pathname === "/profile") {
    return NextResponse.redirect(new URL("/", request.url));
  }
}
```

## 8.10 Matcher

- exclude by config.matcher

```ts
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

## 8.11 Edge Runtime

- run SQL in middleware -> error: PrismaClient is unable to run in Vercel Edge Function

  - Vercel Edge function: light weight version nodeJS
  - but latancy is lowest

- https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes

## 8.12 Authentication Middleware

- use hashMap to search faster
- redirect to proper page with login state

```ts
interface Routes {
  [key: string]: boolean;
}

const publicOnlyUrls: Routes = {
  "/": true,
  "/login": true,
  "/sms": true,
  "/create-account": true,
};
..
if (!session.id) {
  if (!exists) {
    // no login? --> go to /
    return NextResponse.redirect(new URL("/", request.url));
  }
} else {
  if (exists) {
    // already loged in? --> go to product main
    return NextResponse.redirect(new URL("/products", request.url));
  }
}
```

# 9 SOCIAL AUTHENTICATION

## 9.1 Github Authentication

```sh
mkdir -p app/github/start/
touch app/github/start/route.ts
```

```ts
// app/github/start/route.ts
export function GET() {
  const baseURL = "https://github.com/login/oauth/authorize";
  const params = {
    client_id: process.env.GITHUB_CLIENT_ID!,
    scope: "read:user,user:email",
    allow_signup: "true",
  };
  const formattedParams = new URLSearchParams(params).toString();
  const finalUrl = `${baseURL}?${formattedParams}`;
  return Response.redirect(finalUrl);
}
```

- [create new Oauth](github.com/settings/applications/new)

```
Homepage URL: http://henrypb:3000/login
Authorization callback URL: http://henrypb:3000/github/complete
```

- Generate a new client secret
- copy GITHUB_CLIENT_SECRET, GITHUB_CLIENT_ID to .env

## 9.2 Access Token

```sh
mkdir app/github/complete/
touch app/github/complete/route.ts
```

```ts
// app/github/complete/route.ts
const accessTokenParams = new URLSearchParams({
  client_id: process.env.GITHUB_CLIENT_ID!,
  client_secret: process.env.GITHUB_CLIENT_SECRET!,
  code,
}).toString();
const accessTokenURL = `https://github.com/login/oauth/access_token?${accessTokenParams}`;
const accessTokenResponse = await fetch(accessTokenURL, {
  method: "POST",
  headers: {
    Accept: "application/json",
  },
});
const accessTokenData = await accessTokenResponse.json();
```

## 9.3 Github API

- if user exists, save session and redirect, else create user user and save session in cookie.
  - app/github/complete/route.ts

## 9.4 Code Challenge

- extract fn logUserIn(id: number)

```ts
async function logUserIn(id: number) {
  const session = await getSession();
  session.id = id;
  await session.save();
  return redirect("/profile");
}
```

- handle duplicated username => errror or random suffix

```ts
const usernameExists = await db.user.findUnique({
  where: { username: login },
});

const username = usernameExists ? `${login}_${id}` : login; // security issue?
```

- get email of user : /user/emails (getUserEmail)

```ts
const res: [{ email: string }] = await emailResponse.json();
const email = res.length > 0 ? res[0].email : null;
```

- isolate request(getAccessToken) and response (getGithubProfile)

- don't we have to try-catch with middleware?

## 9.5 SMS Token

- get unique token with recursive execution

```ts
async function getToken() {
  const token = crypto.randomInt(100000, 999999).toString();
  const exists = await db.sMSToken.findUnique({
    where: {
      token,
    },
    select: {
      id: true,
    },
  });
  if (exists) {
    return getToken();
  } else {
    return token;
  }
}
```

- delete can create new SMSToken with hashed random username

## 9.6 Token Verification

- inefficient duplicated find, though we need join

```ts
const token = await db.sMSToken.findUnique({
  // inefficient duplicated find, though we need join
  where: {
    token: result.data.toString(),
  },
  select: {
    id: true,
    userId: true,
  },
});
```

## 9.7 Twilio SMS

- [should create new twilio project to get opt](https://www.twilio.com/console/projects/create)

```sh
npm i twilio
```

```ts
// app/sms/actions.ts
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
await client.messages.create({
  body: `Your Karrot verification code is: ${token}`,
  from: process.env.TWILIO_PHONE_NUMBER!,
  to: process.env.MY_PHONE_NUMBER!, // should be result.data
});
```

## 9.8 Code Challenge

- get phone number and enhance verification
- can't we refer the joined table in prisma method?

```ts
const smsToken = await db.sMSToken.findUnique({
  where: {
    token: resultToken.data.toString(),
  },
  select: {
    id: true,
    userId: true,
    phone: true,
    user: {
      select: {
        phone: true,
      },
    },
  },
});

if (smsToken?.phone !== smsToken?.user.phone) {
  return {
    token: true,
    error: {
      formErrors: ["This token does not match the phone number."],
    },
  };
}
```

# 10 PRODUCTS

## 10.0 Introduction

```prisma
model User {
  ..
  Product    Product[]
}

model Product {
  id          Int      @id @default(autoincrement())
  title       String
  price       Float
  photo       String
  description String
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
  user        User     @relation(fields: [userId], references: [id])
  userId      Int
}
```

```sh
npm run mig
> add product
```

## 10.1 Tab Bar

- create tabBar and components base
- `(group-name)` can separate directory without affecting route

```sh
mkdir app/\(auth\)
mv app/create-account/ app/\(auth\)/
mv app/github/ app/\(auth\)/
mv app/login/ app/\(auth\)/
mv app/sms/ app/\(auth\)/
mv app/page.tsx app/\(auth\)/page.tsx

mkdir app/\(tabs\) \
mkdir app/\(tabs\)/chat/ \
app/\(tabs\)/life/ \
app/\(tabs\)/live/ \
app/\(tabs\)/products/

touch app/\(tabs\)/chat/page.tsx \
app/\(tabs\)/layout.tsx \
app/\(tabs\)/life/page.tsx \
app/\(tabs\)/live/page.tsx \
app/\(tabs\)/products/page.tsx

mv app/profile/ app/\(tabs\)

rm app/www/users/route.ts
touch components/tab-bar.tsx
```

## 10.2 Skeletons

- render skeletons of product with animate-pulse

```sh
touch app/\(tabs\)/products/loading.tsx
```

## 10.3 Product Component

- fetch image from product.photo

```sh
touch components/list-product.tsx
curl -o public/goguma.jpg https://raw.githubusercontent.com/nomadcoders/carrot-market-reloaded/28d9994c9b04524d0127a34176c7140a8e06774c/public/goguma.jpg
```

## 10.4 Detail Skeleton

- detail skeleton with animate-pulse

```sh
mkdir -p app/products/[id]/
touch app/products/[id]/loading.tsx \
app/products/[id]/page.tsx \
lib/utils.ts
```

- formatToTimeAgo & formatToWon

```ts
export function formatToTimeAgo(date: string): string {
  const dayInMs = 1000 * 60 * 60 * 24;
  const time = new Date(date).getTime();
  const now = new Date().getTime();
  const diff = Math.round((time - now) / dayInMs);

  const formatter = new Intl.RelativeTimeFormat("ko");

  return formatter.format(diff, "days");
}

export function formatToWon(price: number): string {
  return price.toLocaleString("ko-KR");
}
```

## 10.5 Product Detail

- convert url param to number

```ts
const id = Number(params.id);
if (isNaN(id)) {
  return notFound();
}
```

## 10.6 Image Hostnames

- For optimization, basically does not allow remote images
  - https://nextjs.org/docs/messages/next-image-unconfigured-host
- To fix `Error: Invalid src prop (https://avatars.githubusercontent.com/u/51254761?v=4)` on next/image,

```js
// next.config.mjs
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
};
```

## 10.7 Pagination Actions

```sh
touch "app/(tabs)/products/actions.ts" \
components/product-list.tsx

curl -o public/gimbap.jpg https://raw.githubusercontent.com/nomadcoders/carrot-market-reloaded/ba8f8f15f6d5fc3690665a3ab5257d221c9add65/public/gimbap.jpg
curl -o public/odeng.jpg https://raw.githubusercontent.com/nomadcoders/carrot-market-reloaded/ba8f8f15f6d5fc3690665a3ab5257d221c9add65/public/odeng.jpg
```

- pagination with take and skip

```ts
// app/(tabs)/products/page.tsx
async function getInitialProducts() {
  ..
  take: 1,
  orderBy: {
    created_at: "desc",
  },

// app/(tabs)/products/actions.ts
export async function getMoreProducts(page: number) {
  ..
    skip: 1,
    take: 1,
    orderBy: {
      created_at: "desc",
    },
```

## 10.8 Recap

- increase page onLoadMoreClick

## 10.9 Infinite Scrolling

- Intersection Observer API: a way to asynchronously observe changes in the `intersection` of a `target element` with `an ancestor element or with a top-level document's viewport`.

```ts
const trigger = useRef<HTMLSpanElement>(null);
useEffect(() => {
  const observer = new IntersectionObserver(
    async (
      entries: IntersectionObserverEntry[],
      observer: IntersectionObserver
    ) => {
      const element = entries[0];
      if (element.isIntersecting && trigger.current) {
        observer.unobserve(trigger.current); // prevent to trigger another fetch request while fetching more posts
        setIsLoading(true);
        const newProducts = await getMoreProducts(page + 1);
        if (newProducts.length !== 0) {
          setPage((prev) => prev + 1); // trigger useEffect again
          setProducts((prev) => [...prev, ...newProducts]);
        } else {
          setIsLastPage(true);
        }
        setIsLoading(false);
      }
    },
    {
      threshold: 1.0, // fire on 100% scrolled
    }
  );
  if (trigger.current) {
    observer.observe(trigger.current);
  }
  return () => {
    observer.disconnect(); // clean on unmount
  };
}, [page]);
```

# 11 PRODUCT UPLOAD

## 11.0 Introduction

```sh
mkdir touch app/products/add/
touch app/products/add/page.tsx
```

- Clicking label triggers hidden file input

```ts
// app/products/add/page.tsx
<label
  htmlFor="photo"
  className="border-2 aspect-square flex items-center justify-center flex-col text-neutral-300 border-neutral-300 rounded-md border-dashed cursor-pointer"
>
  <PhotoIcon className="w-20" />
  <div className="text-neutral-400 text-sm">사진을 추가해주세요.</div>
</label>
<input
  onChange={onImageChange}
  type="file"
  id="photo"
  name="photo"
  accept="image/*"
  className="hidden"
/>
```

## 11.1 Form Action

```sh
touch app/products/add/actions.ts
```

```ts
// app/products/add/page.tsx
const onImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const {
    target: { files },
  } = event;
  if (!files) {
    return;
  }
  const file = files[0];
  const url = URL.createObjectURL(file);
  setPreview(url);
};
```

### Challenge

1. validate if user uploaded `image` type

```ts
if (file.type.split("/")[0] !== "image") {
  alert("이미지 파일만 업로드 가능합니다."); // TODO: toast
  return;
}
```

2. limit size to 2MB

```ts
if (file.size > 1024 * 1024 * 5) {
  alert("5MB 이하의 이미지만 업로드 가능합니다."); // TODO: toast
  return;
}
```

## 11.2 Product Upload

- use zod validation on server side
  - coerce price from string to nubmer
- upload to filesystem just for now

```ts
// app/products/add/actions.ts
if (data.photo instanceof File) {
  const photoData = await data.photo.arrayBuffer();
  await fs.appendFile(`./public/${data.photo.name}`, Buffer.from(photoData));
  data.photo = `/${data.photo.name}`;
}
```

## 11.3 Images Setup

- duplicated & expensive way

```
User -> Server -> CF
```

- better way to save packets of Server

```
User -> Server -> UploadURL(to CF) -> User -> CF(by UploadURL)
```

### CloudFlare

- Purchase $5 plan -> Images -> Overview -> Use API -> [Get an API token here](https://dash.cloudflare.com/profile/api-tokens) -> Create Token -> Read and write to Cloudflare Stream and Images (Use template) -> Remove Account Analytics -> Continue to summary -> Create Token -> Copy `token` to `CLOUDFLARE_API_KEY` at `.env`
- Copy `Account ID` and `Account hash` to `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLASRE_ACCOUNT_HASH` at `.env`

## 11.4 Upload URLs

```ts
// app/products/add/actions.ts
export async function getUploadUrl() {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v2/direct_upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_KEY}`,
      },
    }
  );
  const data = await response.json();
  return data;
}
```

## 11.5 Image Upload

- copy Image Delivery URL to CLOUDFLARE_IMAGE_URL at .env
- add `avatar` variant on cloudflare
- intercept submit and upload photo to cloudfare -> insert into DB

```ts
const interceptAction = async (_: any, formData: FormData) => {
  const file = formData.get("photo");
  if (!file) {
    return;
  }
  const cloudflareForm = new FormData();
  cloudflareForm.append("file", file);
  const response = await fetch(uploadUrl, {
    method: "post",
    body: cloudflareForm,
  });
  console.log(await response.text());
  if (response.status !== 200) {
    return;
  }
  const photoUrl = `${process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGE_URL}/${photoId}`;
  formData.set("photo", photoUrl);

  return uploadProduct(_, formData);
};
```

## 11.6 Variants

- https://dash.cloudflare.com/{id}/images/variants
- Or use Flexible variants

```ts
// app/products/[id]/page.tsx
src={`${product.photo}/width=500,height=500`}

// components/list-product.tsx
src={`${photo}/width=100,height=100`}
```

## 11.8 RHF Refactor

```
npm i react-hook-form @hookform/resolvers
touch app/products/add/schema.ts
```

- merge RHF with zod
- remove useFormState -> onValid calls `await onSubmit`

```ts
// app/products/add/page.tsx
const {
  register,
  handleSubmit,
  setValue,
  formState: { errors },
} = useForm<ProductType>({
  resolver: zodResolver(productSchema),
});
```

```ts
const onImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
  setFile(file); // keep File as state
  ..
  setValue("photo", `${process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGE_URL}/${id}`); // set photoURL on form
..
const onSubmit = handleSubmit(async (data: ProductType) => {
  ..
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("price", data.price + "");
  formData.append("description", data.description);
  formData.append("photo", data.photo);

  return uploadProduct(formData); // insert form to database
..
const onValid = async () => {
    await onSubmit();
};
..
<form action={onValid} className="p-5 flex flex-col gap-5">
..
  {errors.photo?.message}
```

## 11.9 Recap

- RHF uses ref which is not normal prop
- To pass ref to functional component -> wrap with forwardRef

  - it exposes a DOM node to a parent component

# 12. MODALS

## 12.1 Intercepting Routes

```sh
mv "app/(tabs)/products/" "app/(tabs)/home/"
mkdir -p "app/(tabs)/home/(..)products/[id]/"
touch "app/(tabs)/home/(..)products/[id]/page.tsx"
```

- `(..)products/[id]` means if it matches with `../products/[id]`, intercept and show this component!
  - only affect for route, not for directory like `(tabs)`
- if refresh on intercept route, it goes to original page

## 12.2 Intercepting Recap

- [intercepting-routes](https://nextjs.org/docs/app/building-your-application/routing/intercepting-routes)

```
(.) to match segments on the same level
(..) to match segments one level above
(..)(..) to match segments two levels above
(...) to match segments from the root app directory
```

```sh
mkdir -p "app/(tabs)/home/(.)recent/" \
"app/(tabs)/home/recent/"
touch "app/(tabs)/home/(.)recent/page.tsx" \
"app/(tabs)/home/recent/page.tsx"
mv "app/(tabs)/home/(..)products/" "app/(tabs)/home/(...)products/"
```

## 12.3 Parallel Routes

- `@{folder}` simultaneously or conditionally render one or more pages within the same layout.
- passed as props to the shared parent layout
- but if refreshes -> 404

```sh
mkdir app/@potato/
touch app/@potato/page.tsx
```

## 12.4 Default Routes

```sh
touch app/@potato/default.tsx
```

- Slot should have same folder structure with route
  - eg) /home == @potato/home
  - Slots do not affect the URL structure
- `@potato/Page.tsx` -> only root is matching
- To handle unmatched cases, use default page returning null

```
Soft Navigation: During client-side navigation, Next.js will perform a partial render, changing the subpage within the slot, while maintaining the other slot's active subpages, even if they don't match the current URL.

Hard Navigation: After a full-page load (browser refresh), Next.js cannot determine the active state for the slots that don't match the current URL. Instead, it will render a default.js file for the unmatched slots, or 404 if default.js doesn't exist.
```

## 12.5 Modal Route

- Modal = Parallel + Intercepting
  - `app/(tabs)/home/@modal/(...)products/[id]/`

```sh
rm -rf app/@potato
mkdir -p "app/(tabs)/home/@modal/(...)products/[id]/"
mv "app/(tabs)/home/(...)products/[id]/page.tsx" "app/(tabs)/home/@modal/(...)products/[id]/page.tsx"
touch "app/(tabs)/home/@modal/default.tsx" \
"app/(tabs)/home/@modal/loading.tsx" \
"app/(tabs)/home/layout.tsx"
```

```ts
// app/(tabs)/home/layout.tsx
export default function HomeLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
```

## 12.7 Modal UI

- only `<button>` is client component (for useRouter)
  - if extract it, Modal can be server component with async for server api

### Challenge

1. extract button to separated component
2. complete modal with contents

## 13.0 Introduction

- generateMetadata -> read title from db -> should be cached
- diable infinite scrolling for now (`components/product-list.tsx:54:61`)
- remove `take: 1`, fetch all for now (`app/(tabs)/home/page.tsx`)

## 13.1 nextCache

- unstable_cache supports Server-side cache

```ts
// https://nextjs.org/docs/app/api-reference/functions/unstable_cache
import { getUser } from './data';
import { unstable_cache } from 'next/cache';

const getCachedUser = unstable_cache(
  async (id) => getUser(id), // fetchData
  ['my-app-user'] // keyParts
  // options: {tag, revalidate}
);

export default async function Component({ userID }) {
  const user = await getCachedUser(userID);
  ...
}
```

## 13.2 revalidate

- If past revalidate time, fetch again else keep reading from cache

```ts
// app/(tabs)/home/page.tsx
const getCachedProducts = nextCache(getInitialProducts, ["home-products"], {
  revalidate: 60,
});
```

## 13.3 revalidatePath

- revalidate whole page

```ts
const revalidate = async () => {
  "use server";
  revalidatePath("/home");
};
```
