"use server"
import { revalidatePath } from "next/cache";
import { connectToDB } from "../mongoose";
import User from "../models/user.model";
import Thought from "../models/thought.model";
import { FilterQuery, SortOrder, _FilterQuery } from "mongoose";

interface Params {
    userId: string;
    username: string;
    name: string;
    bio: string;
    image: string;
    path: string;
}

export async function updateUser({
    userId,
    username,
    name,
    bio,
    image,
    path
}: Params): Promise<void> {

    try {
        connectToDB();

        await User.findOneAndUpdate(
            { id: userId },
            {
                username: username.toLowerCase(),
                name,
                bio,
                image,
                onboarded: true,
            },
            { upsert: true }
        );

        if (path === "/profile/edit") {
            revalidatePath(path);
        }
    } catch (error: any) {
        throw new Error(`Failed to create/update user: ${error.message}`);
    }
}

export async function fetchUser(userId: string) {
    try {
        connectToDB();

        return await User
            .findOne({ id: userId })
        // .populate({
        //     path: 'groups',
        //     model: Group
        // })
    } catch (error: any) {
        throw new Error(`Failed to fetch user: ${error.message}`)

    }
}
export async function fetchUserPosts(userId: string) {
    try {
        connectToDB();

        // Find all thoughts authored by user with the given userId

        // to populate community
        const thoughts = await User.findOne({ id: userId })
            .populate({
                path: 'thoughts',
                model: Thought,
                populate: {
                    path: 'children',
                    model: Thought,
                    populate: {
                        path: 'author',
                        model: User,
                        select: 'name image id'
                    }
                }
            })

        return thoughts;
    } catch (error: any) {
        throw new Error(`Failed to fetch user posts: ${error.message}`);
    }
}

export async function fetchUsers({
    userId,
    searchString = "",
    pageNumber = 1,
    pageSize = 20,
    sortBy = "desc",
}: {
    userId: string;
    searchString?: string;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: SortOrder;
}) {
    try {
        connectToDB();

        const skipAmount = (pageNumber - 1) * pageSize;

        const regex = new RegExp(searchString, "i");

        const query: FilterQuery<typeof User> = {
            id: { $ne: userId },
        };

        if (searchString.trim() !== "") {
            query.$or = [
                { username: { $regex: regex } },
                { name: { $regex: regex } },
            ];
        }

        const sortOptions = { createdAt: sortBy };

        const usersQuery = User.find(query)
            .sort(sortOptions)
            .skip(skipAmount)
            .limit(pageSize);

        const totalUsersCount = await User.countDocuments(query);

        const users = await usersQuery.exec();

        const isNext = totalUsersCount > skipAmount + users.length;

        return { users, isNext };
    } catch (error: any) {
        throw new Error(`Failed to fetch users: ${error.message}`)
    }
}

export async function getActivity(userId: string){
    try{
        connectToDB();
        
        // find all thoughts by the user
        const userThoughts = await Thought.find({author: userId});


        // collectall the child thght ids (replies) from the children field
        const childThoughtIds = userThoughts.reduce((acc , userThought) => {
            return acc.concat(userThought.children)
        },[])
        const replies = await Thought.find({
            _id: { $in: childThoughtIds },
            author: { $ne: userId }, // Exclude threads authored by the same user
          }).populate({
            path: "author",
            model: User,
            select: "name image _id",
          });
          return replies;

    }catch(error : any){
        throw new Error(`Failed to fetch activity: $
        {error.message}`)
    }
}