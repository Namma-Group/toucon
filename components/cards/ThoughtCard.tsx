interface Props {
    id: string;
    currentUserId: string;
    parentId: string | null;
    content: string;
    author: {
        name: string;
        image: string;
        id: string;
    }
    group: {

        name: string;
        image: string;
        id: string;
    } | null;
    createdAt: string;
    comments: {
        author: {
            image: string;
        }
    }[]
    isComment?: boolean;
}

const ThoughtCard = ({
    id,
    currentUserId,
    parentId,
    content,
    author,
    group,
    createdAt,
    comments,
}: Props) => {
    return (
        <article>
            <h2 className="text-small-regular text-light-2">
                {content}
            </h2>
        </article>
    )
}
export default ThoughtCard;