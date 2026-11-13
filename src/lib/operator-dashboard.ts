export const OPERATOR_DASHBOARD_ROLES = ["operator", "admin"] as const;

export type OperatorDashboardOperator = {
  id: string;
  name: string;
  slug: string | null;
  baseUrl: string;
  isHidden: boolean;
};

export type OperatorDashboardMe = {
  operator: OperatorDashboardOperator;
};

export function canOpenOperatorDashboard(role: string | null | undefined) {
  return OPERATOR_DASHBOARD_ROLES.some((allowed) => allowed === role);
}

export function operatorDashboardMePath(operatorId: string | null) {
  const trimmed = operatorId?.trim();
  return trimmed
    ? `/api/operator-dashboard/me?operatorId=${encodeURIComponent(trimmed)}`
    : "/api/operator-dashboard/me";
}
