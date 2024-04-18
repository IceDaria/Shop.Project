import mysql, { Connection } from "mysql2/promise";

const {LOCAL_HOST, DB_PORT, USER, PASSWORD, DATABASE} = process.env;

export async function initDataBase(): Promise<Connection | null> {
    let connection: Connection | null = null;
  
    try {
        connection = await mysql.createConnection({
            host: LOCAL_HOST,
            port: Number(DB_PORT),
            user: USER,
            password: PASSWORD,
            database: DATABASE,
        });
    } catch (e: any) { // явно указываем тип 'any' для переменной 'e'
        console.error(e.message || e);
        return null;
    }
  
    console.log(`Connection to DB established`);
    return connection;
}

async function runServer() {
    const connection = await initDataBase();
    
    if (connection) {
        try {
            const [rows] = await connection.execute<[any]>("SELECT * FROM products");
            console.log(rows.length);
            console.log(rows[0]);
        } catch (error) {
            console.error("Error executing SQL query:", error);
        }
    } else {
        console.error("Connection to the database failed.");
    }
}

runServer();