require('dotenv').config();
import express, { Express } from "express";
import path from 'path';
import { Connection } from "mysql2/promise";
import { initDataBase } from "./Server/services/db";
import { initServer } from "./Server/services/server";
import ShopAPI from "./Shop.API";
import ShopAdmin from "./Shop.Admin";

export let server: Express;
export let connection: Connection | null;

async function launchApplication() {
    server = initServer();
    connection = await initDataBase();

    initRouter();

    // Статические файлы React-приложения (в режиме разработки)
    server.use(express.static(path.join(__dirname, './Shop.Client/build')));

    // Обработка корневого пути для React-приложения
    server.get('/', (_, res) => {
        res.sendFile(path.join(__dirname, './Shop.Client/build', 'index.html'));
    });
}

function initRouter() {
    const shopApi = ShopAPI(connection);
    server.use("/api", shopApi);

    const shopAdmin = ShopAdmin();
    server.use("/admin", shopAdmin);

    server.get('/', (_, res) => {
        res.sendFile(path.join(__dirname, './Shop.Client/build', 'index.html'));
    });
}

launchApplication();