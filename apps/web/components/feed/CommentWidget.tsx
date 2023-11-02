import {
  ChatBubbleOutlineOutlined,
  CommentOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  ForkLeft,
  ShareOutlined,
} from "@mui/icons-material";
import { Box, Divider, IconButton, Typography, useTheme } from "@mui/material";
import FlexBetween from "./FlexBetween";
import WidgetWrapper from "./WidgetWrapper";
import { useEffect, useState } from "react";
import { trpc } from "@/utils/trpc";
import UserImage from "./UserImage";
import { useRef } from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";
import { margin } from "@mui/system";

const CommentWidget = ({ comment }) => {
  const [user, setUser] = useState<>();

  const userQuery = trpc.user.get.useQuery({ userId: comment.user_id });

  useEffect(() => {
    if (userQuery.data) {
      setUser(userQuery.data);
      console.log(userQuery.data);
    }
  }, [userQuery.data]);
  return (
    <Box mb="1rem" className="p-4 bg-muted shadow-md rounded-lg">
      <div className="flex items-center">
        {user && user.at(0) && (
          <UserImage image={user.at(0).image} size="30px" />
        )}
        <Typography
          variant="h6"
          style={{
            marginLeft: "1rem",
          }}
          fontWeight="500"
          className=" text-primary"
        >
          {comment.comment_text}
        </Typography>
      </div>
    </Box>
  );
};
export default CommentWidget;
