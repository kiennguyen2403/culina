import { protectedProcedure, router } from "../trpc";
import { z } from "zod";
import db from "db/client";
import { post, postPicture, postComment } from "db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
export const postRouter = router({
  get: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
      })
    )
    .query(async ({ input }: { input: { postId: number } }) => {
      return await db
        .select({
          ...post._.columns, // Use the actual columns of the post table
          pictures: postPicture.picture_path,
          comments: postComment.comment_text,
        })
        .from(post)
        .leftJoin(postPicture, eq(postPicture.post_id, post.post_id))
        .leftJoin(postComment, eq(postComment.post_id, post.post_id))
        .where(eq(post.post_id, input.postId));
    }),

  getAll: protectedProcedure.query(async () => {
    return await db
      .select({
        ...(post as typeof post._.columns),
        pictures: postPicture.picture_path,
        comments: postComment.comment_text,
      })
      .from(post)
      .orderBy(desc(post.post_id))
      .leftJoin(postPicture, eq(postPicture.post_id, post.post_id))
      .leftJoin(postComment, eq(postComment.post_id, post.post_id));
  }),

  getLatestInsertedId: protectedProcedure.query(async () => {
    const latestPostIdQuery = await db
      .select() // Use the actual primary key column name
      .from(post)
      .orderBy(desc(post.post_id)) // Order by the primary key column
      .limit(1);

    if (latestPostIdQuery.length > 0) {
      const latestPostId = latestPostIdQuery[0].post_id; // Use the actual primary key column name
      return { post_id: latestPostId };
    } else {
      return { post_id: null };
    }
  }),

  create: protectedProcedure
    .input(
      z.object({
        user_id: z.string(),
        content: z.string(),
      })
    )
    .mutation(
      async ({ input }: { input: { user_id: string; content: string } }) => {
        return await db.insert(post).values({
          user_id: input.user_id,
          content: input.content,
          post_likes: 0,
        });
      }
    ),

  update: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
        content: z.string(),
      })
    )
    .mutation(
      async ({ input }: { input: { postId: number; content: string } }) => {
        return await db
          .update(post)
          .set({
            content: input.content,
          })
          .where(eq(post.post_id, input.postId));
      }
    ),

  delete: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
      })
    )
    .mutation(async ({ input }: { input: { postId: number } }) => {
      return await db.delete(post).where(eq(post.post_id, input.postId));
    }),

  getAllComments: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
      })
    )
    .query(async ({ input }: { input: { postId: number } }) => {
      const comments = await db
        .select({
          user_id: postComment.user_id,
          comment_text: postComment.comment_text,
        })
        .from(postComment)
        .where(eq(postComment.post_id, input.postId));

      return comments;
    }),

  increaseLikes: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
      })
    )
    .mutation(async ({ input }: { input: { postId: number } }) => {
      await db
        .update(post)
        .set({
          post_likes: sql`${post.post_likes} + 1`, // Increment likes by 1
        })
        .where(eq(post.post_id, input.postId));

      return { message: "Likes increased" };
    }),

  decreaseLikes: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
      })
    )
    .mutation(async ({ input }: { input: { postId: number } }) => {
      await db
        .update(post)
        .set({
          post_likes: sql`${post.post_likes} - 1`, // Decrement likes by 1
        })
        .where(eq(post.post_id, input.postId));

      return { message: "Likes decreased" };
    }),

  getAllPicturesOfPost: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
      })
    )
    .query(async ({ input }: { input: { postId: number } }) => {
      try {
        const pictures = await db
          .select({
            ...(postPicture as typeof postPicture._.columns),
          })
          .from(postPicture)
          .where(eq(postPicture.post_id, input.postId));

        return pictures;
      } catch (error) {
        console.error(error);
        throw new Error("Error getting post pictures of the post");
      }
    }),

  createPicture: protectedProcedure
    .input(
      z.object({
        post_id: z.number(),
        picture_path: z.string(), // Add the picture_path field
        // You can add any other required fields for picture creation here
      })
    )
    .mutation(
      async ({
        input,
      }: {
        input: { post_id: number; picture_path: string /* Other fields */ };
      }) => {
        try {
          // Insert the new post picture into the database
          const pictureId = await db.insert(postPicture).values({
            post_id: input.post_id,
            picture_path: input.picture_path, // Use the provided picture_path
          });

          return { picture_id: pictureId };
        } catch (error) {
          console.error(error);
          throw new Error("Error creating post picture");
        }
      }
    ),
  createComment: protectedProcedure
    .input(
      z.object({
        user_id: z.string(), // User ID of the commenter
        post_id: z.number(), // ID of the post the comment is related to
        comment_text: z.string(), // The text of the comment
      })
    )
    .mutation(
      async ({
        input,
      }: {
        input: { user_id: string; post_id: number; comment_text: string };
      }) => {
        try {
          // Insert the new comment into the database
          const commentId = await db.insert(postComment).values({
            user_id: input.user_id,
            post_id: input.post_id,
            comment_text: input.comment_text,
          });

          return { comment_id: commentId };
        } catch (error) {
          console.error(error);
          throw new Error("Error creating a new comment");
        }
      }
    ),
});
