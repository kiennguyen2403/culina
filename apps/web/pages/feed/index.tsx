import React, { use, useEffect, useState } from "react";
import { AppLayout, Content } from "@/components/layout/app";
import { NextPageWithLayout } from "../_app";
import { useRouter } from "next/router";
import { useViewScrollController } from "ui/hooks/use-bottom-scroll";
import { Navbar } from "@/components/layout/Navbar";
import { useRef } from "react";
import { Button } from "ui/components/button";
import { joinChannel } from "@/utils/handlers/realtime/call";
import { start } from "repl";
import { getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import { useChannel } from "@ably-labs/react-hooks";
import Ably from "ably";
import { connect } from "http2";
import { join } from "path";
import { trpc } from "@/utils/trpc";
import { post } from "db/schema";
import Box from "@mui/material/Box";
import MyPostWidget from "../../components/feed/MyPostWidget";
import PostsWidget from "../../components/feed/PostsWidget";
import { ThemeSwitch } from "@/components/ThemeSwitch";

const Newsfeed: NextPageWithLayout = () => {
  const utils = trpc.useContext();
  const [posts, setPosts] = useState<any[]>([]);

  const userProfile = useUserProfile();
  console.log(userProfile);
  return (
    <Box mt={"2rem"}>
      <MyPostWidget user={userProfile} />
      <PostsWidget user={userProfile} />
    </Box>
  );
};

Newsfeed.useLayout = (children) => {
  const router = useRouter();
  const conroller = useViewScrollController();
  return (
    <AppLayout>
      <Navbar
        breadcrumb={[
          {
            href: "/feed",
            text: "Feed",
          },
        ]}
      >
        <div className="max-sm:hidden flex flex-row gap-3">
          <ThemeSwitch />
        </div>
      </Navbar>
      <Content>{children}</Content>
    </AppLayout>
  );
};

function useUserProfile() {
  const query = trpc.account.get.useQuery();

  return query.data ?? null;
}

export default Newsfeed;
