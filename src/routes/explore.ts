import { Hono } from "hono";
import { User } from "../models/user";

const explore = new Hono();

/**
 * GET /explore/creators
 * Search for other creators with optional filtering
 * Query params:
 * - limit: number of results to return (default: 50, max: 100)
 * - creatorType: filter by creator type
 * - name: search by name (case-insensitive partial match)
 * - page: pagination page number (default: 1)
 */
explore.get('/creators', async (c) => {
  try {
    // Get query parameters
    const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100); // Max 100, default 50
    const page = Math.max(parseInt(c.req.query('page') || '1'), 1); // Min 1, default 1
    const creatorType = c.req.query('creatorType');
    const name = c.req.query('name');
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Build query object
    const query: any = {};
    
    // Filter by creator type if provided
    if (creatorType) {
      const validCreatorTypes = ["Content Creator", "Musician", "Producer", "Event Planner", "Other"];
      if (!validCreatorTypes.includes(creatorType)) {
        return c.json({
          success: false,
          error: `Invalid creatorType. Must be one of: ${validCreatorTypes.join(", ")}`
        }, 400);
      }
      query.creatorType = creatorType;
    }
    
    // Filter by name if provided (case-insensitive partial match)
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }
    
    // Get total count for pagination info
    const totalCount = await User.countDocuments(query);
    
    // Find creators (exclude password field)
    const creators = await User.find(query)
      .select('-password') // Exclude password field
      .limit(limit)
      .skip(skip)
      .sort({ name: 1 }); // Sort by name alphabetically
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;
    
    return c.json({
      success: true,
      data: {
        creators,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNextPage,
          hasPreviousPage
        },
        filters: {
          creatorType: creatorType || null,
          name: name || null
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching creators:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch creators'
    }, 500);
  }
});

/**
 * GET /explore/creator-stats
 * Get statistics about creators by type
 */
explore.get('/creator-stats', async (c) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$creatorType',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    const totalCreators = await User.countDocuments();
    
    return c.json({
      success: true,
      data: {
        totalCreators,
        byType: stats.map(stat => ({
          creatorType: stat._id,
          count: stat.count,
          percentage: Math.round((stat.count / totalCreators) * 100)
        }))
      }
    });
    
  } catch (error) {
    console.error('Error fetching creator stats:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch creator statistics'
    }, 500);
  }
});

export default explore;