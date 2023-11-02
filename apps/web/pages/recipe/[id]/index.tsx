import { trpc } from "@/utils/trpc";
import { NextPageWithLayout } from "../../_app";
import { useRouter } from "next/router";
import { useViewScrollController } from "ui/hooks/use-bottom-scroll";
import { Navbar } from "@/components/layout/Navbar";
import { AppLayout, Content } from "@/components/layout/app";
import { Recipe } from "db/schema";
import { Button } from "ui/components/button";
import { useState } from "react";
import ShareListModal from "@/components/recipe/ShareListModal";

const RecipePage: NextPageWithLayout = () => {
    const router = useRouter();
    const { id } = router.query as { id: string };

    // Set up states for the form open
    const [isSharingRecipe, setIsSharingRecipe] = useState(false);

    const query = trpc.recipe.get.useQuery({ recipeId: parseInt(id) });
    const data = query.data ?? null;
    let recipe: Recipe | null = null;
    if (data && data.length > 0) {
        recipe = data[0];
    }
    return (
        <>
            {!recipe ? (
                <div className="w-full h-full flex justify-center items-center">
                    This recipe does not exists
                </div>
            ) : (
                <div className="flex gap-10 max-w-6xl min-h-full p-2">
                    <div className="w-1/3 max-h-[40rem]">
                        <img
                            className="w-full rounded overflow-hidden shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-105"
                            src={recipe.image}
                            alt={recipe.name}
                        />
                    </div>

                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="font-bold text-4xl">
                                {recipe.name}
                            </div>
                            <div>
                                <Button color="primary" onClick={() => {setIsSharingRecipe(true)}}>
                                    Share Recipe
                                </Button>
                            </div>
                        </div>
                        <h1 className="font-semibold text-lg my-2 italic">
                            Description
                        </h1>
                        <p className="text-secondary-foreground text-base truncate">
                            {recipe.description}
                        </p>
                        <h1 className="font-semibold text-lg my-2 italic">
                            Ingredients
                        </h1>
                        <p className="text-secondary-foreground text-base truncate">
                            {recipe.ingredients}
                        </p>
                        <h1 className="font-semibold text-lg my-2 italic">
                            Instruction
                        </h1>
                        <p className="text-secondary-foreground text-base truncate">
                            {recipe.instructions}
                        </p>
                        <table className="table-auto mx-auto mt-8">
                            <thead>
                                <tr>
                                    <th className="border px-4 py-2">
                                        Preparation
                                    </th>
                                    <th className="border px-4 py-2">
                                        Cooking
                                    </th>
                                    <th className="border px-4 py-2">
                                        Servings
                                    </th>
                                    <th className="border px-4 py-2">
                                        Calories
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border px-4 py-2">
                                        {recipe.prep_time} mins
                                    </td>
                                    <td className="border px-4 py-2">
                                        {recipe.cook_time} mins
                                    </td>
                                    <td className="border px-4 py-2">
                                        {recipe.servings}
                                    </td>
                                    <td className="border px-4 py-2">
                                        {recipe.calories}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    {/* RecipeForm modal */}
                    <ShareListModal
                        recipeId={recipe.recipe_id}
                        isOpen={isSharingRecipe}
                        onClose={() => setIsSharingRecipe(false)}
                    />
                </div>
            )}
        </>
    );
};

RecipePage.useLayout = (children) => {
    return (
        <AppLayout>
            <Navbar
                breadcrumb={[
                    {
                        text: "Recipe",
                        href: `/recipe/[id]`,
                    },
                ]}
            ></Navbar>
            <Content>{children}</Content>
        </AppLayout>
    );
};

export default RecipePage;
