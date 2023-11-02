import React, { useState } from "react";
import RecipeList from "./RecipeList";
import { trpc } from "@/utils/trpc";
import { Button } from "ui/components/button";
import { Spinner } from "ui/components/spinner";

export default function RecipeMenu() {
    const recipes = trpc.recipe.all.useQuery(undefined, {
        enabled: true,
    });
    const sharedRecipes = trpc.recipe.getShared.useQuery(undefined, {
        enabled: true,
    });

    const onRetry = () => {
        recipes.refetch();
    };

    // Set up states for the recipe tabs
    const [activeTab, setActiveTab] = useState(0);

    const tabData = [
        {
            label: "My Recipes",
        },
        {
            label: "Shared with me",
        },
    ];

    return (
        <>
            {recipes.isLoading || sharedRecipes.isLoading ? (
                <div className="m-auto">
                    <Spinner size="large" />
                </div>
            ) : recipes.isError || sharedRecipes.isError ? (
                <div className="m-auto flex flex-col gap-3">
                    <h2 className="font-semibold text-lg text-foreground">
                        Failed to fetch info
                    </h2>
                    <Button color="danger" size="medium" onClick={onRetry}>
                        Retry
                    </Button>
                </div>
            ) : (
                <div className="">
                    {/* Tab buttons */}
                    <ul className="flex pb-5">
                        {tabData.map((tab, index) => (
                            <li className="-mb-px mr-3" key={index}>
                                <a
                                    href="#"
                                    onClick={() => setActiveTab(index)}
                                    className={`bg-background inline-block py-2  px-4 ${
                                        activeTab === index
                                            ? " text-primary hover:bg-accent font-semibold border border-primary rounded-lg text-sm"
                                            : " hover:bg-accent hover:text-secondary-foreground font-semibold border border-gray-300 rounded-lg text-sm"
                                    }`}
                                >
                                    {tab.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                    {/* Tab content */}
                    <div className="p-4">
                        {tabData.map((tab, index) => (
                            <div
                                key={index}
                                className={`${
                                    activeTab === index ? "" : "hidden"
                                }`}
                            >
                                {activeTab === 0 && (
                                    <RecipeList data={recipes.data} />
                                )}
                                {activeTab === 1 && (
                                    <RecipeList data={sharedRecipes.data} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};
