import { useAppStore } from '../store/appStore';

export function useStars() {
  const stars = useAppStore((s) => s.stars);
  const addStar = useAppStore((s) => s.addStar);
  const resetWeeklyStars = useAppStore((s) => s.resetWeeklyStars);

  const weeklyProgress = Math.min(stars.count / stars.weeklyGoal, 1);
  const isGoalReached = stars.count >= stars.weeklyGoal;

  return {
    stars,
    addStar,
    resetWeeklyStars,
    weeklyProgress,
    isGoalReached,
  };
}
