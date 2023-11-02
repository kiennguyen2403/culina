import { useEffect, useState } from "react";
import PostWidget from "./PostWidget";
import { trpc } from "@/utils/trpc";
import { post } from "db/schema";
import { usePostStore } from "@/utils/stores/post";

const PostsWidget = ({ user, isProfile = false }) => {
  const [posts, setPosts] = useState([]);

  const postStore = usePostStore();
  const getAllPostsQuery = trpc.post.getAll.useQuery();
  useEffect(() => {
    if (getAllPostsQuery.isLoading) {
      // Handle loading state (optional)
      console.log("Loading data...");
    } else if (getAllPostsQuery.isError) {
      // Handle error state (optional)
      console.error("Error fetching data:", getAllPostsQuery.error);
    } else {
      // Data is available and not loading or in error state
      const postData = getAllPostsQuery.data;
      console.log(postData);

      const reducedData = postData.reduce((result, item) => {
        const postId = item.post_id;
        if (!result[postId]) {
          result[postId] = {
            post_id: postId,
            user_id: item.user_id,
            content: item.content,
            post_likes: item.post_likes,
            pictures: [],
            comments: [],
          };
        }

        if (item.pictures) {
          result[postId].pictures.push(item.pictures);
        }

        if (item.comments) {
          result[postId].comments.push(item.comments);
        }

        return result;
      }, {});

      const resultArray = Object.values(reducedData);

      resultArray.sort((a, b) => b.post_id - a.post_id);

      postStore.resetStore(resultArray);
    }
  }, [getAllPostsQuery.isSuccess]);

  return (
    <>
      {postStore.posts.map((post) => (
        <PostWidget post={post} />
      ))}
    </>
  );
};

export default PostsWidget;
