import React, { useState } from 'react';
import axios from 'axios';

interface CommentFormProps {
    productId: string;
    onCommentSubmit: () => void; // Функция обратного вызова для обновления списка комментариев
}

const CommentForm: React.FC<CommentFormProps> = ({ productId, onCommentSubmit }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [body, setBody] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            await axios.post('/api/comments', {
                name,
                email,
                body,
                productId
            });
            // Успешно отправлено, сбросим поля формы
            setName('');
            setEmail('');
            setBody('');
            setLoading(false);
            // Вызываем функцию обратного вызова для обновления списка комментариев
            onCommentSubmit();
        } catch (error) {
            console.error('Error submitting comment:', error);
            setLoading(false);
            alert('Failed to submit comment. Please try again.');
        }
    };

    return (
        <form className='comment-form' onSubmit={handleSubmit}>
            <h2>Add your comment</h2>
            <div className='form-wrapper'>
                <label className='form-label' htmlFor="name">Title:</label>
                <input
                    className='form-input'
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
            <div className='form-wrapper'>
                <label className='form-label' htmlFor="email">Email:</label>
                <input
                    className='form-input'
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div className='form-wrapper'>
                <label className='form-label' htmlFor="body">Comment:</label>
                <textarea
                    className='form-input'
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    required
                />
            </div>
            <button className='form-submit' type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit'}
            </button>
        </form>
    );
};

export default CommentForm;