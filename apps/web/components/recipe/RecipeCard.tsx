import Link from "next/link";
import React from "react";

export const RecipeCard = ({
    id,
    name,
    image,
    description,
}: {
    id: number;
    name: string;
    image: string;
    description: string;
}) => {
    return (
        <div className="w-1/3">
            <div className="w-64 h-64 rounded overflow-hidden shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-105 cursor-pointer bg-card">
                <Link href={`/recipe/${id}`}>
                    <div className="h-32 overflow-hidden">
                        <img className="w-full" src={image} alt={name} />
                    </div>

                    <div className="px-6 py-4">
                        <div className="font-bold text-xl mb-2">{name}</div>
                        <p className="text-secondary-foreground text-base truncate">
                            {description}
                        </p>
                    </div>
                </Link>
            </div>
        </div>
    );
};
