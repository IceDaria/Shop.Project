import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { IProduct } from '@Shared/types';
import Layout from '../Layout';

const HomePage = () => {
    const [productCount, setProductCount] = useState<number>(0); // Указываем тип number для productCount
    const [totalCost, setTotalCost] = useState<number>(0); // Указываем тип number для totalCost

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get<IProduct[]>('/api/products'); // Указываем тип данных IProduct[] для ответа
                const products: IProduct[] = response.data;

                // Вычисляем количество товаров и общую стоимость
                setProductCount(products.length);
                const sumCost = products.reduce((acc: number, curr: IProduct) => acc + curr.price, 0); // Указываем типы для acc и curr
                setTotalCost(sumCost);
            } catch (error) {
                console.error('Error fetching product data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <Layout>
            <div className='container'>
                <h1>Shop.Client</h1>
                <p>В базе данных находится {productCount} товаров общей стоимостью {totalCost}.</p>
                <div className='main-buttons'>
                    <Link to="/products-list">
                        <button className='button'>Перейти к списку товаров</button>
                    </Link>
                    <a href="/admin" target="_blank" rel="noopener noreferrer">
                        <button className='button'>Перейти в систему администрирования</button>
                    </a>
                </div>
            </div>
        </Layout>
    );
};

export default HomePage;