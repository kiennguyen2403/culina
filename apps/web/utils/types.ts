import { type } from "os";
import { RouterOutput } from "./trpc";

export type DMChannel = RouterOutput["dm"]["channels"][number];

export type MessageType = RouterOutput["chat"]["messages"][number];

export type GroupWithNotifications = RouterOutput["group"]["all"][number];

export type RecipeType = RouterOutput["recipe"]["getAll"][number];

export type PostType = RouterOutput["post"]["getAll"][number];
