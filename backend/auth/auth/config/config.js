require("dotenv").config();

const config = {
  development: {
    username: "root",
    password: null,
    database: "auth",
    host: "127.0.0.1",
    dialect: "mysql",
  },
  test: {
    username: "root",
    password: null,
    database: "database_test",
    host: "127.0.0.1",
    dialect: "mysql",
  },
  production: {
    use_env_variable: "MYSQL_PUBLIC_URL",
    username: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    host: process.env.MYSQLPUBLICHOST,
    dialect: "mysql",
  },
};

module.exports = config;
