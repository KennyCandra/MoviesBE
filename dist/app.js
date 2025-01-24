"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
mongoose_1.default.connect('mongodb+srv://ahmedabdelepsfmti:gOFpFDCjChgW3Lbp@cluster0.h9ogb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0').then(result => {
    console.log(result);
    server.listen(8001);
});
