export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PWD || 'postgres',
    db: process.env.POSTGRES_DB || 'postgres',
  },
  bucketName: process.env.BUCKET_NAME || '',
  keyFile: process.env.KEY_FILE_PATH || './key.json',
  projectId: 'study-resources-app',
});
