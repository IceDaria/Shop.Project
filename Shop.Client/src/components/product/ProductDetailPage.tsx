import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { IProduct, IImage } from '@Shared/types';
import SimilarProducts from './components/SimilarProducts';
import Comments from './components/Comments';
import CommentForm from './components/CommentForm';
import Layout from '../Layout';

const ProductDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<IProduct | null>(null);
    const [loading, setLoading] = useState(true);
    const [similarProducts, setSimilarProducts] = useState<IProduct[]>([]);

    const fetchProduct = async () => {
        try {
            const response = await axios.get<IProduct>(`/api/products/${id}`);
            setProduct(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching product:', error);
            setLoading(false);
        }
    };

    const fetchSimilarProducts = async () => {
        try {
            const response = await axios.get(`/api/products/similar/${id}`);
            setSimilarProducts(response.data.similarProducts);
        } catch (error) {
            console.error('Error fetching similar products:', error);
        }
    };

    useEffect(() => {
        fetchProduct();
        fetchSimilarProducts();
    }, [id]);

    const handleCommentSubmit = () => {
        // Повторно загрузить продукт для обновления списка комментариев
        fetchProduct();
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!product) {
        return <p>Product not found</p>;
    }

    // Фильтруем изображения, исключая обложку (thumbnail) по id
    const otherImages = product.images ? product.images.filter((image) => image.id !== product.thumbnail?.id) : [];

    return (
        <Layout>
            <div className='container'>
                <div className='product-main'>
                    {/* Отображаем обложку (thumbnail) большим изображением, если есть, если нет, отображаем изображение-заглушку */}
                    {product.thumbnail ? (
                        <img className='product__thumbnail' src={product.thumbnail.url} alt={product.title} />
                    ) : (
                        <img className='product__thumbnail' src="/product-placeholder.png" alt="Placeholder" />
                    )}
                    <div className='product__info'>
                        <h1 className='product__title'>{product.title}</h1>
                        <p className='product__description'><span className='product-info__title'>Description</span>: {product.description}</p>
                        <p className='product__price'><span className='product-info__title'>Price</span>: {product.price}</p>
                    </div>
                </div>
                {/* Отображаем список остальных изображений (otherImages), если они есть */}
                {otherImages.length > 0 && (
                    <div>
                        <h2>Other Images</h2>
                        <div className='product__other-images'>
                            {otherImages.map((image: IImage, index: number) => (
                                <img
                                    className='other-images__image'
                                    key={index}
                                    src={image.url}
                                    alt={`Image of the product`}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Отображаем список похожих товаров */}
                {similarProducts.length > 0 && (
                    <SimilarProducts similarProducts={similarProducts} />
                )}

                {/* Отображаем комментарии */}
                {product.comments && product.comments.length > 0 && <Comments comments={product.comments} />}

                {/* Добавляем форму для добавления комментария */}
                <CommentForm productId={product.id} onCommentSubmit={handleCommentSubmit} />
            </div>
        </Layout>
    );
};

export default ProductDetailPage;