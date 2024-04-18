import { IComment, IProduct, IImage } from "@Shared/types";
import { ICommentEntity, IProductEntity, IImageEntity } from "../../types";

// хелпер для конвертации комментариев из БД в комментарий для работы в приложении
export const mapCommentEntity = ({
    comment_id, product_id, ...rest
}: ICommentEntity): IComment => {
    return {
        id: comment_id,
        productId: product_id,
        ...rest
    }
}

export const mapCommentsEntity = (data: ICommentEntity[]): IComment[] => {
    return data.map(mapCommentEntity);
}

// хелпер для конвертации товара из БД в товар для работы в приложении
export const mapProductsEntity = (data: IProductEntity[]): IProduct[] => {
    return data.map(({ product_id, title, description, price }) => ({
        id: product_id,
        title: title || "",
        description: description || "",
        price: Number(price) || 0
    }))
}

export const mapImageEntity = ({
    image_id, product_id, url, main
  }: IImageEntity): IImage => {
    return {
      id: image_id,
      productId: product_id,
      main: Boolean(main),
      url
    }
  }
  
  export const mapImagesEntity = (data: IImageEntity[]): IImage[] => {
    return data.map(mapImageEntity);
  }