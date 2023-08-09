"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from "zod"
import { ChangeEvent, useState } from "react";
import { isBase64Image } from "@/lib/utils";
import { useUploadThing } from '@/lib/uploadthing';
import { start } from "repl";
import { usePathname, useRouter } from "next/navigation";
import { BioRhyme } from "next/font/google";
import { imageConfigDefault } from "next/dist/shared/lib/image-config";


// import { updateUser } from "@/lib/actions/user.actions";
import { ThoughtValidation } from '@/lib/validation/thought';
import { createThought } from "@/lib/actions/thought.action";

interface Props {
    user: {
        id: string;
        objectId: string;
        username: string;
        name: string;
        bio: string;
        image: string;
    };
    btnTitle: string;
}



function PostThought({ userId }: { userId: string }) {
    const router = useRouter();
    const pathname = usePathname();

    const form = useForm({
        resolver: zodResolver(ThoughtValidation),
        defaultValues: {
            thought: '',
            accountId: userId,
        }
    })

    const onSubmit = async (values: z.infer<typeof ThoughtValidation>) => {
        await createThought({
            text: values.thought,
            author: userId,
            groupId: null,
            path: pathname,
        });

        router.push("/")
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className=" mt-10 flex flex-col justify-start gap-10"
            >
                <FormField
                    control={form.control}
                    name='thought'
                    render={({ field }) => (
                        <FormItem className='flex w-full flex-col gap-3'>
                            <FormLabel className='text-base-semibold text-light-2'>
                                Content
                            </FormLabel>
                            <FormControl className="no-focus border border-dark-4 bg-dark-3 text-light-1">
                                <Textarea
                                    rows={15}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="bg-primary-500">
                    Post Thought
                </Button>
            </form>
        </Form>
    )
}

export default PostThought;