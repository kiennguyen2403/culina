import { Avatar } from "ui/components/avatar";
import { Button } from "ui/components/button";
import { ImagePicker } from "@/components/input/ImagePicker";
import { AppLayout, Content } from "@/components/layout/app";
import { useProfile } from "@/utils/hooks/use-profile";
import { trpc } from "@/utils/trpc";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { NextPageWithLayout } from "./_app";
import { User } from "db/schema";
import { Serialize } from "shared/types";
import { useUpdateProfileMutation } from "@/utils/hooks/mutations/update-profile";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { input } from "ui/components/input";
import { Navbar } from "@/components/layout/Navbar";
import { set } from "zod";
import { get } from "http";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger } from "ui/components/select";
import { useMutation } from "@tanstack/react-query";
import { useInterests } from "@/utils/hooks/use-interest";
import { MultiSelect } from "react-multi-select-component";

interface interestResponse {
    value: string,
    label: string
}


const options = [
    { label: "Programming", value: "Programming" },
    { label: "Music", value: "Music" },
    { label: "Sports", value: "Sports"},
];


const Settings: NextPageWithLayout = () => {
    const { status, profile } = useProfile();
    const [edit, setEdit] = useState(false);
    const interests: interestResponse[] = profile ? useInterests(profile.id) : [];
    console.log(interests);

    if (status !== "authenticated") return <></>;

    if (edit) {
        return (
            <UpdateProfile profile={profile} onCancel={() => setEdit(false)} defaultSelectedInterests={interests} />
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <Avatar size="large" src={profile.image} fallback={profile.name} />
            <div>
                <h2 className="font-bold text-2xl">{profile.name}</h2>
                <p className="text-accent-800 dark:text-accent-600 text-base">
                    {profile.email}
                </p>
            </div>
            <div className="flex flex-row gap-3">
                <Button color="primary" onClick={() => setEdit(true)}>
                    Edit Profile
                </Button>
                <Button color="danger" onClick={() => signOut()}>
                    Logout
                </Button>
            </div>
            <fieldset className="flex flex-col gap-3 items-start">
                <div>
                    <label
                        htmlFor="theme"
                        className="font-medium text-base text-foreground"
                    >
                        Interests
                    </label>
                    <p className="text-sm text-muted-foreground">
                        Interest topics
                    </p>
                    {Array.isArray(interests) && interests.map((interest, index) => {
                        return (
                            <div key={index}>
                                <p>{interest.value}</p>
                            </div>
                        );
                    })}
                </div>

            </fieldset>

            <fieldset className="flex flex-col gap-3 items-start">
                <div>
                    <label
                        htmlFor="theme"
                        className="font-medium text-base text-foreground"
                    >
                        Appearance
                    </label>
                    <p className="text-sm text-muted-foreground">
                        Change the color theme of UI
                    </p>
                </div>
                <ThemeSwitch id="theme" />
            </fieldset>
        </div>
    );
};

function UpdateProfile({
    profile,
    onCancel,
    defaultSelectedInterests
}: {
    profile: Serialize<User>;
    defaultSelectedInterests: interestResponse;
    onCancel: () => void;
}) {
    const [name, setName] = useState<string>(profile.name);
    const [avatar, setAvatar] = useState<string | undefined>();
    const [interests, setInterests] = useState<string[]>([]);
    const utils = trpc.useContext();
    const mutation = useUpdateProfileMutation();
    const [selectedInterests, setSelectedInterest] = useState(defaultSelectedInterests);
    const postInterestMutation = trpc.interest.postUserInterest.useMutation();
    const onSave = async () => {
        mutation.mutate(
            { name, avatar },
            {
                onSuccess(data) {
                    utils.account.get.setData(undefined, () => data);
                    onCancel();
                },
            }
        );
        
        if (selectedInterests.length > 0) {
            try {
                const data = await postInterestMutation.mutateAsync({
                    userId: profile.id,
                    listSelectedInterests: selectedInterests
                });
                console.log(data);
                // Successfully posted the new interest
            } catch (error) {
                console.error("Error posting interest:", error);
            }
        }
        
    };

    return (
        <div className="flex flex-col gap-3 max-w-3xl">
            <ImagePicker
                previewClassName="max-w-[150px] max-h-[150px]"
                value={avatar ?? profile.image}
                onChange={setAvatar}
            />

            <fieldset>
                <label
                    htmlFor="username"
                    className="text-sm font-medium text-foreground"
                >
                    Username
                </label>
                <input
                    id="username"
                    placeholder={profile.name}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={input()}
                />
            </fieldset>
            <div className="text-black">
                <h1>Select Fruits</h1>
                <pre>{JSON.stringify(selectedInterests)}</pre>
                <MultiSelect
                    options={options}
                    value={selectedInterests}
                    onChange={setSelectedInterest}
                    labelledBy="Select"  
                />
            </div>
            <div className="flex flex-row gap-3 mt-3">
                <Button
                    color="primary"
                    onClick={onSave}
                    isLoading={mutation.isLoading}
                >
                    Save Changes
                </Button>
                <Button onClick={onCancel}>Cancel</Button>
            </div>
            <div>
                <label
                    htmlFor="theme"
                    className="font-medium text-base text-foreground"
                >
                    Interests
                </label>
                <p className="text-sm text-muted-foreground">
                    Interest topics
                </p>
                <div className="flex flex-row gap-3 mt-3">
                    {interests.map((interest, index) => {
                        return (
                            <Button key={index} onClick={() => addInterest(profile.id, [interest])}>
                                <p>#{interest}</p>
                            </Button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

Settings.useLayout = (children) => (
    <AppLayout>
        <Navbar
            breadcrumb={[
                {
                    href: "/settings",
                    text: "Settings",
                },
            ]}
        />

        <Content>{children}</Content>
    </AppLayout>
);

export default Settings;
