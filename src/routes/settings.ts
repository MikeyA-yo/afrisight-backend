import { Hono } from "hono";
import { User } from "../models/user";
import bcrypt from "bcryptjs";

const settings = new Hono();

// Valid creator types
const validCreatorTypes = ["Content Creator", "Musician", "Producer", "Event Planner", "Other"];

/**
 * GET /settings/profile
 * Get current user's profile information
 */
settings.get('/profile', async (c) => {
  try {
    const jwtPayload = c.get('jwtPayload');
    const userId = jwtPayload?.userId;

    if (!userId) {
      return c.json({
        success: false,
        error: 'User authentication required'
      }, 401);
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return c.json({
        success: false,
        error: 'User not found'
      }, 404);
    }

    return c.json({
      success: true,
      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        creatorType: user.creatorType,
        age: user.age || null,
        bio: user.bio || null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error('❌ Get profile error:', error);
    return c.json({
      success: false,
      error: 'Failed to get profile information',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * PUT /settings/profile
 * Update user's profile information
 */
settings.put('/profile', async (c) => {
  try {
    const jwtPayload = c.get('jwtPayload');
    const userId = jwtPayload?.userId;

    if (!userId) {
      return c.json({
        success: false,
        error: 'User authentication required'
      }, 401);
    }

    const { name, email, creatorType, age, bio } = await c.req.json();

    // Validate input - at least one field must be provided
    if (!name && !email && !creatorType && age === undefined && bio === undefined) {
      return c.json({
        success: false,
        error: 'At least one field (name, email, creatorType, age, bio) must be provided'
      }, 400);
    }

    // Validate creatorType if provided
    if (creatorType && !validCreatorTypes.includes(creatorType)) {
      return c.json({
        success: false,
        error: `Invalid creatorType. Must be one of: ${validCreatorTypes.join(", ")}`
      }, 400);
    }

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return c.json({
          success: false,
          error: 'Invalid email format'
        }, 400);
      }
    }

    // Validate age if provided
    if (age !== undefined) {
      if (typeof age !== 'number' || age < 13 || age > 120) {
        return c.json({
          success: false,
          error: 'Age must be a number between 13 and 120'
        }, 400);
      }
    }

    // Validate bio if provided
    if (bio !== undefined && bio !== null) {
      if (typeof bio !== 'string') {
        return c.json({
          success: false,
          error: 'Bio must be a string'
        }, 400);
      }
      if (bio.length > 500) {
        return c.json({
          success: false,
          error: 'Bio must be 500 characters or less'
        }, 400);
      }
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return c.json({
        success: false,
        error: 'User not found'
      }, 404);
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return c.json({
          success: false,
          error: 'Email already exists'
        }, 400);
      }
    }

    // Build update object
    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    if (creatorType) updateData.creatorType = creatorType;
    if (age !== undefined) updateData.age = age;
    if (bio !== undefined) {
      // Allow clearing bio by setting to empty string or null
      updateData.bio = bio === null ? null : bio.trim();
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    return c.json({
      success: true,
      message: 'Profile updated successfully',
      profile: {
        id: updatedUser!._id,
        name: updatedUser!.name,
        email: updatedUser!.email,
        creatorType: updatedUser!.creatorType,
        age: updatedUser!.age || null,
        bio: updatedUser!.bio || null,
        createdAt: updatedUser!.createdAt,
        updatedAt: updatedUser!.updatedAt
      },
      updatedFields: Object.keys(updateData)
    });

  } catch (error) {
    console.error('❌ Update profile error:', error);
    
    // Handle MongoDB duplicate key error
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return c.json({
        success: false,
        error: 'Email already exists'
      }, 400);
    }

    // Handle MongoDB validation errors
    if (error instanceof Error && error.message.includes('validation failed')) {
      return c.json({
        success: false,
        error: 'Validation error',
        details: error.message
      }, 400);
    }

    return c.json({
      success: false,
      error: 'Failed to update profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * PUT /settings/password
 * Change user's password
 */
settings.put('/password', async (c) => {
  try {
    const jwtPayload = c.get('jwtPayload');
    const userId = jwtPayload?.userId;

    if (!userId) {
      return c.json({
        success: false,
        error: 'User authentication required'
      }, 401);
    }

    const { currentPassword, newPassword } = await c.req.json();

    // Validate input
    if (!currentPassword || !newPassword) {
      return c.json({
        success: false,
        error: 'Both currentPassword and newPassword are required'
      }, 400);
    }

    // Validate new password strength
    if (newPassword.length < 6) {
      return c.json({
        success: false,
        error: 'New password must be at least 6 characters long'
      }, 400);
    }

    // Get user with password
    const user = await User.findById(userId);
    if (!user) {
      return c.json({
        success: false,
        error: 'User not found'
      }, 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return c.json({
        success: false,
        error: 'Current password is incorrect'
      }, 400);
    }

    // Check if new password is different from current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return c.json({
        success: false,
        error: 'New password must be different from current password'
      }, 400);
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await User.findByIdAndUpdate(userId, { password: hashedNewPassword });

    return c.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('❌ Change password error:', error);
    return c.json({
      success: false,
      error: 'Failed to change password',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * DELETE /settings/account
 * Delete user account (with confirmation)
 */
settings.delete('/account', async (c) => {
  try {
    const jwtPayload = c.get('jwtPayload');
    const userId = jwtPayload?.userId;

    if (!userId) {
      return c.json({
        success: false,
        error: 'User authentication required'
      }, 401);
    }

    const { password, confirmDeletion } = await c.req.json();

    // Validate input
    if (!password || !confirmDeletion) {
      return c.json({
        success: false,
        error: 'Password and confirmDeletion are required'
      }, 400);
    }

    if (confirmDeletion !== 'DELETE_MY_ACCOUNT') {
      return c.json({
        success: false,
        error: 'confirmDeletion must be exactly "DELETE_MY_ACCOUNT"'
      }, 400);
    }

    // Get user with password
    const user = await User.findById(userId);
    if (!user) {
      return c.json({
        success: false,
        error: 'User not found'
      }, 404);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return c.json({
        success: false,
        error: 'Password is incorrect'
      }, 400);
    }

    // Delete user account
    await User.findByIdAndDelete(userId);

    return c.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete account error:', error);
    return c.json({
      success: false,
      error: 'Failed to delete account',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export default settings;