import { SleepRecord, GeminiAnalysis } from "../types";

// Placeholder analysis - no API calls
export const analyzeSleepRecord = async (record: SleepRecord): Promise<GeminiAnalysis> => {
  // Simulate async delay for consistency
  await new Promise(resolve => setTimeout(resolve, 300));

  if (record.status === 'incomplete') {
    return {
      score: 0,
      insight: "Looks like you're still dreaming! Don't forget to stop the timer when you wake up.",
      suggestion: "Remember to log your wake time to complete your sleep record."
    };
  }

  // Generate placeholder insights based on sleep quality
  const duration = record.duration || 0;
  const quality = record.quality || 'Unknown';
  
  let insight = '';
  let suggestion = '';
  let score = 85;

  if (duration >= 7 && duration <= 9) {
    score = 90;
    insight = "Great sleep duration! You're getting the recommended 7-9 hours of rest.";
    suggestion = "Keep up this consistent sleep schedule for optimal health.";
  } else if (duration > 9) {
    score = 75;
    insight = "You're getting plenty of rest, but maybe a bit too much.";
    suggestion = "Try to aim for 7-9 hours for the best balance.";
  } else if (duration >= 6 && duration < 7) {
    score = 70;
    insight = "Your sleep is slightly below the recommended duration.";
    suggestion = "Try going to bed 30 minutes earlier to reach 7+ hours.";
  } else if (duration < 6) {
    score = 55;
    insight = "You're not getting enough sleep. This can affect your health and mood.";
    suggestion = "Prioritize getting at least 7 hours of sleep each night.";
  } else {
    score = 80;
    insight = "Your sleep patterns are being tracked. Keep logging to see insights!";
    suggestion = "Maintain a consistent bedtime and wake time for better sleep quality.";
  }

  // Adjust based on quality rating
  if (quality === 'Excellent') {
    score = Math.min(100, score + 10);
  } else if (quality === 'Good') {
    score = Math.min(100, score + 5);
  } else if (quality === 'Fair') {
    score = Math.max(50, score - 5);
  } else if (quality === 'Poor') {
    score = Math.max(40, score - 15);
  }

  return {
    score,
    insight,
    suggestion
  };
};