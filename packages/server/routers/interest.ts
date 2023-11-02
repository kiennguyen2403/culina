import { protectedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import db from "db/client";
// import { members, users } from "db/schema";
import { interests, userInterests } from "db/schema";
import { and, eq } from "drizzle-orm";
import { aw } from "drizzle-orm/select.types.d-e43b2599";

const interestSchema = z.array(
  z.object({
    label: z.string(),
    value: z.string(),
  })
);

export const interestRouter = router({
  get: protectedProcedure
    .input(
      z.object({
        interestId: z.number(),
      })
    )
    .query(async ({ input }: { input: { interestId: number } }) => {
      return await db
        .select({
          ...(interests as typeof interests._.columns),
        })
        .from(interests)
        .where(eq(interests.id, input.interestId));
    }),
  getAll: protectedProcedure.query(async () => {
    return await db
      .select({
        ...(interests as typeof interests._.columns),
      })
      .from(interests);
  }),
  getByUser: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ input: { userId } }: { input: { userId: string } }) => {
      let listOfUserInterests = await db
        .select({
          value: interests.name,
          label: interests.name,
        })
        .from(userInterests)
        .where(eq(userInterests.user_id, userId))
        .innerJoin(interests, eq(userInterests.interest_id, interests.id));
      return listOfUserInterests;
    }),
  postInterest: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .mutation(async ({ input: { name } }: { input: { name: string } }) => {
      return await db.insert(interests).values({
        name: name,
      });
    }),
  postUserInterest: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        listSelectedInterests: interestSchema,
      })
    )
    .mutation(
      async ({
        input: { userId, listSelectedInterests },
      }: {
        input: {
          userId: string;
          listSelectedInterests: { label: string; value: string }[];
        };
      }) => {
        console.log("Hi");
        Promise.all(
          listSelectedInterests.map((interest) =>
            handleInterest(interest, userId, db, interests, userInterests)
          )
        ).catch((err) => {
          err.message; // Oops!
        });

        // listSelectedInterests.forEach((interest) => {console.log(interest)});
      }
    ),

  // update: protectedProcedure
  //     .input(z.object({ userId: z.string(), interestId: z.number()}))
  //     .query(async ({input: {userId, interestId} }: {input: {userId: string, interestId: number }}) => {

  //      }),
});

const handleInterest = async (
  interest: { label: string; value: string },
  userId: string,
  db,
  interests,
  userInterests
) => {
  try {
    const idSelectedInterestArray = await db
      .select({
        interestId: interests.id,
      })
      .from(interests)
      .where(eq(interests.name, interest.value))
      .limit(1);

    if (!idSelectedInterestArray[0]) {
      console.log(`${interest.value} Interest does not exist`);
    }

    const idSelectedInterest = idSelectedInterestArray[0]["interestId"];

    return await db.insert(userInterests).values({
      user_id: userId,
      interest_id: idSelectedInterest,
    });

    // const userHasInterests = await checkUserHasInterests(userId, db, idSelectedInterest);

    // if (!userHasInterests) {
    //     return await db.insert(userInterests).values({
    //         user_id: userId,
    //         interest_id: idSelectedInterest,
    //     });
    // }
  } catch (err) {
    console.error(err.message);
    throw err;
  }
};

const checkUserHasInterests = async (
  userId: string,
  db,
  idSelectedInterest: number
): Promise<Boolean> => {
  const user = await db
    .select({
      userId: userInterests.user_id,
    })
    .from(userInterests)
    .where({
      "userInterests.user_id": userId,
      "userInterests.interest_id": idSelectedInterest,
    });

  return user ? true : false;
};
