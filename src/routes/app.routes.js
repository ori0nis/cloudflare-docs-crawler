import express from "express";

export const appRouter = express.Router()

appRouter.get("/test", (req, res, next) => {
    res.send("Hello")
})