import { create } from "zustand";

export type PostData = {
  user_id: string;
  post_id: number;
  content: string;
  post_likes: number;
};

export type PostStore = {
  posts: PostData[];
  addPost: (post: PostData) => void;
  updatePost: (post_id: string, data: Partial<PostData>) => void;
  removePost: (post_id: string) => void;
};

export const usePostStore = create<PostStore>((set) => ({
  posts: [], // Initialize the 'posts' property as an empty array
  addPost: (post) => {
    set((state) => {
      return {
        posts: [post, ...state.posts], // Add the new post to the array
      };
    });
  },
  resetStore: (newPosts) => {
    set({ posts: newPosts });
  },
  updatePost: (post_id, data) => {
    set((state) => {
      const existingPost = state.posts.find((post) => post.post_id === post_id);
      if (!existingPost) return;

      const updatedPost = { ...existingPost, ...data };

      return {
        posts: state.posts.map((post) =>
          post.post_id === post_id ? updatedPost : post
        ),
      };
    });
  },
  removePost: (post_id) => {
    set((state) => {
      return {
        posts: state.posts.filter((post) => post.post_id !== post_id),
      };
    });
  },
}));
