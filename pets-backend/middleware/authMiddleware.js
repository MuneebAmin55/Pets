import jwt from "jsonwebtoken";

export const requireAuth = (req, res, next) => {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authentication token is required" });
    }

    const token = authorization.slice(7).trim();

    if (!token) {
        return res.status(401).json({ message: "Authentication token is required" });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        return next();
    } catch {
        return res.status(401).json({ message: "Invalid or expired authentication token" });
    }
};
