import { redirect } from "next/navigation";

import { fetchUserPosts } from "@/lib/actions/user.actions";

import ThoughtCard from "../cards/ThoughtCard";

interface Result {
    name: string;
    image: string;
    id: string;
    Thoughts: {
        _id: string;
        text: string;
        parentId: string | null;
        author: {
            name: string;
            image: string;
            id: string;
        };
        Group: {
            id: string;
            name: string;
            image: string;
        } | null;
        createdAt: string;
        children: {
            author: {
                image: string;
            };
        }[];
    }[];
}

interface Props {
    currentUserId: string;
    accountId: string;
    accountType: string;
}

async function ThoughtsTab({ currentUserId, accountId, accountType }: Props) {
    let result = await fetchUserPosts(accountId);

    if (!result) {
        redirect("/");
    }

    return (
        <section className='mt-9 flex flex-col gap-10'>
            {result.thoughts.map((thought: any) => (
                <ThoughtCard
                    key={thought._id}
                    id={thought._id}
                    currentUserId={currentUserId}
                    parentId={thought.parentId}
                    content={thought.text}
                    author={
                        accountType === "User"
                            ? { name: result.name, image: result.image, id: result.id }
                            : {
                                name: thought.author.name,
                                image: thought.author.image,
                                id: thought.author.id,
                            }
                    }
                    group={thought.group}
                    createdAt={thought.createdAt}
                    comments={thought.children}
                />
            ))}
        </section>
    );
}

export default ThoughtsTab;
