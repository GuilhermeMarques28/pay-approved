import { notificationService } from "../services/notificationService";

export function startScheduler(): void {
  notificationService.schedulePaymentAlerts();

  setInterval(
    () => {
      notificationService.schedulePaymentAlerts();
    },
    60 * 60 * 1000,
  );
}
