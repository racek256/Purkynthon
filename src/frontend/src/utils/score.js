export const MAX_SCORE = 34;
const TARGET_SECONDS_PER_LESSON = 300;
const TIME_VARIATION = 0.1;

export function clampNumber(value, min, max) {
	return Math.min(max, Math.max(min, value));
}

export function normalizeTotalLessons(totalLessons) {
	return Math.max(1, Number(totalLessons) || 1);
}

export function normalizeScore(score) {
	if (!Number.isFinite(score)) return 0;
	return clampNumber(Math.round(score), 0, MAX_SCORE);
}

export function calculateLessonScore({ finishTimeMs, totalLessons }) {
	const safeTotal = normalizeTotalLessons(totalLessons);
	const baseScore = MAX_SCORE / safeTotal;
	const seconds = Math.max(0, Number(finishTimeMs) || 0) / 1000;
	const timeDelta = (TARGET_SECONDS_PER_LESSON - seconds) / TARGET_SECONDS_PER_LESSON;
	const variation = clampNumber(timeDelta * TIME_VARIATION, -TIME_VARIATION, TIME_VARIATION);
	const adjustedScore = baseScore * (1 + variation);
	return normalizeScore(adjustedScore);
}

export function calculateProgressScore({ completedLessons, totalLessons }) {
	const safeTotal = normalizeTotalLessons(totalLessons);
	const safeCompleted = clampNumber(Number(completedLessons) || 0, 0, safeTotal);
	return normalizeScore((safeCompleted / safeTotal) * MAX_SCORE);
}
