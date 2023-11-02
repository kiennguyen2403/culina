import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import React from "react";
import { groupIcon } from "shared/media/format";
import { SimpleDialog } from "ui/components/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "ui/components/tabs";
import { DirectMessageContextMenu } from "../menu/DirectMessageMenu";
import { Avatar } from "ui/components/avatar";
import { Share2Icon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

export default function ShareListModal({
    recipeId,
    isOpen,
    onClose,
}: {
    recipeId: number;
    isOpen: boolean;
    onClose: () => void;
}) {
    const query = trpc.group.all.useQuery(undefined, { enabled: false });
    const dm = trpc.dm.channels.useQuery(undefined, { enabled: false });

    const router = useRouter();
    // Function to handle the redirect
    const redirectToLink = (href: string) => {
        // Replace '/destination' with the actual URL you want to redirect to
        router.push(href);
    };

    return (
        <SimpleDialog
            title={"Share your recipe with others!"}
            description={""}
            open={isOpen}
            onOpenChange={onClose}
        >
            <Tabs defaultValue="group" className="mt-2">
                <TabsList>
                    <TabsTrigger value="group">Group</TabsTrigger>
                    <TabsTrigger value="friend">User</TabsTrigger>
                </TabsList>
                <TabsContent value="group" className="flex flex-col gap-1">
                    {query.data?.map((group) => {
                        const groupId = group.id;
                        const groupMutation = useShareGroupMutation(group.channel_id, () => redirectToLink(`/chat/${groupId}`));
                        return (
                            <ShareItem
                                onShare={() => {
                                    groupMutation.mutate({ groupId, recipeId });
                                }}
                                key={group.id}
                                description={group.last_message?.content}
                                image={groupIcon.url(
                                    [group.id],
                                    group.icon_hash
                                )}
                            >
                                {group.name}
                            </ShareItem>
                        );
                    })}
                </TabsContent>
                <TabsContent value="friend">
                    {dm.data?.map((item) => {
                        const userId = item.user.id;
                        const userMutation = useShareUserMutation(item.id, () => redirectToLink(`/dm/${item.id}`));
                        return (
                            <DirectMessageContextMenu
                                key={item.id}
                                channelId={item.id}
                            >
                                <div>
                                    <ShareItem
                                        onShare={() => {
                                            userMutation.mutate({
                                                userId,
                                                recipeId,
                                            });
                                        }}
                                        description={item.last_message?.content}
                                        image={item.user.image}
                                    >
                                        {item.user.name}
                                    </ShareItem>
                                </div>
                            </DirectMessageContextMenu>
                        );
                    })}
                </TabsContent>
            </Tabs>
        </SimpleDialog>
    );
}

function ShareItem({
    onShare,
    image,
    description,
    children: name,
}: {
    description?: string;
    onShare: () => void;
    image: string | null;
    children: string;
}) {
    return (
        <div className="flex flex-row items-center">
            <div
                className={
                    "flex flex-row flex-grow items-center gap-2 p-1 rounded-lg text-sm transition-colors bg-accent/50 mr-2"
                }
            >
                <Avatar src={image} fallback={name} size="2sm" rounded="sm" />
                <div className="w-0 flex-1">
                    <p className="font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                        {name}
                    </p>
                    <p className="text-muted-foreground text-xs overflow-hidden text-ellipsis whitespace-nowrap">
                        {description}
                    </p>
                </div>
            </div>
            <Share2Icon
                className="cursor-pointer hover:text-primary"
                onClick={onShare}
            />
        </div>
    );
}

function useShareUserMutation(channelId: string, onSuccess: () => void) {
    const utils = trpc.useContext();

    return useMutation(
        async ({ userId, recipeId }: { userId: string; recipeId: number }) => {
            var res = await utils.client.recipe.share.mutate({
                userId,
                recipeId,
            });
            // Send message to user
            const recipeURL = `localhost:3000/recipe/${recipeId}`;
            await utils.client.chat.send.mutate({
                channelId: channelId,
                content: `Check out this recipe: ${recipeURL}`
            })
            return res;
        },
        {
            onSuccess() {
                onSuccess();
            },
        }
    );
}

function useShareGroupMutation(channelId: string, onSuccess: () => void) {
    const utils = trpc.useContext();

    return useMutation(
        async ({
            groupId,
            recipeId,
        }: {
            groupId: number;
            recipeId: number;
        }) => {
            var res = await utils.client.recipe.shareGroup.mutate({
                groupId,
                recipeId,
            });
            // Send messages to group
            const recipeURL = `localhost:3000/recipe/${recipeId}`;
            await utils.client.chat.send.mutate({
                channelId: channelId,
                content: `Check out this recipe: ${recipeURL}`
            })
            return res;
        },
        {
            onSuccess() {
                onSuccess();
            },
        }
    );
}
