/**
 * Authentication API Routes
 * Handles user authentication via Supabase Auth
 */

import { Router, Request, Response } from 'express';
import { supabase, createOrUpdateUser, getUser, getAllUsers } from '../services/supabase';
import { ApiResponse, User } from '../types';

const router = Router();

/**
 * POST /api/auth/signup
 * Register a new user with email and password
 */
router.post('/signup', async (req: Request, res: Response<ApiResponse<{ user: User; session: any }>>) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
        },
      },
    });

    if (authError) {
      console.error('Signup error:', authError);
      return res.status(400).json({
        success: false,
        error: authError.message,
      });
    }

    if (!authData.user) {
      return res.status(400).json({
        success: false,
        error: 'Failed to create user',
      });
    }

    // Create user profile in our users table
    const user = await createOrUpdateUser({
      id: authData.user.id,
      email: authData.user.email!,
      name: name || email.split('@')[0],
    });

    console.log(`✅ New user signed up: ${email}`);

    res.json({
      success: true,
      data: {
        user: user!,
        session: authData.session,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, error: 'Failed to sign up' });
  }
});

/**
 * POST /api/auth/signin
 * Sign in with email and password
 */
router.post('/signin', async (req: Request, res: Response<ApiResponse<{ user: User; session: any }>>) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('Signin error:', authError);
      return res.status(401).json({
        success: false,
        error: authError.message,
      });
    }

    if (!authData.user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Get or create user profile
    let user = await getUser(authData.user.id);
    if (!user) {
      user = await createOrUpdateUser({
        id: authData.user.id,
        email: authData.user.email!,
        name: authData.user.user_metadata?.name || email.split('@')[0],
      });
    }

    console.log(`✅ User signed in: ${email}`);

    res.json({
      success: true,
      data: {
        user: user!,
        session: authData.session,
      },
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ success: false, error: 'Failed to sign in' });
  }
});

/**
 * POST /api/auth/signout
 * Sign out current user
 */
router.post('/signout', async (_req: Request, res: Response<ApiResponse<null>>) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Signout error:', error);
    res.status(500).json({ success: false, error: 'Failed to sign out' });
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', async (req: Request, res: Response<ApiResponse<User>>) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No authorization token provided',
      });
    }

    const token = authHeader.substring(7);
    const { data: { user: authUser }, error } = await supabase.auth.getUser(token);

    if (error || !authUser) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }

    const user = await getUser(authUser.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found',
      });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, error: 'Failed to get user' });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh the access token
 */
router.post('/refresh', async (req: Request, res: Response<ApiResponse<{ session: any }>>) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required',
      });
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      return res.status(401).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      data: { session: data.session },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ success: false, error: 'Failed to refresh token' });
  }
});

/**
 * POST /api/auth/forgot-password
 * Send password reset email
 */
router.post('/forgot-password', async (req: Request, res: Response<ApiResponse<null>>) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
      });
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password`,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, error: 'Failed to send reset email' });
  }
});

/**
 * GET /api/auth/users
 * Get all users (for starting chats)
 */
router.get('/users', async (_req: Request, res: Response<ApiResponse<User[]>>) => {
  try {
    const users = await getAllUsers();
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, error: 'Failed to get users' });
  }
});

export default router;
