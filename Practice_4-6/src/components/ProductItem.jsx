import React from "react";
import './ProductItem.css';

export default function ProductItem({ product, onEdit, onDelete }) {
  return (
    <div className="productRow">
      <div className="productImage">
        {product.image ? (
          <img src={product.image} alt={product.name} className="product-image" />
        ) : (
          <div className="placeholder">🎵</div>
        )}
      </div>
      
      <div className="productInfo">
        <div className="productCategory">{product.category}</div>
        <h3 className="productName">{product.name}</h3>
        <p className="productDescription">{product.description}</p>
        <div className="productMeta">
          <span className="price">{product.price.toLocaleString()} ₽</span>
          <span className={`stock ${product.stock < 5 ? 'low' : ''}`}>
            {product.stock > 0 ? `В наличии: ${product.stock}` : 'Нет в наличии'}
          </span>
          {product.rating > 0 && (
            <span className="rating">⭐ {product.rating}</span>
          )}
        </div>
      </div>
      
      <div className="productActions">
        <button className="btn" onClick={() => onEdit(product)}>✏️</button>
        <button className="btn btn--danger" onClick={() => onDelete(product.id)}>🗑️</button>
      </div>
    </div>
  );
}