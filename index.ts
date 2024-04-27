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
}

function initRouter() {
    const shopApi = ShopAPI(connection);
    server.use("/api", shopApi);

    const shopAdmin = ShopAdmin();
    server.use("/admin", shopAdmin);

    // Путь к статическим файлам React-приложения
    const reactBuildPath = path.join(__dirname, 'Shop.Client', 'build');

    // Использование Express для обслуживания статических файлов
    server.use(express.static(reactBuildPath));

    server.use("/", (_, res) => {
        res.send("React App");
    });
}

launchApplication();
