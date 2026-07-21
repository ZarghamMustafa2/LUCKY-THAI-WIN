"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const wallet_routes_1 = __importDefault(require("./routes/wallet.routes"));
const bet_routes_1 = __importDefault(require("./routes/bet.routes"));
const round_routes_1 = __importDefault(require("./routes/round.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const gameEngine_1 = require("./services/gameEngine");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*', // Allow all origins for development
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/wallet', wallet_routes_1.default);
app.use('/api/bets', bet_routes_1.default);
app.use('/api/rounds', round_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Thai Number Game API is running.' });
});
// Socket.io integration
io.on('connection', (socket) => {
    console.log('A client connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`[Server] Listening on port ${PORT}`);
    // Start the Game Engine
    const engine = new gameEngine_1.GameEngine(io);
    engine.start();
});
//# sourceMappingURL=index.js.map