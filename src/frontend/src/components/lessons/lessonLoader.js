const MAX_LESSON_CHECKS = 500;
let cachedTotalLessons = null;

async function lessonExists(lessonNumber) {
	const path = `/lessons/lesson${lessonNumber}.json`;
	try {
		const headResponse = await fetch(path, { method: "HEAD" });
		if (headResponse.ok) {
			const contentType = headResponse.headers.get("content-type") || "";
			if (contentType.includes("application/json")) return true;
			if (contentType.includes("text/html")) return false;
		}
		if (headResponse.status !== 405) return false;
	} catch (error) {
		// Fall back to GET below
	}

	try {
		const getResponse = await fetch(path);
		if (!getResponse.ok) return false;
		const contentType = getResponse.headers.get("content-type") || "";
		if (contentType.includes("text/html")) return false;
		const body = await getResponse.text();
		if (body.trim().startsWith("<")) return false;
		return true;
	} catch (error) {
		return false;
	}
}

export async function getTotalLessons() {
	if (Number.isFinite(cachedTotalLessons)) {
		return cachedTotalLessons;
	}
	let count = 0;
	let i = 1;
	while (i <= MAX_LESSON_CHECKS) {
		const exists = await lessonExists(i);
		if (!exists) break;
		count = i;
		i += 1;
	}
	if (i > MAX_LESSON_CHECKS) {
		console.warn(`Reached lesson scan limit (${MAX_LESSON_CHECKS}). Check for missing 404s.`);
	}
	if (count === 0) {
		console.warn("No lessons found in /lessons");
	}
	cachedTotalLessons = Math.max(1, count || 1);
	return cachedTotalLessons;
}

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
export async function getCurrentLessonNumber(token, totalLessons = null) {
	try {
		const resolvedTotal = totalLessons || (await getTotalLessons());
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
			return Math.min(lessonNumber, resolvedTotal);
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
export async function loadCurrentLesson(token, totalLessons = null) {
	const resolvedTotal = totalLessons || (await getTotalLessons());
	const lessonNumber = await getCurrentLessonNumber(token, resolvedTotal);
	const lesson = await loadLessonByNumber(lessonNumber);
	return { ...lesson, totalLessons: resolvedTotal };
}

/**
 * Check if all lessons are completed
 * @param {string} token - JWT token for authentication
 * @returns {Promise<boolean>} True if all lessons completed
 */
export async function areAllLessonsComplete(token) {
	const totalLessons = await getTotalLessons();
	const currentLesson = await getCurrentLessonNumber(token, totalLessons);
	return currentLesson > totalLessons;
}

// Default export for backward compatibility
export default async function loadLesson() {
	// This is for backward compatibility - loads lesson 1 by default
	return loadLessonByNumber(1);
}
