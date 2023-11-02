import z from "zod";

export const recipeSchema = z.object({
    name: z.string(),
    description: z.string(),
    image: z.string(),
    ingredients: z.string(),
    instructions: z.string(),
    prep_time: z.number(),
    cook_time: z.number(),
    servings: z.number(),
    calories: z.number(),
});
