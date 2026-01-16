// Total number of available lessons
export const TOTAL_LESSONS = 5;

/**
 * Load a specific lesson by number
 * @param {number} lessonNumber - The lesson number to load (1-based)
 * @returns {Promise<Object>} The lesson data
 */
export async function loadLessonByNumber(lessonNumber) {
	try {
		const data = await fetch(`/lessons/lesson${lessonNumber}.json`);
		if (!data.ok) {
			throw new Error(`Lesson ${lessonNumber} not found`);
		}
		const response = await data.text();
		const json = JSON.parse(response);
		json.lessonNumber = lessonNumber;
		console.log(`Loaded lesson ${lessonNumber}:`, json);
		return json;
	} catch (error) {
		console.error(`Failed to load lesson ${lessonNumber}:`, error);
		throw error;
	}
}

/**
 * Get the user's current lesson from the backend
 * @param {string} token - JWT token for authentication
 * @returns {Promise<number>} The current lesson number (1-based)
 */
export async function getCurrentLessonNumber(token) {
	try {
		const data = await fetch(
			"https://aiserver.purkynthon.online/api/auth/verify",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ jwt_token: token }),
			}
		);
		const response = await data.json();
		
		if (response.success) {
			// level is 0-indexed, so add 1 for lesson number
			const lessonNumber = (response.level || 0) + 1;
			// Don't go past the total lessons
			return Math.min(lessonNumber, TOTAL_LESSONS);
		}
		return 1; // Default to first lesson
	} catch (error) {
		console.error("Failed to get current lesson:", error);
		return 1;
	}
}

/**
 * Load the current lesson for the user based on their progress
 * @param {string} token - JWT token for authentication
 * @returns {Promise<Object>} The lesson data
 */
export async function loadCurrentLesson(token) {
	const lessonNumber = await getCurrentLessonNumber(token);
	return loadLessonByNumber(lessonNumber);
}

/**
 * Check if all lessons are completed
 * @param {string} token - JWT token for authentication
 * @returns {Promise<boolean>} True if all lessons completed
 */
export async function areAllLessonsComplete(token) {
	const currentLesson = await getCurrentLessonNumber(token);
	return currentLesson > TOTAL_LESSONS;
}

// Default export for backward compatibility
export default async function loadLesson() {
	// This is for backward compatibility - loads lesson 1 by default
	return loadLessonByNumber(1);
}
