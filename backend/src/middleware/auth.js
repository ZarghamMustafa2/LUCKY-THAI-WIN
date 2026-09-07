"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.authenticateToken = void 0;
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Access Denied: No token provided' });
        return;
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'supersecretkey123', (err, user) => {
        if (err) {
            res.status(403).json({ message: 'Invalid token' });
            return;
        }
        req.user = user;
        next();
    });
};
exports.authenticateToken = authenticateToken;
const isAdmin = (req, res, next) => {
    const role = req.user ? (req.user.role || '').toUpperCase() : '';
    if (req.user && (role === 'ADMIN' || role === 'COMPANY' || role === 'SUPER_ADMIN')) {
        next();
    }
    else {
        res.status(403).json({ message: 'Access Denied: Requires Admin Role' });
    }
};
exports.isAdmin = isAdmin;
//# sourceMappingURL=auth.js.map