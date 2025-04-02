import axios from 'axios';
import { User, Post, Comment } from './types';

// Test server URL
const TEST_SERVER_URL = 'http://20.244.56.144/evaluation-service';

// In-memory storage
const usersMap = new Map<string, User>(); // { userId: { name, postCount } }
const postsMap = new Map<string, Post>(); // { postId: { userId, content, commentCount } }
const commentsMap = new Map<string, Comment[]>(); // { postId: [comments] }

// Headers with your access code (replace with your actual access token)
const headers = {
  Authorization: 'Bearer YOUR_ACCESS_TOKEN', // Replace with your token
};

/**
 * Fetches and caches data from the test server
 */
export async function fetchAndCacheData(): Promise<void> {
  try {
    // Fetch all users
    const usersResponse = await axios.get(`${TEST_SERVER_URL}/users`, { headers });
    const users: string[] = usersResponse.data.users;

    // For each user, fetch their posts and comments
    for (const userId of users) {
      // Initialize user in usersMap
      usersMap.set(userId, { userId, name: userId, postCount: 0 });

      // Fetch posts for the user
      const postsResponse = await axios.get(`${TEST_SERVER_URL}/users/${userId}/posts`, { headers });
      const posts: { id: string; userid: string; content: string }[] = postsResponse.data.posts;

      // Update post count for the user
      usersMap.get(userId)!.postCount = posts.length;

      // For each post, fetch comments and store data
      for (const post of posts) {
        postsMap.set(post.id, {
          postId: post.id,
          userId: post.userid,
          content: post.content,
          commentCount: 0,
        });

        // Fetch comments for the post
        const commentsResponse = await axios.get(`${TEST_SERVER_URL}/posts/${post.id}/comments`, { headers });
        const comments: Comment[] = commentsResponse.data.comments;

        // Store comments and update comment count
        commentsMap.set(post.id, comments);
        postsMap.get(post.id)!.commentCount = comments.length;
      }
    }

    console.log('Data fetched and cached successfully');
  } catch (error) {
    console.error('Error fetching data:', error instanceof Error ? error.message : error);
    throw error;
  }
}

/**
 * Gets the top 5 users by post count
 */
export function getTopUsers(): User[] {
  return Array.from(usersMap.values())
    .sort((a, b) => b.postCount - a.postCount)
    .slice(0, 5);
}

/**
 * Gets posts based on the type (latest or popular)
 * @param type - 'latest' or 'popular'
 */
export function getPosts(type: string): Post[] {
  const allPosts = Array.from(postsMap.values());

  if (type === 'popular') {
    // Sort by comment count (descending)
    const sortedPosts = allPosts.sort((a, b) => b.commentCount - a.commentCount);
    const maxCommentCount = sortedPosts[0]?.commentCount || 0;
    // Return all posts with the maximum comment count
    return sortedPosts.filter(post => post.commentCount === maxCommentCount);
  } else if (type === 'latest') {
    // Sort by post ID (descending, assuming higher ID means newer)
    return allPosts
      .sort((a, b) => parseInt(b.postId) - parseInt(a.postId))
      .slice(0, 5);
  } else {
    throw new Error('Invalid type parameter. Use "latest" or "popular".');
  }
}
