import { Router, Request, Response } from "express";
import { addProduct, getOtherProducts, getProduct, getProducts, getSimilarProducts, removeProduct, searchProducts, updateProduct } from "../models/products.model";
import { IProduct, IProductFilterPayload } from "@Shared/types";
import { IProductEditData } from "../types";
import { throwServerError } from "./helper";

export const productsRouter = Router();

// метод получения списка товаров    
productsRouter.get('/', async (req: Request, res: Response) => {
    try {
        const products = await getProducts();
        res.render("products", {
            items: products,
            queryParams: {}
        });
    } catch (e) {
        throwServerError(res, e);
    }
});

// метод для фильтрации товаров в админке
productsRouter.get('/search', async (
    req: Request<{}, {}, {}, IProductFilterPayload>,
    res: Response
) => {
    try {
        const products = await searchProducts(req.query);
        res.render("products", {
            items: products,
            queryParams: req.query
        });
    } catch (e) {
        throwServerError(res, e);
    }
});

// гет-метод для формы добавления нового продукта, задание 36.6.2
productsRouter.get('/new-product', async (req: Request, res: Response) => {
    
    try {
    // Создаем объект с начальными данными для нового продукта
      const product: IProduct = {
        id: "",
        title: "",
        description: "",
        price: 0
      }
  
    // Рендерим шаблон new-product.ejs и передаем данные о продукте
    res.render("new-product", {
        item: product,
    });

    } catch (e) {
      throwServerError(res, e);
    }
});

// метод добавления нового продукта из админки. Задание 36.6.2
productsRouter.post('/add-product', async (
    req: Request<{}, {}, IProductEditData>,
    res: Response
  ) => {
    console.log('Received POST request to /add-product');
    try {
        // Извлекаем данные из тела запроса (req.body)
        const formData = req.body;

        // Вызываем функцию для добавления продукта
        const newProduct = await addProduct(formData);

        // Проверяем результат операции и отправляем ответ клиенту
        if (newProduct) {
            // В случае успеха, выполняем редирект на страницу с информацией о продукте
            res.redirect(`/${process.env.ADMIN_PATH}/${newProduct.id}`);
        } else {
            // В случае ошибки, отправляем статус 500 с соответствующим сообщением
            res.status(500).send('Failed to add product: product is null');
        }
    } catch (error) {
        // Обработка ошибок
        console.error('Error adding product:', error);
        res.status(500).send('Failed to add product: server error');
    }
});

// метод для получения отдельного товара по айди в админке
productsRouter.get('/:id', async (
    req: Request<{ id: string }>,
    res: Response
) => {
    try {
        const product = await getProduct(req.params.id);

        if (product) {
            const similarProducts = await getSimilarProducts(req.params.id);
            const otherProducts = await getOtherProducts(req.params.id);

            res.render("product/product", {
                item: product,
                similarProducts,
                otherProducts
            });
        } else {
            res.render("product/empty-product", {
                id: req.params.id
            });
        }
        
    } catch (e) {
        throwServerError(res, e);
    }
});

// метод удаления товара из админки
productsRouter.get('/remove-product/:id', async (
    req: Request<{ id: string }>,
    res: Response
) => {
    try {
        const productId = req.params.id;
        
        // Получаем информацию о текущем пользователе
        const user = req.session.username;

        // задание Задание 35.4.3
        // Проверяем, является ли пользователь администратором
        // если не является, запрещаем удалять товар
        if (user !== "admin") {
            return res.status(403).send("Forbidden");
        }

        await removeProduct(productId);
        res.redirect(`/${process.env.ADMIN_PATH}`);
    } catch (e) {
        throwServerError(res, e);
    }
});

// метод сохранения изменений товара
productsRouter.post('/save/:id', async (
    req: Request<{ id: string }, {}, IProductEditData>,
    res: Response
  ) => {
    try {
      await updateProduct(req.params.id, req.body);
      res.redirect(`/${process.env.ADMIN_PATH}/${req.params.id}`);
    } catch (e) {
      throwServerError(res, e);
    }
});