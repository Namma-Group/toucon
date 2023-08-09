"use server"

import { revalidatePath } from "next/cache";
import Thought from "../models/thought.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import { Trykker } from "next/font/google";

interface Params {
    text: string,
    author: string,
    groupId: string | null,
    path: string,
}

export async function createThought({ text, author, groupId, path }: Params) {

    try {
        connectToDB();

        const createdThought = await Thought.create({
            text,
            author,
            groupId: null,
        });

        //update user model
        await User.findByIdAndUpdate(author, {
            $push: { thoughts: createdThought._id }
        })

        revalidatePath(path);

    } catch (error: any) {
        throw new Error(`Error creating thought: ${error.message}`)

    }


}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
    connectToDB();

    const skipAmount = (pageNumber - 1) * pageSize;

    const postsQuery = Thought.find({ parentId: { $in: [null, undefined] } })
        .sort({ createdat: 'desc' })
        .skip(skipAmount)
        .limit(pageSize)
        .populate({ path: 'author', model: User })
        .populate({
            path: 'children',
            populate: {
                path: 'author',
                model: User,
                select: "_id name parentid image"
            }
        })

    const totalPostsCount = await Thought.countDocuments({
        parentId: { $in: [null, undefined] }
    })

    const posts = await postsQuery.exec();

    const isNext = totalPostsCount > skipAmount + posts.length;

    return { posts, isNext };
}