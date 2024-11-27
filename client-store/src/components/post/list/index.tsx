import { useGetPostsQuery } from '../../../services/postApi';

const PostsList = () => {
    const { data: posts, /*error,*/ isLoading } = useGetPostsQuery();

    if (isLoading) return <div>Loading...</div>;
    // if (error) return <div>Error: {error.message}</div>;

    return (
        <ul>
            {posts?.map((post) => (
                <li key={post.id}>{post.title}</li>
            ))}
        </ul>
    );
};

export default PostsList;
