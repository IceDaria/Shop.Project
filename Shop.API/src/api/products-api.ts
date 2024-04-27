import { Request, Response, Router } from "express";
import { mapCommentsEntity, mapImagesEntity, mapProductsEntity } from "../services/mapping";
import { ResultSetHeader } from "mysql2";
import { DELETE_SIMILAR_PRODUCTS, FIND_SIMILAR_PRODUCTS, INSERT_PRODUCT_IMAGES_QUERY, INSERT_PRODUCT_QUERY } from "../services/queries";
import { v4 as uuidv4 } from 'uuid';
import { enhanceProductsComments, enhanceProductsImages, getProductsFilterQuery } from "../helpers";
import { connection } from "../..";
import { ICommentEntity, IImageEntity, IProductEntity, IProductSearchFilter, ISimilarProductEntity, ProductAddImagesPayload, ProductCreatePayload } from "../../types";
import { body, param, validationResult } from "express-validator"

export const productsRouter = Router();

const throwServerError = (res: Response, e: Error) => {
    console.debug(e.message);
    res.status(500);
    res.send("Something went wrong");
}

// гет-метод для поиска оп заданным параметрам
productsRouter.get('/search', async (
    req: Request<{}, {}, {}, IProductSearchFilter>,
    res: Response
) => {
    try {
        const [query, values] = getProductsFilterQuery(req.query);
        const [rows] = await connection.query <IProductEntity[]> (query, values);

        if (!rows?.length) {
            res.status(404);
            res.send(`Products are not found`);
            return;
        }

        const [commentRows] = await connection.query <ICommentEntity[]> (
            "SELECT * FROM comments");
        const [imageRows] = await connection.query<IImageEntity[]>("SELECT * FROM images");

        const products = mapProductsEntity(rows);
        const resultWithComments = enhanceProductsComments(products, commentRows);
        const resultWithImages = enhanceProductsImages(resultWithComments, imageRows)

        res.send(resultWithImages);
    } catch (e: any) {
        throwServerError(res, e);
    }
});

// гет-метод для получения конкретного товара
productsRouter.get('/:id', async (
    req: Request<{ id: string }>,
    res: Response
) => {
    try {
        const [rows] = await connection.query < IProductEntity[] > (
            "SELECT * FROM products WHERE product_id = ?",
            [req.params.id]
        );

        if (!rows?.[0]) {
            res.status(404);
            res.send(`Product with id ${req.params.id} is not found`);
            return;
        }

        const [comments] = await connection.query < ICommentEntity[] > (
            "SELECT * FROM comments WHERE product_id = ?",
            [req.params.id]
        );

        const [images] = await connection.query<IImageEntity[]>(
            "SELECT * FROM images WHERE product_id = ?",
            [req.params.id]
          );

        const product = mapProductsEntity(rows)[0];

        if (comments.length) {
            product.comments = mapCommentsEntity(comments);
        }

        if (images.length) {
            product.images = mapImagesEntity(images);
            product.thumbnail = product.images.find(image => image.main) || product.images[0];
          }

        res.send(product);
    } catch (e: any) {
        throwServerError(res, e);
    }
});

// гет-метод для получения всех товаров
productsRouter.get('/', async (req: Request, res: Response) => {
    try {
      const [productRows] = await connection.query<IProductEntity[]>("SELECT * FROM products");
      const [commentRows] = await connection.query<ICommentEntity[]>("SELECT * FROM comments");
      const [imageRows] = await connection.query<IImageEntity[]>("SELECT * FROM images");
  
      const products = mapProductsEntity(productRows);
      const withComments = enhanceProductsComments(products, commentRows);
      const withImages = enhanceProductsImages(withComments, imageRows)
  
      res.send(withImages);
    } catch (e: any) {
      throwServerError(res, e);
    }
});

// пост-метод для добавления товара в БД
productsRouter.post('/', async (
    req: Request<{}, {}, ProductCreatePayload>,
    res: Response
) => {
    try {
        const { title, description, price, images } = req.body;
        const id = uuidv4();
        await connection.query <ResultSetHeader> (
            INSERT_PRODUCT_QUERY,
            [id, title || null, description || null, price || null ]
        );

        if (images) {
            const values = images.map((image) => [uuidv4(), image.url, id, image.main]);
            await connection.query<ResultSetHeader>(INSERT_PRODUCT_IMAGES_QUERY, [values]);
        }

        const [data] = await connection.query<IProductEntity[]>(
            "SELECT * FROM products WHERE product_id = ?",
            [id]
          );
      
          const product = mapProductsEntity(data)[0];

          res.status(201).send(product);
    } catch (e: any) {
        throwServerError(res, e);
    }
});

// делит-метод для удалени товара из БД
productsRouter.delete('/:id', async (
    req: Request<{ id: string }>,
    res: Response
) => {
    try {
        // Удаление комментариев, связанных с товаром
        await connection.query<ResultSetHeader>(
            "DELETE FROM comments WHERE product_id = ?",
            [req.params.id]
        );

        // Удаление изображений, связанных с товаром
        await connection.query<ResultSetHeader>(
            "DELETE FROM images WHERE product_id = ?",
            [req.params.id]
        );

        // Удаление самого товара
        const [info] = await connection.query<ResultSetHeader>(
            "DELETE FROM products WHERE product_id = ?",
            [req.params.id]
        );

        if (info.affectedRows === 0) {
            res.status(404);
            res.send(`Product with id ${req.params.id} is not found`);
            return;
        }

        res.status(200);
        res.end();
    } catch (e: any) {
        // Если произошла ошибка при выполнении запроса
        throwServerError(res, e);
    }
});

// пост-метод для добавления изображения к конкретному товару
productsRouter.post('/add-images', async (
    req: Request<{}, {}, ProductAddImagesPayload>,
    res: Response
  ) => {
    try {
      const { productId, images } = req.body;
  
      if (!images?.length) {
        res.status(400);
        res.send("Images array is empty");
        return;
      }
  
      const values = images.map((image) => [uuidv4(), image.url, productId, image.main]);
      await connection.query<ResultSetHeader>(INSERT_PRODUCT_IMAGES_QUERY, [values]);
  
      res.status(201);
      res.send(`Image has been added to product id:${productId}`)
    } catch (e: any) {
      throwServerError(res, e);
    }
});

// метод для удаления изображения у товара
productsRouter.post('/remove-images', async (
    req: Request<{ productId: string, imageId?: string }>,
    res: Response
) => {
    try {
        const { productId } = req.params;
        const imagesToRemove = req.body;

        if (!Array.isArray(imagesToRemove) || imagesToRemove.length === 0) {
            res.status(400).send("Images array is empty or malformed");
            return;
        }

        const [info] = await connection.query<ResultSetHeader>(`DELETE FROM images WHERE image_id IN ?`, [[imagesToRemove]]);

        if (info.affectedRows === 0) {
            res.status(404).send(`No images found for product id ${productId}`);
            return;
        }

        res.status(200).send(`All images for product id ${productId} have been deleted`);
    } catch (e: any) {
        throwServerError(res, e);
    }
});

// новый метод для изменения обложки товара, Задание 35.5.2
productsRouter.post('/update-thumbnail/:id',
    [
      param('id').isUUID().withMessage('Product id is not UUID'),
      body('newThumbnailId').isUUID().withMessage('New thumbnail id is empty or not UUID'),
    ],
    async (
      req: Request<{ id: string }, {}, { newThumbnailId: string }>,
      res: Response
    ) => {
      try {
        // Проверяем результаты валидации
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          res.status(400);
          res.json({ errors: errors.array() });
          return;
        }

        const [currentThumbnailRows] = await connection.query<IImageEntity[]>(
            "SELECT * FROM images WHERE product_id=? AND main=?", [req.params.id, 1]);
          
        if (!currentThumbnailRows?.length || currentThumbnailRows.length > 1) {
            res.status(400);
            res.send("Incorrect product id");
            return;
        }
          
        const [newThumbnailRows] = await connection.query<IImageEntity[]>(
            "SELECT * FROM images WHERE product_id=? AND image_id=?",
            [req.params.id, req.body.newThumbnailId]
        );
          
        if (newThumbnailRows?.length !== 1) {
            res.status(400);
            res.send("Incorrect new thumbnail id");
            return;
        }
          
        const currentThumbnailId = currentThumbnailRows[0].image_id;
        const [info] = await connection.query<ResultSetHeader>( `UPDATE images SET main = CASE WHEN image_id = ? THEN 0 WHEN image_id = ? THEN 1 ELSE main END WHERE image_id IN (?, ?);`,
            [currentThumbnailId, req.body.newThumbnailId, currentThumbnailId, req.body.newThumbnailId]
        );
          
        if (info.affectedRows === 0) {
            res.status(404);
            res.send("No image has been updated");
            return;
        }
          
        res.status(200);
        res.send("New product thumbnail has been set!");
    } catch (e: any) {
        throwServerError(res, e);
    }
});

// метод для измнения заголовка, описания и цены товара в админке
productsRouter.patch('/:id', async (
    req: Request<{ id: string }, {}, ProductCreatePayload>,
    res: Response
  ) => {
    try {
      const { id } = req.params;
  
      const [rows] = await connection.query<IProductEntity[]>(
        "SELECT * FROM products WHERE product_id = ?",
        [id]
      );
  
      if (!rows?.[0]) {
        res.status(404);
        res.send(`Product with id ${id} is not found`);
        return;
      }
  
      const currentProduct = rows[0];
  
      await connection.query<ResultSetHeader>(`UPDATE products SET title = ?, description = ?, price = ? WHERE product_id = ?`,
        [
          req.body.hasOwnProperty("title") ? req.body.title : currentProduct.title,
          req.body.hasOwnProperty("description") ? req.body.description : currentProduct.description,
          req.body.hasOwnProperty("price") ? req.body.price : currentProduct.price,
          id
        ]
      );
  
      res.status(200);
      res.send(`Product id:${id} has been added!`);
    } catch (e: any) {
      throwServerError(res, e);
    }
});

// метод для получения похожих товаров
productsRouter.get(
    '/similar/:id',
    [
      param('id').isUUID().withMessage('Product id is not UUID')
    ],
    async (
      req: Request<{ id: string }>,
      res: Response
    ) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const productId = req.params.id;

        // Выполнение SQL-запроса для получения списка похожих товаров
        const [rows] = await connection.query<ISimilarProductEntity[]>(FIND_SIMILAR_PRODUCTS, [productId, productId]);

        // Преобразование массива строк результата в массив объектов с данными о похожих товарах
        const similarProducts = rows.map((row: ISimilarProductEntity) => ({
          id: row.product_id,
          title: row.title,
          description: row.description,
          price: row.price
        }));

        res.json({ similarProducts });

      } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
      }
    }
);

// метод для добавления связей похожих товаров
productsRouter.post(
    '/add-similar',
    [
        // Валидация каждой пары товаров на корректность UUID
        body('pairs.*.product_id').isUUID().withMessage('Product id is not UUID'),
        body('pairs.*.similar_product_id').isUUID().withMessage('Similar product id is not UUID')
    ],
    async (req: Request, res: Response) => {
        try {
            // Проверка валидности входных данных
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // Получение списка пар товаров для добавления
            const { pairs } = req.body;

            // Проверка наличия списка пар товаров
            if (!Array.isArray(pairs) || pairs.length === 0) {
                return res.status(400).json({ message: "Pairs array is empty or malformed" });
            }

             // Проверка наличия дубликатов перед выполнением запроса на добавление
           /* for (const pair of pairs) {
                const [existingPair] = await connection.query(
                    "SELECT * FROM product_similarity WHERE product_id = ? AND similar_product_id = ?",
                    [pair.product_id, pair.similar_product_id]
                );
            
                if (existingPair) {
                    return res.status(400).json({ message: "This pair already exists" });
                }
            } НЕ РАБОТАЕТ КОРРЕКТНО ПРИ ВОССТАНОВЛЕНИИ УДАЛЁННОЙ СВЯЗИ, ИСПРАВИТЬБ НЕ УДАЛОСЬ*/ 

            // Подготовка данных для запроса к базе данных
            const values = pairs.map((pair: { product_id: string, similar_product_id: string }) => [
                pair.product_id,
                pair.similar_product_id
            ]);

            // Выполнение SQL-запроса для добавления пар товаров
            await connection.query(
                "INSERT INTO product_similarity (product_id, similar_product_id) VALUES ?",
                [values]
            );

            // Отправка успешного ответа
            res.status(201).json({ message: "Pairs have been added successfully" });
        } catch (error) {
            console.error("Error:", error);
            res.status(500).send("Internal Server Error");
        }
    }
);

// метод для удаления похожих товаров
productsRouter.post(
    '/remove-similar',
    [
        body('productId').isUUID().withMessage('Product id is not UUID'),
        body('similarProductId').isUUID().withMessage('Similar product id is not UUID')
    ],
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { productId, similarProductId } = req.body;

            const similarProductsToRemove = [similarProductId];

            // Выполнение SQL-запроса для удаления связи между товарами
            const [info] = await connection.query<ResultSetHeader>(DELETE_SIMILAR_PRODUCTS,[productId, similarProductId, similarProductId, productId]);

            // Проверка на количество удаленных записей
            if (info.affectedRows === 0) {
                res.status(404).send(`No similar product found for product id ${productId}`);
                return;
            }

            res.status(200).send(`Similar product for product id ${productId} has been deleted`);
        } catch (error) {
            console.error("Error:", error);
            res.status(500).send("Internal Server Error");
        }
    }
);