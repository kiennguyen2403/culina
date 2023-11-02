import { User } from "db/schema";
import { useSession } from "next-auth/react";
import { trpc } from "@/utils/trpc";
import { Serialize } from "shared/types";

export type Result =
    | {
          status: "authenticated";
          profile: Serialize<User>;
      }
    | {
          status: "unauthenticated" | "loading";
          profile: null;
      };

/**
 * Get user profile, as an alternative to next-auth's `useSession`
 *
 * If no requirements on realtime mutates, please use `useSession` instead
 */
export function useInterests(userId:string): any {
    const query = trpc.interest.getByUser.useQuery({
        userId: userId
      }, {
        enabled: !!userId,
        refetchOnMount: "always",
      });

    return query.data;
}
