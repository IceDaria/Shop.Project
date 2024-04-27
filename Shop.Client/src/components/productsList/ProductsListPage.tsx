import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IProduct } from "@Shared/types";

const ProductsListPage = () => {
    const [products, setProducts] = useState<IProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get<IProduct[]>('/api/products');
                setProducts(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching products:', error);
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div>
            <h1>Products List</h1>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <ul>
                    {products.map(product => (
                        <li key={product.id}>{product.title}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ProductsListPage;