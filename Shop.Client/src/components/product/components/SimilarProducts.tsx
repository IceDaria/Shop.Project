import { IProduct } from '@Shared/types';
import React from 'react';
import { Link } from 'react-router-dom';

interface Props {
    similarProducts: IProduct[];
}

const SimilarProducts: React.FC<Props> = ({ similarProducts }) => {
    return (
        <div>
            <h2>Similar Products</h2>
            <div className='similar-wrapper'>
                {similarProducts.map((product) => (
                    <div key={product.id}>
                        {product.thumbnail ? (
                            <img className='similar__thumbnail' src={product.thumbnail.url} alt={product.title} />
                                ) : (
                            <img className='similar__thumbnail' src="/product-placeholder.png" alt="Placeholder" />
                        )}
                        <Link to={`/products/${product.id}`}>
                            <h3>{product.title}</h3>
                        </Link>
                        <p>Price: {product.price}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SimilarProducts;