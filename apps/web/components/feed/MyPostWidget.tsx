import {
  EditOutlined,
  DeleteOutlined,
  ImageOutlined,
} from "@mui/icons-material";
import { Box, Divider, Typography, Button, IconButton } from "@mui/material";
import FlexBetween from "./FlexBetween";
import Dropzone from "react-dropzone";
import UserImage from "./UserImage";
import WidgetWrapper from "./WidgetWrapper";
import { useState } from "react";
import { trpc } from "@/utils/trpc";
import { v4 as uuidv4 } from "uuid";
import { S3 } from "aws-sdk";

import { usePostStore } from "@/utils/stores/post";

const MyPostWidget = ({ user }) => {
  const postStore = usePostStore();
  const [isImage, setIsImage] = useState(false);
  const [post, setPost] = useState("");
  const [images, setImages] = useState([]);
  const s3 = new S3({
    apiVersion: "2006-03-01",
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
    region: "ap-southeast-2",
    signatureVersion: "v4",
  });

  const createPostQuery = trpc.post.create.useMutation();
  const createPictureQuery = trpc.post.createPicture.useMutation();
  const getLatestPostQuery = trpc.post.getLatestInsertedId.useQuery();

  async function handlePost() {
    try {
      // Initialize FormData
      const formData = new FormData();

      // Add user ID and post content to FormData
      if (!user.id) {
        return null;
      }
      formData.append("userId", user.id);
      formData.append("content", post);
      console.log(formData.get("userId"));

      if (formData.get("userId") == null || formData.get("content") == null) {
        return false;
      }
      // Upload all selected images to S3 and get S3 endpoints
      const imageEndpoints = await Promise.all(
        images.map(async (imageFile) => {
          const ex = imageFile.name.split(".").pop();
          const Key = `${uuidv4()}.${ex}`;

          const s3Params = {
            Bucket: "culina-bucket",
            Key,
            Body: imageFile,
            Expires: 60,
            ContentType: `image/${ex}`,
          };

          await s3.upload(s3Params).promise();

          // Store the S3 endpoint in FormData
          formData.append("images", Key);

          return `https://culina-bucket.s3.amazonaws.com/${Key}`;
        })
      );
      const endpoints = await imageEndpoints;

      // Create the post
      var postData = createPostQuery.mutate({
        content: post,
        user_id: user.id,
      });

      setImages([]);
      setPost("");
      const postID = await getLatestPostQuery.data;

      console.log(postID?.post_id);

      const newPost = {
        post_id: postID?.post_id + 1,
        user_id: user.id,
        content: post,
        post_likes: 0,
        pictures: endpoints,
      };

      postStore.addPost(newPost);
      console.log(postStore.posts);

      endpoints.forEach((image) => {
        createPictureQuery.mutate({
          post_id: postID?.post_id + 1,
          picture_path: image,
        });
      });

      setImages([]);
      setPost("");
    } catch (error) {
      console.error("Error handling post:", error);
    }
  }

  const handleImageDrop = (acceptedFiles) => {
    // Add the selected images to the 'images' state
    setImages([...images, ...acceptedFiles]);
  };
  return (
    <>
      <WidgetWrapper width={"70%"} className="shadow-xl shadow-brand-500/10">
        <FlexBetween gap="1.5rem" className="placeholder-red-300">
          <UserImage image={user.image} />
          <input
            placeholder="What's on your mind..."
            className="placeholder-muted-foreground"
            onChange={(e) => setPost(e.target.value)}
            value={post}
            style={{
              width: "100%",
              borderRadius: "2rem",
              padding: "1rem 2rem",
            }}
          />
        </FlexBetween>
        {isImage && (
          <Box border={`1px`} borderRadius="5px" mt="1rem" p="1rem">
            <Dropzone
              acceptedFiles=".jpg,.jpeg,.png"
              multiple={true}
              onDrop={handleImageDrop} // Use the updated handler to handle multiple images
            >
              {({ getRootProps, getInputProps }) => (
                <FlexBetween>
                  <Box
                    {...getRootProps()}
                    p="1rem"
                    width="100%"
                    sx={{ "&:hover": { cursor: "pointer" } }}
                  >
                    <input
                      className="border-4 border-indigo-500/100"
                      {...getInputProps()}
                    />
                    {!images.length ? (
                      <p>Add Images Here</p>
                    ) : (
                      <div>
                        {images.map((image, index) => (
                          <FlexBetween key={index}>
                            <Typography>{image.name}</Typography>
                            <EditOutlined className="text-muted-foreground" />
                          </FlexBetween>
                        ))}
                      </div>
                    )}
                  </Box>
                  {images.length > 0 && (
                    <IconButton
                      onClick={() => setImages([])} // Clear the selected images
                      sx={{ width: "15%" }}
                    >
                      <DeleteOutlined className="text-muted-foreground" />
                    </IconButton>
                  )}
                </FlexBetween>
              )}
            </Dropzone>
          </Box>
        )}

        <Divider sx={{ margin: "1.25rem 0" }} />

        <FlexBetween>
          <FlexBetween gap="0.25rem" onClick={() => setIsImage(!isImage)}>
            <ImageOutlined />
            <Typography sx={{ "&:hover": { cursor: "pointer" } }}>
              Image
            </Typography>
          </FlexBetween>

          <Button
            className=" border shadow-xl shadow-brand-500/10 bg-card"
            onClick={handlePost}
            disabled={!post}
            sx={{
              borderRadius: "1rem",
              border: "2px solid blue",
            }}
          >
            <span className="text-muted-foreground">POST</span>
          </Button>
        </FlexBetween>
      </WidgetWrapper>
    </>
  );
};

export default MyPostWidget;
