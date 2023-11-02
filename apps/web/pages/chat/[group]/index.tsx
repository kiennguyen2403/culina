import { useRouter } from "next/router";
import { NextPageWithLayout } from "../../_app";
import {
    BookmarkIcon,
    ChefHatIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    SettingsIcon,
    VideoIcon,
} from "lucide-react";
import clsx from "clsx";
import { ChannelSendbar } from "@/components/chat/ChannelSendbar";
import { MessageList } from "@/components/chat/MessageList";
import { trpc } from "@/utils/trpc";
import { BreadcrumbItem } from "@/components/layout/group-breadcrumb";
import { ChatViewProvider } from "@/components/chat/ChatView";
import { Navbar } from "@/components/layout/Navbar";
import { AppLayout, Content } from "@/components/layout/app";
import { useViewScrollController } from "ui/hooks/use-bottom-scroll";
import Link from "next/link";
import { button } from "ui/components/button";
import { useState } from "react";
import { RecipeCard } from "@/components/recipe/RecipeCard";
import { Recipe } from "db/schema";

const GroupChat: NextPageWithLayout = () => {
    const channel_id = useChannelId();

    if (channel_id == null) return <></>;

    return (
        <MessageList
            key={channel_id}
            channelId={channel_id}
            welcome={<Welcome />}
        />
    );
};

function Welcome() {
    return (
        <div className="flex flex-col gap-3 mb-3">
            <div className="flex items-center">
                <BookmarkIcon
                    className={clsx(
                        "w-10 h-10 md:w-20 md:h-20 bg-brand-500 p-2 rounded-xl text-accent-400",
                        "dark:bg-brand-400 dark:text-accent-50"
                    )}
                />
                <div className="ml-4">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                        The beginning of this Story
                    </h1>
                    <p className="text-accent-800 dark:text-accent-600 text-lg">
                        Let&apos;s send your first message here
                    </p>
                </div>
            </div>
        </div>
    );
}

GroupChat.useLayout = (children) => {
    const router = useRouter();
    const { query } = router;
    console.log(query);
    const conroller = useViewScrollController();

    return (
        <>
            <AppLayout>
                <Navbar
                    breadcrumb={[
                        {
                            text: <BreadcrumbItem />,
                            href: `/chat/[group]`,
                        },
                    ]}
                >
                    <Link
                        href={{
                            pathname: "/video/[group]",
                            query: router.query,
                        }}
                        className={button({
                            color: "ghost",
                        })}
                    >
                        <VideoIcon className="w-5 h-5" />
                    </Link>
                    <Link
                        href={{
                            pathname: "/chat/[group]/settings",
                            query: router.query,
                        }}
                        className={button({
                            color: "ghost",
                        })}
                    >
                        <SettingsIcon className="w-5 h-5" />
                    </Link>
                </Navbar>

                <Content>
                    <ChatViewProvider value={conroller}>
                        {children}
                    </ChatViewProvider>
                </Content>
                <RecipeBar />
                <Sendbar />
            </AppLayout>
        </>
    );
};

function RecipeBar() {
    const data = useRecipes();
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div
            className={`fixed -right-4 top-0 h-full  w-96 overflow-hidden shadow-lg hover:shadow-xl transition-transform duration-300 ${
                isOpen ? "translate-x-0" : "translate-x-72"
            }`}
        >
            <div className="flex h-full bg-background">
                <div
                    className="flex justify-center items-center w-20 h-full hover:bg-secondary cursor-pointer"
                    onClick={() => {
                        setIsOpen(!isOpen);
                    }}
                >
                    {isOpen ? (
                        <ArrowRightIcon className="w-8 h-8" />
                    ) : (
                        <ArrowLeftIcon className="w-8 h-8" />
                    )}
                </div>
                <div className="flex flex-col items-center mx-4 pt-16">
                    <h1 className="text-lg font-semibold mb-4 flex                                                                                                                                              ">
                        <ChefHatIcon />
                        <span className="mx-2">Shared recipes</span>{" "}
                        <ChefHatIcon />
                    </h1>
                    {data && data.length > 0 ? (
                        <div className="flex">
                            {data.map((recipe) => (
                                <RecipeCard
                                    id={recipe.recipe_id}
                                    name={recipe.name}
                                    description={recipe.description}
                                    image={recipe.image}
                                />
                            ))}
                        </div>
                    ) : (
                        <p>No recipes shared.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function Sendbar() {
    const id = useChannelId();

    if (id == null) return <></>;
    return <ChannelSendbar channelId={id} />;
}

function useChannelId() {
    const group_id = useRouter().query.group;
    const query = trpc.group.all.useQuery(undefined, { enabled: false });
    const group = query.data?.find((group) => group.id === Number(group_id));

    return group?.channel_id ?? null;
}

function useRecipes() {
    const group_id = useRouter().query.group;
    const query = trpc.recipe.getSharedGroup.useQuery({
        groupId: Number(group_id),
    });
    return query?.data ?? null;
}

export default GroupChat;
