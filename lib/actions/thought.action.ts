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

export async function fetchThoughtById(id: string){
    connectToDB();
// pop comm
    try{
        const thought = await Thought.findById(id)
        .populate({
            path: 'author',
            model: User,
            select: "_id id name image"
        })
        .populate({
            path: 'children',
            populate:[
                {
                path: 'author',
                model: User,
                select: "_id id parentId image"
            },
            {
               path: 'children',
               model: Thought,
               populate:
                {
                path: 'author',
                model: User,
                select: "_id id parentId image"
            }
            }
        
        ]
                
            }).exec();
            return thought;
        

    }catch(error: any){
        throw new Error(`Error fetching thread: ${error.message}`)
    }
}
export async function addCommentToThought(
    thoughtId: string,
    commentText: string,
    userId: string,
    path: string,
    ){
        connectToDB();

        try{
            // find origimal thought by its id
            const originalThought = await Thought.findById(thoughtId);

            if(!originalThought){
                throw new Error("Thought not found")
            }

            // create a new thought with the comment text
            const commentThought = new Thought({
                text: commentText,
                author: userId,
                parentId: thoughtId,
            })
            // save the new thought
            const savedCommentThought = await commentThought.save();

            // update the original thought to include the new comment
            originalThought.children.push(savedCommentThought._id);

            // save the original thread
            await originalThought.save();

            revalidatePath(path);

        }catch(error: any){
            throw new Error(`Error adding comment to thought: ${error.message}`)
        }
    
}