import React from 'react';

interface ProductsListFilterProps {
    searchTitle: string;
    minPrice: string;
    maxPrice: string;
    onSearchTitleChange: (value: string) => void;
    onMinPriceChange: (value: string) => void;
    onMaxPriceChange: (value: string) => void;
}

const ProductsListFilter: React.FC<ProductsListFilterProps> = ({
    searchTitle, minPrice, maxPrice,
    onSearchTitleChange, onMinPriceChange, onMaxPriceChange, 
    }) => {

    return (
        <div className='filter-wrapper'>
            <div className='filter'>
                <label className='filter-label' htmlFor="searchTitle">Search by Title:</label>
                <input
                    className='filter-input'
                    type="text"
                    id="searchTitle"
                    value={searchTitle}
                    onChange={(e) => onSearchTitleChange(e.target.value)}
                />
            </div>

            <div className='filter'>
                <label className='filter-label' htmlFor="minPrice">Min Price:</label>
                    <input
                        className='filter-input'
                        type="number"
                        id="minPrice"
                        value={minPrice}
                        onChange={(e) => onMinPriceChange(e.target.value)}
                />
            </div>

            <div className='filter'>
                <label className='filter-label' htmlFor="maxPrice">Max Price:</label>
                <input
                    className='filter-input'
                    type="number"
                    id="maxPrice"
                    value={maxPrice}
                    onChange={(e) => onMaxPriceChange(e.target.value)}
                />
            </div>
        </div>
    );
};
    
export default ProductsListFilter;