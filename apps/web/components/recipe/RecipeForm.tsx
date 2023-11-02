import { trpc } from "@/utils/trpc";
import { useMutation } from "@tanstack/react-query";
import { TrashIcon } from "lucide-react";
import React, { ChangeEvent, FormEvent, useState } from "react";
import { IconButton, button } from "ui/components/button";
import { z } from "zod";
import { uploadAttachment } from "@/utils/hooks/mutations/upload-attachment";
import { SimpleDialog } from "ui/components/dialog";

const schema = z.object({
    name: z.string(),
    description: z.string(),
    image: z.custom<File>().nullable(),
    ingredients: z.string(),
    instructions: z.string(),
    prep_time: z.number(),
    cook_time: z.number(),
    servings: z.number(),
    calories: z.number(),
});

export type RecipeData = z.infer<typeof schema>;

export default function RecipeForm({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const [recipeData, setRecipeData] = useState<RecipeData>({
        name: "",
        description: "",
        image: null,
        ingredients: "",
        instructions: "",
        prep_time: 0,
        cook_time: 0,
        servings: 0,
        calories: 0,
    });

    console.log(recipeData);
    const [imageError, setImageError] = useState("");

    const handleInputChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setRecipeData({
            ...recipeData,
            [name]: value,
        });
    };

    const handleNumberInputChange = (
        e: ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;
        setRecipeData({
            ...recipeData,
            [name]: parseInt(value),
        });
    };

    const handleFileInputChange = (
        e: ChangeEvent<HTMLInputElement>,
        isRemoved?: boolean
    ) => {
        e.preventDefault();
        var image: File | null | undefined = null;
        if (!isRemoved) {
            const files = e.target.files;
            if (!files || files.length === 0) return;
            setImageError("");
            image = files[0];
        }
        setRecipeData({
            ...recipeData,
            image: image,
        });
    };
    const mutation = useCreateMutation(onClose);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        // Validate image
        if (!recipeData.image) {
            setImageError("An image of the recipe is required");
            return;
        }
        // Call a function to add the recipe using recipeData
        mutation.mutate(recipeData);

        // Clear the form data
        setRecipeData({
            name: "",
            description: "",
            image: null,
            ingredients: "",
            instructions: "",
            prep_time: 0,
            cook_time: 0,
            servings: 0,
            calories: 0,
        });
        // Close the modal
        onClose();
    };

    if (!isOpen) {
        return null;
    }

    return (
        <SimpleDialog
            title={""}
            description={""}
            open={isOpen}
            onOpenChange={onClose}
        >
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
                <div className="bg-background p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">
                        Add New Recipe
                    </h2>
                    <form onSubmit={handleSubmit}>
                        {/* Form fields for recipe input */}
                        <div className="flex mb-4">
                            <div className="w-full">
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={recipeData.name}
                                    onChange={handleInputChange}
                                    className="mt-1 px-2 py-1 text-sm block w-full rounded-md border-gray-300 shadow-sm"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                            <div className="pr-4">
                                <label
                                    htmlFor="attachment"
                                    className={button({
                                        className:
                                            "w-fit px-2 -ml-2 block text-sm font-medium text-gray-700 cursor-pointer",
                                        color: "ghost",
                                    })}
                                >
                                    Upload Image
                                </label>
                            </div>
                            <AttachmentPicker
                                value={recipeData.image}
                                onChange={handleFileInputChange}
                            />
                        </div>
                        {imageError && (
                            <div className="text-red-500 text-sm -mt-4 mb-2">
                                {imageError}
                            </div>
                        )}
                        <div className="flex mb-4">
                            <div className="mr-2">
                                <label
                                    htmlFor="description"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={recipeData.description}
                                    onChange={handleInputChange}
                                    rows={4}
                                    cols={30}
                                    className="mt-1 px-2 py-1 text-sm block w-full rounded-md border-gray-300 shadow-sm"
                                    required
                                />
                            </div>
                            <div className="ml-2">
                                <label
                                    htmlFor="ingredients"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Ingredients
                                </label>
                                <textarea
                                    id="ingredients"
                                    name="ingredients"
                                    value={recipeData.ingredients}
                                    onChange={handleInputChange}
                                    rows={4}
                                    cols={30}
                                    className="mt-1 px-2 py-1 text-sm block w-full rounded-md border-gray-300 shadow-sm"
                                    required
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <div>
                                <label
                                    htmlFor="instructions"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Instructions
                                </label>
                                <textarea
                                    id="instructions"
                                    name="instructions"
                                    value={recipeData.instructions}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="mt-1 px-2 py-1 text-sm block w-full rounded-md border-gray-300 shadow-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div className="w-full mb-4 flex">
                            <div className="w-full mr-2">
                                <label
                                    htmlFor="prep_time"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Prep Time (minutes)
                                </label>
                                <input
                                    type="number"
                                    id="prep_time"
                                    name="prep_time"
                                    value={recipeData.prep_time}
                                    onChange={handleNumberInputChange}
                                    className="mt-1 px-2 py-1 text-sm block w-full rounded-md border-gray-300 shadow-sm"
                                    required
                                />
                            </div>
                            <div className="w-full ml-2">
                                <label
                                    htmlFor="cook_time"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Cook Time (minutes)
                                </label>
                                <input
                                    type="number"
                                    id="cook_time"
                                    name="cook_time"
                                    value={recipeData.cook_time}
                                    onChange={handleNumberInputChange}
                                    className="mt-1 px-2 py-1 text-sm block w-full rounded-md border-gray-300 shadow-sm"
                                    required
                                />
                            </div>
                        </div>
                        <div className="w-full flex mb-4">
                            <div className="w-full mr-2">
                                <label
                                    htmlFor="servings"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Servings
                                </label>
                                <input
                                    type="number"
                                    id="servings"
                                    name="servings"
                                    value={recipeData.servings}
                                    onChange={handleNumberInputChange}
                                    className="mt-1 px-2 py-1 text-sm block w-full rounded-md border-gray-300 shadow-sm"
                                    required
                                />
                            </div>
                            <div className="w-full ml-2">
                                <label
                                    htmlFor="calories"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Calories
                                </label>
                                <input
                                    type="number"
                                    id="calories"
                                    name="calories"
                                    value={recipeData.calories}
                                    onChange={handleNumberInputChange}
                                    className="mt-1 px-2 py-1 text-sm block w-full rounded-md border-gray-300 shadow-sm"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="button"
                                className="mr-2 px-4 py-2 text-gray-500 hover:text-gray-700"
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                            >
                                Add Recipe
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </SimpleDialog>
    );
}

// Component for uploading files
function AttachmentPicker({
    value,
    onChange,
}: {
    value: File | null | undefined;
    onChange: (e: ChangeEvent<HTMLInputElement>, isRemoved?: boolean) => void;
}) {
    return (
        <div className="flex-grow">
            <input
                id="attachment"
                type="file"
                className="hidden"
                onChange={onChange}
                accept="image/*"
            />

            <div className="flex justify-end items-center">
                <p className="flex-grow border-b border-b-black font-medium text-sm text-foreground italic mr-2 text-right">
                    {value ? value.name : "No file chosen"}
                </p>
                {value != null && (
                    <IconButton
                        size="small"
                        color="danger"
                        onClick={(e: ChangeEvent<HTMLInputElement>) =>
                            onChange(e, true)
                        }
                    >
                        <TrashIcon className="w-4 h-4" />
                    </IconButton>
                )}
            </div>
        </div>
    );
}

function useCreateMutation(onClose: () => void) {
    const utils = trpc.useContext();

    return useMutation(
        async ({
            name,
            description,
            image,
            ingredients,
            instructions,
            prep_time,
            cook_time,
            servings,
            calories,
        }: z.infer<typeof schema>) => {
            var attachment = await uploadAttachment(utils, image!!);

            const data = await utils.client.recipe.create.mutate({
                name,
                description,
                image: attachment.url,
                ingredients,
                instructions,
                prep_time,
                cook_time,
                servings,
                calories,
            });

            return data;
        },
        {
            onSuccess() {
                onClose();
            },
        }
    );
}