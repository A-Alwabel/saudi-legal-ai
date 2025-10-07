import { Express } from 'express';
import { authRoutes } from './auth';
import { caseRoutes } from './cases';
import { clientRoutes } from './clients';
import { documentRoutes } from './documents';
import { aiRoutes } from './ai';
import { userRoutes } from './users';
import { lawFirmRoutes } from './lawFirms';
import { analyticsRoutes } from './analytics';
import { clientPortalRoutes } from './clientPortal';
import { appointmentRoutes } from './appointments';
import { taskRoutes } from './tasks';
import { invoiceRoutes } from './invoices';
import { quotationRoutes } from './quotations';
import { expenseRoutes } from './expenses';
import { paymentRoutes } from './payments';
import { reportRoutes } from './reports';
import { employeeRoutes } from './employees';
import { leaveRoutes } from './leaves';
import { treasuryRoutes } from './treasury';
import { branchRoutes } from './branches';
import { roleRoutes } from './roles';
import { archiveRoutes } from './archive';
import { legalLibraryRoutes } from './legalLibrary';
import { notificationRoutes } from './notifications';
import { reminderRoutes } from './reminders';
import { sessionRoutes } from './sessions';
import { contactRoutes } from './contacts';
import { powerOfAttorneyRoutes } from './powerOfAttorney';
import { workUpdateRoutes } from './workUpdates';
import { executionRequestRoutes } from './executionRequests';
import { clientReportRoutes } from './clientReports';
import { lawyerPreferenceRoutes } from './lawyerPreferences';

export const initializeRoutes = (app: Express): void => {
  // API version prefix
  const apiPrefix = '/api/v1';

  // Health check (no prefix)
  app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // Authentication routes
  app.use(`${apiPrefix}/auth`, authRoutes);

  // Client Portal routes (separate authentication)
  app.use(`${apiPrefix}/client-portal`, clientPortalRoutes);

  // Protected routes (require authentication)
  app.use(`${apiPrefix}/users`, userRoutes);
  app.use(`${apiPrefix}/law-firms`, lawFirmRoutes);
  app.use(`${apiPrefix}/cases`, caseRoutes);
  app.use(`${apiPrefix}/clients`, clientRoutes);
  app.use(`${apiPrefix}/documents`, documentRoutes);
  app.use(`${apiPrefix}/appointments`, appointmentRoutes);
  app.use(`${apiPrefix}/tasks`, taskRoutes);
  app.use(`${apiPrefix}/invoices`, invoiceRoutes);
  app.use(`${apiPrefix}/quotations`, quotationRoutes);
  app.use(`${apiPrefix}/expenses`, expenseRoutes);
  app.use(`${apiPrefix}/payments`, paymentRoutes);
  app.use(`${apiPrefix}/reports`, reportRoutes);
  app.use(`${apiPrefix}/employees`, employeeRoutes);
  app.use(`${apiPrefix}/leaves`, leaveRoutes);
  app.use(`${apiPrefix}/treasury`, treasuryRoutes);
  app.use(`${apiPrefix}/branches`, branchRoutes);
  app.use(`${apiPrefix}/roles`, roleRoutes);
  app.use(`${apiPrefix}/archive`, archiveRoutes);
  app.use(`${apiPrefix}/legal-library`, legalLibraryRoutes);
  app.use(`${apiPrefix}/notifications`, notificationRoutes);
  app.use(`${apiPrefix}/reminders`, reminderRoutes);
  app.use(`${apiPrefix}/sessions`, sessionRoutes);
  app.use(`${apiPrefix}/contacts`, contactRoutes);
  app.use(`${apiPrefix}/power-of-attorney`, powerOfAttorneyRoutes);
  app.use(`${apiPrefix}/work-updates`, workUpdateRoutes);
  app.use(`${apiPrefix}/execution-requests`, executionRequestRoutes);
    app.use(`${apiPrefix}/client-reports`, clientReportRoutes);
    app.use(`${apiPrefix}/lawyer-preferences`, lawyerPreferenceRoutes);
    app.use(`${apiPrefix}/ai`, aiRoutes);
    app.use(`${apiPrefix}/analytics`, analyticsRoutes);

  // Catch-all for undefined routes
  app.all('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.originalUrl} not found`,
      error: 'Not Found',
    });
  });
};
