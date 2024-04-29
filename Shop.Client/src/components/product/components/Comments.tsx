import React from 'react';
import { IComment } from '@Shared/types';

interface Props {
    comments: IComment[];
}

const Comments: React.FC<Props> = ({ comments }) => {
    return (
        <div>
            <h2>Comments</h2>
            <div className='comments'>
                {comments.map((comment: IComment, index: number) => (
                    <div className='comment' key={index}>
                        <div className='comment__header'>
                            <p><span className='comment__header-info'>From</span>: {comment.email}</p>
                            <p className='comment__header-info'>{comment.name}</p>
                        </div>
                        <p>{comment.body}</p>
                    </div>
                ))}
            </div>
            
        </div>
    );
};

export default Comments;