import { protectedProcedure, router } from "../trpc";
import { unknown, z } from "zod";
import db from "db/client";
import { recipes, inventory, groups, members } from "db/schema";
import { eq, and, not } from "drizzle-orm";
import { recipeSchema } from "shared/schema/recipe";
import { TRPCError } from "@trpc/server";

export const recipeRouter = router({
    create: protectedProcedure
        .input(recipeSchema)
        .mutation(async ({ ctx, input }) => {
            return await db.insert(recipes).values({
                name: input.name,
                user_id: ctx.session.user.id,
                description: input.description,
                image: input.image,
                ingredients: input.ingredients,
                instructions: input.instructions,
                prep_time: input.prep_time,
                cook_time: input.cook_time,
                servings: input.servings,
                calories: input.calories,
            });
        }),
    get: protectedProcedure
        .input(
            z.object({
                recipeId: z.number(),
            })
        )
        .query(async ({ input }: { input: { recipeId: number } }) => {
            return await db
                .select({
                    ...(recipes as typeof recipes._.columns),
                })
                .from(recipes)
                .where(eq(recipes.recipe_id, input.recipeId));
        }),
    getShared: protectedProcedure.query(async ({ ctx }) => {
        // get all recipe id
        return await db
            .select({
                ...(recipes as typeof recipes._.columns),
            })
            .from(inventory)
            .innerJoin(recipes, eq(recipes.recipe_id, inventory.recipe_id))
            .where(eq(inventory.user_id, ctx.session.user.id));
    }),
    getSharedGroup: protectedProcedure
        .input(
            z.object({
                groupId: z.number(),
            })
        )
        .query(async ({ input }: { input: { groupId: number } }) => {
            // get all recipe id
            return await db
                .select({
                    ...(recipes as typeof recipes._.columns),
                })
                .from(inventory)
                .innerJoin(recipes, eq(recipes.recipe_id, inventory.recipe_id))
                .where(eq(inventory.group_id, input.groupId));
        }),
    all: protectedProcedure.query(async ({ ctx }) => {
        return await db
            .select({
                ...(recipes as typeof recipes._.columns),
            })
            .from(recipes)
            .where(eq(recipes.user_id, ctx.session.user.id));
    }),
    update: protectedProcedure
        .input(recipeSchema)
        .mutation(async ({ ctx, input }) => {
            return await db
                .update(recipes)
                .set({
                    name: input.name,
                    description: input.description,
                    image: input.image,
                    ingredients: input.ingredients,
                    instructions: input.instructions,
                    prep_time: input.prep_time,
                    cook_time: input.cook_time,
                    servings: input.servings,
                    calories: input.calories,
                })
                .where(eq(recipes.user_id, ctx.session.user.id));
        }),

    delete: protectedProcedure.input(recipeSchema).mutation(async ({ ctx }) => {
        return await db
            .delete(recipes)
            .where(eq(recipes.user_id, ctx.session.user.id));
    }),

    share: protectedProcedure
        .input(
            z.object({
                userId: z.string(),
                recipeId: z.number(),
            })
        )
        .mutation(
            async ({
                input: { userId, recipeId },
            }: {
                input: { userId: string; recipeId: number };
            }) => {
                // Check if the combination of userId and recipeId already exists
                const existingRecord = await db
                    .select()
                    .from(inventory)
                    .where(
                        and(
                            eq(inventory.user_id, userId),
                            eq(inventory.recipe_id, recipeId)
                        )
                    );

                if (existingRecord && existingRecord.length > 0) {
                    // The record already exists, you can handle this case accordingly
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: "Recipe has already been shared",
                    });
                } else {
                    // The record doesn't exist, so insert it
                    await db.insert(inventory).values({
                        user_id: userId,
                        recipe_id: recipeId,
                    });
                    return { message: "Share successfully" };
                }
            }
        ),

    shareGroup: protectedProcedure
        .input(
            z.object({
                groupId: z.number(),
                recipeId: z.number(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            const member = await db
                .select({ member: members.user_id })
                .from(members)
                .where(
                    and(
                        eq(members.group_id, input.groupId),
                        not(eq(members.user_id, ctx.session.user.id))
                    )
                )
                .innerJoin(groups, eq(members.group_id, groups.id))
                .then((res) => res.map((item) => item.member));

            if (member == null) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Group unavailable",
                });
            }

            return db.transaction(async () => {
                member.map(async (userId) => {
                    const existingRecord = await db
                        .select()
                        .from(inventory)
                        .where(
                            and(
                                eq(inventory.user_id, userId),
                                eq(inventory.recipe_id, input.recipeId)
                            )
                        );

                    if (existingRecord && existingRecord.length > 0) {
                        // The record already exists, you can handle this case accordingly
                        return { message: "Record already exists" };
                    } else {
                        // The record doesn't exist, so insert it
                        await db.insert(inventory).values({
                            user_id: userId,
                            recipe_id: input.recipeId,
                            group_id: input.groupId,
                        });
                        return { message: "Record inserted" };
                    }
                });

                return { message: "Share successfully" };
            });
        }),
});
