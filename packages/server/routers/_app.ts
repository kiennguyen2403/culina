import { groupRouter } from "./group/group";
import { chatRouter } from "./chat";
import { router } from "../trpc";
import { accountRouter } from "./account";
import { uploadRouter } from "./upload";
import { dmRouter } from "./dm";
import { interestRouter } from "./interest";
import { recipeRouter } from "./recipe";
import { postRouter } from "./post";
import { userRouter } from "./user";

export const appRouter = router({
  chat: chatRouter,
  group: groupRouter,
  account: accountRouter,
  upload: uploadRouter,
  dm: dmRouter,
  interest: interestRouter,
  recipe: recipeRouter,
  post: postRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
