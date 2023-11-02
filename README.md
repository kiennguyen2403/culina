# Culina - Share Meaningful Meals


## Description

Culina is an innovative and versatile social app designed to bring people together over the joy of sharing a meal. In a fast-paced world where young individuals often find themselves too busy and lonely, Culina aims to bridge the gap by connecting people who are looking for meaningful mealtime experiences.
Culina's mission is to address the loneliness and busy lifestyles faced by young people today. By connecting individuals who share a common interest in food, the app aims to enhance the quality of meals and make them more meaningful. It encourages users to break away from their solitary routines and build relationships over shared meals, ultimately contributing to a happier and more connected society.

## Slogan

"Because every meal has its own story."

Culina believes that every meal is more than just food; it's an opportunity to create lasting memories, build friendships, and share stories. With Culina, you're not just sharing a meal; you're sharing experiences, laughter, and moments that enrich your life. Join Culina today to discover the stories behind every meal and make meaningful connections over food.


## Tech Stack
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Trpc](https://trpc.io/)
- [Ably](https://ably.com/)
- [Redis](https://redis.io/)
- [Cloudinary](https://cloudinary.com/)
- [Drizzle ORM](https://drizzle.dev/)



This repository is a monorepo ([Turborepo](https://turbo.build/)).


## Key Features

- **Real-Time Chat:** Culina offers a real-time chat feature that allows users to engage in conversations with potential meal companions. This instant messaging functionality makes it easy to coordinate and plan meal meetups seamlessly.

- **Send Files and Images:** Users can share files, photos, and images with their meal companions, making it simple to share recipes, recommendations, or even showcase the delicious meals they're about to enjoy.

- **Creating Group Chat:** Culina enables users to create group chats, perfect for organizing larger meal gatherings or potluck events. Plan your meals with friends, family, or new acquaintances effortlessly.

- **Video Calling:** For those who prefer a more immersive experience, Culina offers video calling, allowing users to interact face-to-face, no matter where they are. This feature is ideal for sharing cooking tips or simply enjoying a virtual meal together.

- **New feed:** Share your culinary adventures with the Culina community through the new feed. Upload memorable moment of your cooking skills, meal preparation, or even your mealtime conversations.




## Play with it Locally

Culina integrated with many third-party service for supporting wide spectrum of features and work perfectly on serverless environment.

Thus, you have to register an account for each services in order to setup the project correctly before playing with it locally.
Please fill all environment variables in the [.env.example](/.env.example).

### Upstash

Create a Redis database at their [website](https://upstash.com) and get `REDIS_URL`, `REDIS_TOKEN` from the console.

### Ably Realtime

Create a new project on https://ably.com, paste `ABLY_API_KEY` into environment varibles.

### PlanetScale

By default, it uses Drizzle ORM with PlanetScale for database. You may use other providers if you prefer.

Create a MySQL database at their [dashboard](https://planetscale.com) and get your `DATABASE_URL` and `DATABASE_PUSH_URL`.

> Note
>
> `DATABASE_PUSH_URL` is used for pushing changes which has pool connections disabled.

### Cloudinary

Create a new project on https://cloudinary.com, copy the cloud name, key and API secret.

### Next Auth

Fill `NEXTAUTH_URL` and `NEXTAUTH_SECRET`, read their [docs](https://next-auth.js.org/getting-started/example) for further details.

Currently, only Github OAuth is supported. Follow [this guide](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps) to setup the OAuth App on Github, generate a `GITHUB_ID` with `GITHUB_SECRET`.

### Development Mode

Run `pnpm run dev` and edit files to see changes.

### Build from Source

This project uses Turborepo and PNPM.

```bash
pnpm run build
```

It should be able to deploy on Vercel or any other platforms.
