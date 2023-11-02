import { useEffect, useState } from "react";
import Ably from "ably/promises";
import WidgetWrapper from "./WidgetWrapper";
import CommentWidget from "./CommentWidget";
import { trpc } from "@/utils/trpc";
import { Button } from "@mui/material";
const ably = new Ably.Realtime(
  process.env.ABLY_API_KEY
); // Replace with your Ably API key
const CommentsWidget = ({ post }) => {
  const [comments, setComments] = useState<
    {
      user_id: string;
      comment_text: string;
    }[]
  >([]);
  const [newComment, setNewComment] = useState("");
  const post_id = post.post_id;
  const userProfile = getUserProfile();
  // const commentsList = getAllComments(post_id);
  // console.log(commentsList);

  const getCommentsQuery = trpc.post.getAllComments.useQuery({
    postId: post_id,
  });

  useEffect(() => {
    if (getCommentsQuery.data) {
      setComments(getCommentsQuery.data);
    }
    const channel = ably.channels.get(post_id);
    channel.attach();

    // Listen for new comments
    channel.subscribe("newComment", (message) => {
      console.log(message.data);
      // Update the comments when a new comment is received
      setComments((prevComments) => [...prevComments, message.data]);

      console.log(comments);
    });

    return () => {
      // Clean up the Ably subscription
      channel.unsubscribe("newComment");
    };
  }, [post_id, getCommentsQuery.data]);

  const sendCommentQuery = trpc.post.createComment.useMutation();
  function handleSendComment() {
    // Send the comment to the Ably channel
    sendCommentQuery.mutate({
      user_id: userProfile?.id,
      post_id: post.post_id,
      comment_text: newComment,
    });
    const channel = ably.channels.get(post_id);
    channel.publish("newComment", {
      user_id: userProfile?.id,
      comment_text: newComment,
    });

    // Clear the input field
    setNewComment("");
  }

  return (
    <WidgetWrapper
      m="2rem 0"
      width="100%"
      className="shadow-xl shadow-brand-500/10 mb-10"
    >
      {comments.map((comment) => (
        <CommentWidget comment={comment}></CommentWidget>
      ))}
      <input
        style={{
          width: "85%",
          height: "3rem",
          borderRadius: "2rem",
          padding: "1rem 2rem",
        }}
        className="border-4 border-indigo-500/100 placeholder-muted-foreground"
        placeholder="Comment..."
        type="text"
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            handleSendComment();
          }
        }}
      />
      <Button
        className=" border shadow-xl shadow-brand-500/10 bg-card"
        onClick={handleSendComment}
        disabled={!post}
        sx={{
          borderRadius: "1rem",
          border: "2px solid blue",
          ml: "5%",
          width: "10%",
        }}
      >
        <span className="text-muted-foreground">Send</span>
      </Button>
    </WidgetWrapper>
  );
};

function getUserProfile() {
  const query = trpc.account.get.useQuery();

  return query.data ?? null;
}

export default CommentsWidget;
