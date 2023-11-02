import { protectedProcedure, router } from "../trpc";
import { z } from "zod";
import db from "db/client";
import { users } from "db/schema";
import { eq } from "drizzle-orm"; // Import the 'users' schema

export const userRouter = router({
  get: protectedProcedure
    .input(
      z.object({
        userId: z.string(), // Adjust the input type to match 'users' schema
      })
    )
    .query(async ({ input }: { input: { userId: string } }) => {
      return await db
        .select({
          ...(users as typeof users._.columns), // Use the 'users' schema columns
          // Add columns for related data as needed
        })
        .from(users)
        // Join with other tables if necessary
        .where(eq(users.id, input.userId)); // Adjust the condition as needed
    }),
  getAll: protectedProcedure.query(async () => {
    return await db
      .select({
        ...(users as typeof users._.columns), // Use the 'users' schema columns
      })
      .from(users);
  }),

  postUser: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string(),
        // Add other required fields from 'users' schema
      })
    )
    .mutation(async ({ input }: { input: { name: string; email: string } }) => {
      return await db.insert(users).values({
        name: input.name,
        email: input.email,
        // Add values for other required fields
      });
    }),
  // Add more routes as needed
});
