import React from 'react';
import './App.css';
import HomePage from './components/main/HomePage';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ProductsListPage from './components/productsList/ProductsListPage';
import ProductDetailPage from './components/product/ProductDetailPage';

const App: React.FC = () => {
  return (
      <BrowserRouter>
          <div>
              <Routes>
                  <Route path="/" element={ <HomePage/>} />
                  <Route path="/products-list" element={<ProductsListPage />} />
                  <Route path="/products/:id" element={<ProductDetailPage />} />
              </Routes>
          </div>
      </BrowserRouter>
  );
};

export default App;