import { Request, Response, Router } from 'express';
import { validateComment } from '../helpers';
import { v4 as uuidv4 } from 'uuid';
import { mapCommentsEntity } from '../services/mapping';
import { ResultSetHeader } from 'mysql2';
import { connection } from '../..';
import { CommentCreatePayload, ICommentEntity } from '../../types';
import { IComment } from '@Shared/types';
import { param, validationResult } from "express-validator"

export const commentsRouter = Router();

/*const loadComments = async (): Promise<IComment[]> => {
    const rawData = await readFile("mock-comments.json", "binary");
    return JSON.parse(rawData.toString());
}*/

/*const saveComments = async (data: IComment[]): Promise<boolean> => {
    try {
        await writeFile("mock-comments.json", JSON.stringify(data));
        return true; // Успешно сохранено
    } catch (error) {
        console.error("Error saving comments:", error);
        return false; // Ошибка при сохранении
    }
}*/

commentsRouter.get("/", async (req: Request, res: Response) => {
    try {
        const [comments] = await connection.query<ICommentEntity[]>(
            "SELECT * FROM comments"
        );
        
        res.setHeader("Content-Type", "application/json");
        res.send(mapCommentsEntity(comments));
    } catch (e: any) {
        console.debug(e.message);
        res.status(500);
        res.send("Something went wrong");
    }
});

// задание 34.5.1 и 34.8.1
commentsRouter.get('/:id',
    [
      param('id').isUUID().withMessage('Comment id is not UUID')
    ],

    async (req: Request<{ id: string }>, res: Response) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          res.status(400);
          res.json({ errors: errors.array() });
          return;
        }
  
        const [rows] = await connection.query<ICommentEntity[]>(
          "SELECT * FROM comments WHERE comment_id = ?",
          [req.params.id]
        );
  
        if (!rows?.[0]) {
          res.status(404);
          res.send(`Comment with id ${req.params.id} is not found`);
          return;
        }
  
        res.setHeader('Content-Type', 'application/json');
        res.send(mapCommentsEntity(rows)[0]);
      } catch (e: any) {
        console.debug(e.message);
        res.status(500);
        res.send("Something went wrong");
      }
});

commentsRouter.post('/', async (
    req: Request<{}, {}, CommentCreatePayload>,
    res: Response
  ) => {
    const validationResult = validateComment(req.body);
  
    if (validationResult) {
      res.status(400);
      res.send(validationResult);
      return;
    }

    const { name, email, body, productId } = req.body;
    const findDuplicateQuery = `
        SELECT * FROM comments c
        WHERE LOWER(c.email) = ?
        AND LOWER(c.name) = ?
        AND LOWER(c.body) = ?
        AND c.product_id = ?
    `;
   
    const [sameResult] = await connection.query<ICommentEntity[]>(
        findDuplicateQuery,
        [email.toLowerCase(), name.toLowerCase(), body.toLowerCase(), productId]
    );
   
    console.log(sameResult[0]?.comment_id);
    
    if (sameResult.length) {
        res.status(422);
        res.send("Comment with the same fields already exists");
        return;
    }

    // Сохранение комментария в базу данных
    try {
        const id = uuidv4();
        const insertCommentQuery = `
            INSERT INTO comments 
            (comment_id,
            name,
            email,
            body,
            product_id)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        await connection.query<ResultSetHeader>(insertCommentQuery, 
            [id,
            name,
            email,
            body,
            productId]);
        
        res.status(201);
        res.send(`Comment id:${id} has been added!`);
    } catch (error) {
        console.error("Error saving comment to database:", error);
        res.status(500);
        res.send("Server error. Comment has not been created");
    }
});

commentsRouter.patch('/', async (
    req: Request<{}, {}, Partial<IComment>>,
    res: Response
) => {
    try {
        // Проверяем, присутствует ли свойство 'id' в req.body
        if (!req.body.id) {
            res.status(400);
            res.send("Missing 'id' property in request body");
            return;
        }

        let updateQuery = "UPDATE comments SET ";

        const valuesToUpdate = [];
            ["name", "body", "email"].forEach(fieldName => {
                if (req.body.hasOwnProperty(fieldName)) {
                    if (valuesToUpdate.length) {
                        updateQuery += ", ";
                    }

            updateQuery += `${fieldName} = ?`;
            valuesToUpdate.push(req.body[fieldName as keyof Partial<IComment>]);
            }
        });

        updateQuery += " WHERE comment_id = ?";
        valuesToUpdate.push(req.body.id);

        const [info] = await connection.query<ResultSetHeader>(updateQuery, valuesToUpdate);

        if (info.affectedRows === 1) {
            res.sendStatus(200); // Отправляем код состояния 200 без тела ответа
        } else {
            res.status(404);
            res.send(`Comment with id ${req.body.id} not found`);
        }
    } catch (error) {
        console.error("Error updating comment:", error);
        res.status(500);
        res.send("Server error");
    }
});

// задание 34.8.1, метод удаление комментария из БД
commentsRouter.delete(`/:id`, async (req: Request<{ id: string }>, res: Response) => {
    const id = req.params.id;

    try {
        const [info] = await connection.query<ResultSetHeader>(
            "DELETE FROM comments WHERE comment_id = ?",
            [id]
        );

        if (info.affectedRows === 1) {
            res.status(200).end();
        } else {
            res.status(404).send(`Comment with id ${id} is not found`);
        }
    } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).send("Server error");
    }
});