export const INSERT_PRODUCT_QUERY = `
INSERT INTO products
(product_id, title, description, price)
VALUES
(?, ?, ?, ?)
`;

export const INSERT_PRODUCT_IMAGES_QUERY = `
  INSERT INTO images
  (image_id, url, product_id, main)
  VALUES ?
`;

export const FIND_SIMILAR_PRODUCTS = `
SELECT products.product_id, products.title, products.description, products.price
FROM product_similarity
JOIN products ON product_similarity.similar_product_id = products.product_id
WHERE product_similarity.product_id = ?
UNION
SELECT products.product_id, products.title, products.description, products.price
FROM product_similarity
JOIN products ON product_similarity.product_id = products.product_id
WHERE product_similarity.similar_product_id = ?`;

export const DELETE_SIMILAR_PRODUCTS = `DELETE FROM product_similarity
WHERE (product_id = ? AND similar_product_id = ?)
OR (product_id = ? AND similar_product_id = ?)`