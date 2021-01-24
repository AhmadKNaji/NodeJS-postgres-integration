/**
 * @module config
 */

module.exports = {

	LISTEN_PORT: process.env.PORT || 4000,
	TOKEN_SECRET: process.env.TOKEN_SECRET || '5749fb86cb741140c2f9b2ab33873d58',
	

	DB_HOST: process.env.DB_HOST || 'localhost',
	DB_PORT: process.env.DB_PORT || '5432',
	DB_NAME: process.env.DB_NAME || 'seniorDB',
	DB_USER: process.env.DB_USER || 'postgres',
	DB_PASSWORD: process.env.DB_PASSWORD || '12358'
};