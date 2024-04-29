import axios from "axios";
import { IProduct, IProductFilterPayload } from "@Shared/types";
import { IProductEditData } from "../types";
import { API_HOST } from "./const";

export async function getProducts(): Promise<IProduct[]> {
    const { data } = await axios.get < IProduct[] > (`${API_HOST}/products`);
    return data || [];
}

export async function searchProducts(
    filter: IProductFilterPayload
): Promise<IProduct[]> {
    const { data } = await axios.get < IProduct[] > (
        `${API_HOST}/products/search`,
        { params: filter }
    );
    return data || [];
}

function splitNewImages(str = ""): string[] {
    return str
      .split(/\r\n|,/g)
      .map(url => url.trim())
      .filter(url => url);
  }
  
function compileIdsToRemove(data: string | string[]): string[] {
    if (typeof data === "string") return [data];
    return data;
}

// получение продукта по айди
export async function getProduct(
    id: string
): Promise<IProduct | null> {
    try {
        const { data } = await axios.get < IProduct > (
            `${API_HOST}/products/${id}`
        );
        return data;
    } catch (e) {
        return null;
    }
}

// добавление продукта из админки
export async function addProduct(formData: IProductEditData): Promise<IProduct | null> {
    console.log('Starting addProduct function...');
    
    try {
        const { data } = await axios.post<IProduct>(`${API_HOST}/products`, {
            title: formData.title,
            description: formData.description,
            price: Number(formData.price)
        });

        console.log('Received data from API:', data);
        return data;
    } catch (error) {
        console.error('Error adding product:', error);
        return null;
    } finally {
        console.log('Finishing addProduct function...');
    }
}

// удаление продукта из админки
export async function removeProduct(id: string): Promise<void> {
    await axios.delete(`${API_HOST}/products/${id}`);
}

// изненение данных продукта в админке
export async function updateProduct(
    productId: string,
    formData: IProductEditData
): Promise<void> {
    try {
        console.log("formData:", formData);
        
        // Запрашиваем текущий товар перед внесением изменений
        const { data: currentProduct } = await axios.get<IProduct>(`${API_HOST}/products/${productId}`);

        // Удаление комментариев, если указаны для удаления
        if (formData.commentsToRemove) {
            const commentsIdsToRemove = compileIdsToRemove(formData.commentsToRemove);
            const deleteCommentActions = commentsIdsToRemove.map(commentId => {
                return axios.delete(`${API_HOST}/comments/${commentId}`);
            });
            await Promise.all(deleteCommentActions);
        }

        // Удаление изображений, если указаны для удаления
        if (formData.imagesToRemove) {
            const imagesIdsToRemove = compileIdsToRemove(formData.imagesToRemove);
            await axios.post(`${API_HOST}/products/remove-images`, imagesIdsToRemove);
        }

        // Добавление новых изображений, если указаны
        if (formData.newImages) {
            const urls = splitNewImages(formData.newImages);
            const images = urls.map(url => ({ url, main: false }));

            if (!currentProduct.thumbnail) {
                images[0].main = true;
            }

            await axios.post(`${API_HOST}/products/add-images`, { productId, images });
        }

        // Обновление главного изображения, если указано новое главное изображение
        if (formData.mainImage && formData.mainImage !== currentProduct.thumbnail?.id) {
            await axios.post(`${API_HOST}/products/update-thumbnail/${productId}`, {
                newThumbnailId: formData.mainImage
            });
        }

        // Добавление похожих товаров, если указаны для добавления
        if (formData.similarToAdd) {
            const ids = compileIdsToRemove(formData.similarToAdd);
            const pairs = ids.map(id => ({
                product_id: productId,  // ID текущего продукта
                similar_product_id: id  // ID связанного похожего продукта
            }));
            await axios.post(`${API_HOST}/products/add-similar`, { pairs });
          }

        // Удаление похожих товаров, если указаны для удаления
        if (formData.similarToRemove) {
            const similarToRemoveIds = compileIdsToRemove(formData.similarToRemove);
            await axios.post(`${API_HOST}/products/remove-similar`, { productId, similarProductId: similarToRemoveIds });
        }

        // Патч товара с новыми данными (заголовок, описание, цена)
        await axios.patch(`${API_HOST}/products/${productId}`, {
            title: formData.title,
            description: formData.description,
            price: Number(formData.price)
        });

    } catch (error) {
        console.log("Error updating product:", error);
        // Здесь можно обработать ошибку, например, отправить пользователю сообщение об ошибке
        throw error;
    }
}

// получаем похожие товары
export async function getSimilarProducts(id: string): Promise<IProduct[]> {
    try {
        const { data } = await axios.get<{ similarProducts: IProduct[] }>(
            `${API_HOST}/products/similar/${id}`
        );
        return data.similarProducts;
    } catch (e) {
        console.log(e);
        return [];
    }
}

// получаем остальные товары
export async function getOtherProducts(productId: string): Promise<IProduct[]> {
    try {
        // Получаем все товары
        const allProducts = await getProducts();

        // Получаем список похожих товаров для указанного productId
        const similarProducts = await getSimilarProducts(productId);

        // Проверяем, является ли similarProducts массивом перед использованием
        if (!Array.isArray(similarProducts)) {
            console.error('Similar products are not in the expected format:', similarProducts);
            return [];
        }

        // Формируем массив исключаемых идентификаторов товаров
        const excludeIds = similarProducts.map(product => product.id);
        excludeIds.push(productId); // Добавляем идентификатор текущего товара

        // Фильтруем все товары, исключая похожие и текущий товар
        const otherProducts = allProducts.filter(product => !excludeIds.includes(product.id));

        return otherProducts;
    } catch (error) {
        console.error('Error fetching other products:', error);
        return [];
    }
}