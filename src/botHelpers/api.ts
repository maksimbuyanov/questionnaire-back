import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config()

export const api = axios.create({
    baseURL: process.env.BACKEND_URL,
})
