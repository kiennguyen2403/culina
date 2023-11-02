import { Recipe } from "db/schema";
import React, { useState } from "react";
import RecipeForm from "./RecipeForm";
import { Button } from "ui/components/button";
import { RecipeCard } from "./RecipeCard";

export default function RecipeList({ data }: { data: Array<Recipe> | null }) {
    // Set up states for the form open
    const [isAddingRecipe, setIsAddingRecipe] = useState(false);
    return (
        <>
            <div className="fixed bottom-5 right-10 p-4 z-10">
                <Button color="primary" onClick={() => setIsAddingRecipe(true)}>
                    Add Recipe
                </Button>
            </div>

            {/* List of recipes */}
            {data && data.length > 0 ? (
                <div className="flex max-w-5xl">
                    {data.map((recipe) => (
                        <RecipeCard key={recipe.recipe_id} id={recipe.recipe_id} name={recipe.name} description={recipe.description} image={recipe.image} />
                    ))}
                </div>
            ) : (
                <p>No recipes found.</p>
            )}

            {/* RecipeForm modal */}
            <RecipeForm
                isOpen={isAddingRecipe}
                onClose={() => setIsAddingRecipe(false)}
            />
        </>
    );
}
