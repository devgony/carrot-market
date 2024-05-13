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
