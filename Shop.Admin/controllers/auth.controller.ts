import { NextFunction, Request, Response, Router } from "express";
import { throwServerError } from "./helper";
import { IAuthRequisites } from "@Shared/types";
import { verifyRequisites } from "../models/auth.model";

export const authRouter = Router();

// метод для входа в аккаунт
authRouter.get("/login", async (req: Request, res: Response) => {
    try {
        res.render("login");
    } catch (e) {
        throwServerError(res, e);
    }
});

// метод для авторизации пользователя
authRouter.post("/authenticate", async (
    req: Request<{}, {}, IAuthRequisites>,
    res: Response
) => {
    try {
        const verified = await verifyRequisites(req.body);

        if (verified) {
            req.session.username = req.body.username; // только с добавлением этой строки у меня отрабатывала функция валидации сессии
            res.redirect(`/${process.env.ADMIN_PATH}`)
        } else {
            res.redirect(`/${process.env.ADMIN_PATH}/auth/login`);
        }
    } catch (e) {
        throwServerError(res, e);
    }
});

// валидация сессии
export const validateSession = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (req.path.includes("/login") || req.path.includes("/authenticate")) {
        next();
        return;
    }

    if (req.session?.username) {
        next();
    } else {
        res.redirect(`/${process.env.ADMIN_PATH}/auth/login`);
    }
};

// Задание 35.4.1 реализация выхода из аккаунта
authRouter.get("/logout", (req: Request, res: Response) => {
    try {
        // Уничтожаем сеанс пользователя
        req.session.destroy((e) => {
          if (e) {
            console.error("Error destroying session:", e);
            res.status(500).send("Internal Server Error");
          }

        // Перенаправляем пользователя на страницу входа после успешного выхода
          res.redirect(`/${process.env.ADMIN_PATH}/auth/login`);
        })
      } catch (e) {
        throwServerError(res, e);
      }
});