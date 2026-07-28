export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  adminStats: () => [...dashboardKeys.all, 'admin-stats'] as const,
};
