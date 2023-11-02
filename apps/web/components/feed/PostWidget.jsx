import {
  ChatBubbleOutlineOutlined,
  CommentOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  ShareOutlined,
} from "@mui/icons-material";
import { Box, Divider, IconButton, Typography, useTheme } from "@mui/material";
import FlexBetween from "./FlexBetween";
import WidgetWrapper from "./WidgetWrapper";
import { useState } from "react";
import { trpc } from "@/utils/trpc";
import UserImage from "./UserImage";
import { useRef } from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";
import CommentsWidget from "./CommentsWidget";

const PostWidget = ({ post }) => {
  const user = useRef("");
  const [likes, setLikes] = useState(post.post_likes);
  const [IsLiked, setIsLikes] = useState(false);
  const [IsOpenComment, setIsOpenComment] = useState(false);
  const getUserQuery = trpc.user.get.useQuery({ userId: post.user_id });

  if (getUserQuery.isSuccess) {
    user.current = getUserQuery.data.at(0);
  }

  function handleLike() {}

  function handleCommentButton() {
    if (IsOpenComment == true) {
      setIsOpenComment(false);
    }
    if (IsOpenComment == false) {
      setIsOpenComment(true);
    }
  }

  const [currentImage, setCurrentImage] = useState(0);

  return (
    <WidgetWrapper
      m="2rem 0"
      width="70%"
      className="shadow-xl shadow-brand-500/10"
    >
      <FlexBetween>
        <FlexBetween gap="1rem" mt={"1.5rem"}>
          <UserImage image={user.current.image} size="55px" />
          <Box onClick={() => {}}>
            <Typography
              variant="h4"
              fontWeight="500"
              sx={{
                "&:hover": {
                  cursor: "pointer",
                },
              }}
            >
              {user.current.name}
            </Typography>
          </Box>
        </FlexBetween>
      </FlexBetween>
      <Typography variant="h4" sx={{ mt: "2rem" }}>
        {post.content}
      </Typography>
      {post.pictures && (
        <Carousel
          showStatus={false}
          showThumbs={false}
          showArrows={true}
          onChange={setCurrentImage}
          selectedItem={currentImage}
        >
          {post.pictures.map((picture, index) => (
            <div key={index}>
              <img
                className="image-frame"
                width="100%"
                height="auto"
                alt="post"
                style={{ borderRadius: "0.75rem", marginTop: "0.75rem" }}
                src={picture}
              />
            </div>
          ))}
        </Carousel>
      )}
      <FlexBetween mt="0.25rem">
        <FlexBetween gap="1rem">
          {/* <FlexBetween gap="0.3rem">
            <IconButton>
              <FavoriteBorderOutlined className="text-muted-foreground" />
            </IconButton>
            <Typography>{post.post_likes}</Typography>
          </FlexBetween> */}
        </FlexBetween>

        <IconButton>
          <CommentOutlined
            className="text-muted-foreground"
            onClick={handleCommentButton}
          />
        </IconButton>
      </FlexBetween>
      {IsOpenComment ? <CommentsWidget post={post} user={user.id} /> : <></>}
    </WidgetWrapper>
  );
};

export default PostWidget;
