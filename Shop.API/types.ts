import { IAuthRequisites, IComment, IImage, IProduct } from "@Shared/types";
import { RowDataPacket } from "mysql2/index";

export type CommentCreatePayload = Omit<IComment, "id">;

export interface ICommentEntity extends RowDataPacket {
    comment_id: string;
    name: string;
    email: string;
    body: string;
    product_id: string;
}

export interface IProductEntity extends IProduct, RowDataPacket {
    product_id: string;
}

export interface IProductSearchFilter {
    title?: string;
    description?: string;
    priceFrom?: number;
    priceTo?: number;
}

export type ProductCreatePayload =
  Omit<IProduct, "id" | "comments" | "thumbnail" | "images"> & { images: ImageCreatePayload[] };

export type ImageCreatePayload = Omit<IImage, "id" | "productId">;

export interface IImageEntity extends RowDataPacket {
    image_id: string;
    url: string;
    product_id: string;
    main: number;
}

export interface ProductAddImagesPayload {
    productId: string;
    images: ImageCreatePayload[];
}

export interface IUserRequisitesEntity extends IAuthRequisites, RowDataPacket {
    id: number;
}

export interface ISimilarProductEntity extends RowDataPacket {
    id: number;
    first_product: string;
    second_product: string;
  }