import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import User, { IUser } from "../models/User";

dotenv.config();

const router = express.Router();

// Environment variables validation
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET must be defined in environment variables");
}

// Now TypeScript knows JWT_SECRET is definitely a string
const SECRET: string = JWT_SECRET;

// Request validation schemas
const signupSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// Helper function to generate JWT token
function generateToken(user: IUser): string {
  return jwt.sign(
    { userId: user._id, email: user.email },
    SECRET, // Use the verified string constant
    { expiresIn: "24h" }
  );
}

// Helper function to sanitize user object for response
function sanitizeUser(user: IUser) {
  const { password: _, ...sanitizedUser } = user.toObject();
  return sanitizedUser;
}

// POST /api/auth/signup
router.post("/signup", async (req: express.Request, res: express.Response) => {
  try {
    // Validate request body
    const validatedData = signupSchema.parse(req.body);

    // Check if user exists with case-insensitive email search
    const existingUser = await User.findOne({
      email: { $regex: new RegExp(`^${validatedData.email}$`, "i") },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Create new user
    const user = new User(validatedData);
    await user.save();

    // Generate JWT token
    const token = generateToken(user);

    // Return sanitized user data and token
    return res.status(201).json({
      success: true,
      data: {
        user: sanitizeUser(user),
        token,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    }

    console.error("Signup error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred during signup",
    });
  }
});

// POST /api/auth/login
router.post("/login", async (req: express.Request, res: express.Response) => {
  try {
    // Validate request body
    const validatedData = loginSchema.parse(req.body);

    // Find user with case-insensitive email search
    const user = await User.findOne({
      email: { $regex: new RegExp(`^${validatedData.email}$`, "i") },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Verify password
    const isValidPassword = await user.comparePassword(validatedData.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Return sanitized user data and token
    return res.status(200).json({
      success: true,
      data: {
        user: sanitizeUser(user),
        token,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    }

    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred during login",
    });
  }
});

router.get("/validate", async (req: express.Request, res: express.Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, SECRET) as { userId: string };
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      return res.json({
        success: true,
        data: {
          user: sanitizeUser(user),
        },
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
  } catch (error) {
    console.error("Token validation error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred during token validation",
    });
  }
});

export default router;
