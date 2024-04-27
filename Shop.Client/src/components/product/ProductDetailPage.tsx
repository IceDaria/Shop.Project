import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { IProduct } from '@Shared/types';

const ProductDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<IProduct | null>(null); // Указываем тип IProduct | null
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get<IProduct>(`/api/products/${id}`); // Указываем тип данных для ответа
                setProduct(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching product:', error);
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    return (
        <div>
            {loading ? (
                <p>Loading...</p>
            ) : product ? (
                <div>
                    <h1>{product.title}</h1>
                    <p>{product.description}</p> 
                </div>
            ) : (
                <p>Product not found</p>
            )}
        </div>
    );
};

export default ProductDetailPage;