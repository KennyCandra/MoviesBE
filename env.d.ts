declare namespace NodeJS {
    interface processEnv {
        PORT: number
        MONGO_URI: string
        JWT_SECRET: string
        JWT_ACCESS_TIME: string
        JWT_REFRESH_TIME: string
    }
}