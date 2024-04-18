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