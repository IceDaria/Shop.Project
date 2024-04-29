import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IProduct } from "@Shared/types";
import { Link } from 'react-router-dom';
import Layout from '../Layout';
import ProductsListFilter from './components/ProductsListFilter';

const ProductsListPage = () => {
    const [products, setProducts] = useState<IProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [filteredProducts, setFilteredProducts] = useState<IProduct[]>([]);
    const [searchTitle, setSearchTitle] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    useEffect(() => {
        // Функция для получения информации о продуктах
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

    useEffect(() => {
        // Функция для фильтрации списка товаров по названию и стоимости
        const filterProducts = () => {
            let filtered = products.filter((product) => {
                return (
                    product.title.toLowerCase().includes(searchTitle.toLowerCase()) &&
                    (!minPrice || product.price >= parseInt(minPrice)) &&
                    (!maxPrice || product.price <= parseInt(maxPrice))
                );
            });
            setFilteredProducts(filtered);
        };

        filterProducts();
    }, [products, searchTitle, minPrice, maxPrice]);

    return (
        <Layout>
            <div className='container'>
                <h1>Products List ({products.length})</h1>

                <ProductsListFilter
                    searchTitle={searchTitle}
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    onSearchTitleChange={setSearchTitle}
                    onMinPriceChange={setMinPrice}
                    onMaxPriceChange={setMaxPrice}
                />

                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div className='products-list'>
                        {filteredProducts.map((product) => (
                            <div className='list-product' key={product.id}>
                                <Link to={`/products/${product.id}`}>
                                    {product.thumbnail ? (
                                        <img className='list-product__thumbnail' src={product.thumbnail.url} alt={product.title} />
                                    ) : (
                                        <img className='list-product__thumbnail' src="/product-placeholder.png" alt="Placeholder" />
                                    )}
                                </Link>
                                <div className='list-product__info'>
                                    <Link to={`/products/${product.id}`}>
                                        <h2 className='list-product__title'>{product.title}</h2>
                                    </Link>
                                    <p><span className='info__title'>Price</span>: {product.price}</p>
                                    <p><span className='info__title'>Comments</span>: {product.comments ? product.comments.length : 0}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ProductsListPage;