import { CommentCreatePayload, ICommentEntity, IImageEntity, IProductSearchFilter } from "../types";
import { mapCommentEntity, mapImageEntity } from "./services/mapping";
import { IComment, IImage, IProduct } from "@Shared/types";

// функция для валидации комментариев, задание 34.5.2
type validateComment = (comment: CommentCreatePayload) => string | null;

export const validateComment: validateComment = (comment) => {
    if (!comment) {
        return "Comment is absent or empty";
    }

    const requiredFields = ["name", "email", "body", "productId"];
    for (const field of requiredFields) {
        if (!(field in comment)) {
            return `Field "${field}" is absent`;
        }
    }

    for (const [key, value] of Object.entries(comment)) {
        if (typeof value !== "string" && typeof value !== "number") {
            return `Field "${key}" has wrong type`;
        }
    }

    return null;
};

// функция для проверки уникальности комментариев, которая оказалась не нужной
const compareValues = (target: string, compare: string): boolean => {
    return target.toLowerCase() === compare.toLowerCase();
}

export const checkCommentUniq = (payload: CommentCreatePayload, comments: IComment[]): boolean => {
    const byEmail = comments.find(({ email }) => compareValues(payload.email, email));

    if (!byEmail) {
        return true;
    }

    const { body, name, productId } = byEmail;
    return !(
        compareValues(payload.body, body) &&
        compareValues(payload.name, name) &&
        compareValues(payload.productId.toString(), productId.toString())
    );
}

export const enhanceProductsComments = (
    products: IProduct[],
    commentRows: ICommentEntity[]
): IProduct[] => {
    const commentsByProductId = new Map<string, IComment[]>();

    for (let commentEntity of commentRows) {
        const comment = mapCommentEntity(commentEntity);
        if (!commentsByProductId.has(comment.productId)) {
            commentsByProductId.set(comment.productId, []);
        }

        const list = commentsByProductId.get(comment.productId);
        if (list) {
            commentsByProductId.set(comment.productId, [...list, comment]);
        }
    }

    for (let product of products) {
        const comments = commentsByProductId.get(product.id);
        if (comments) {
            product.comments = comments;
        }
    }

    return products;
}

export const getProductsFilterQuery = (
    filter: IProductSearchFilter
): [string, Array<string | number>] => {
    const { title, description, priceFrom, priceTo } = filter;

    let query = "SELECT * FROM products WHERE ";
    const values: Array<string | number> = [];

    if (title) {
        query += "title LIKE ? ";
        values.push(`%${title}%`);
    }

    if (description) {
        if (values.length) {
            query += " OR ";
        }

        query += "description LIKE ? ";
        values.push(`%${description}%`);
    }

    if (priceFrom || priceTo) {
        if (values.length) {
            query += " OR ";
        }

        query += "(price > ? AND price < ?)";
        values.push(priceFrom || 0);
        values.push(priceTo || 999999);
    }

    return [query, values];
}

export const enhanceProductsImages = (
    products: IProduct[],
    imageRows: IImageEntity[]
  ): IProduct[] => {
    const imagesByProductId = new Map<string, IImage[]>();
    const thumbnailsByProductId = new Map<string, IImage>();
  
    for (let imageEntity of imageRows) {
      const image = mapImageEntity(imageEntity);
      if (!imagesByProductId.has(image.productId)) {
        imagesByProductId.set(image.productId, []);
      }
  
      const list = imagesByProductId.get(image.productId);
      if (list) {
        imagesByProductId.set(image.productId, [...list, image]);
      }
  
      if (image.main) {
        thumbnailsByProductId.set(image.productId, image);
      }
    }
  
    for (let product of products) {
      product.thumbnail = thumbnailsByProductId.get(product.id);
  
      if (imagesByProductId.has(product.id)) {
        product.images = imagesByProductId.get(product.id);
  
        if (product.images && product.images.length > 0) {
            if (!product.thumbnail) {
              product.thumbnail = product.images[0];
            }
          }
      }
    }
  
    return products;
}