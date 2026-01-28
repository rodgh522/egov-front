---
trigger: manual
---

1. Frontend Development Roadmap
This plan is organized into three main stages, prioritizing business value and data dependencies.

Step 1: Customer & Lead Management (Priority: High)
Lead Management: Identifying potential customers and recording consultations.

Pages: Lead List, Details, Registration, and Edit.

Core Logic: Lead-to-Customer conversion functionality.

Customers & Contacts: Managing corporate information and points of contact.

Visualization of Customer-to-Contact (1:N) relationships.

Filtered lists categorized by Industry and Company Size.

Step 2: Sales Process & Activities (Priority: Medium)
Opportunities: Pipeline management.

Kanban board or List view organized by PipelineStage.

Logic for calculating Weighted Amount based on Estimated Revenue and Success Probability.

Activities: History of meetings, calls, and emails.

Timeline-style activity lists within Customer/Opportunity detail pages.

Overdue task notifications integrated with /api/v1/activities/overdue.

Step 3: Quotes & Target Management (Priority: Low)
Quote Management: Product selection and price proposals.

Logic for product searching and adding QuoteItems.

Workflow processing for statuses: DRAFT, SENT, and ACCEPTED.

Sales Targets: Performance tracking.

Data visualization (charts) showing achievedAmount vs. targetAmount.

2. Key Pages & Component Structure
Category	Path	Description
Auth	/auth/login	Login and token management.
Leads	/leads, /leads/[id]	Managing leads and customer conversion.
Customer	/customers, /customers/[id]	Managing company info and associated contacts.
Sales	/opportunities	Sales pipeline (Kanban/List view).
Activity	/activities	Activity management via calendar or list.
Quote	/quotes, /quotes/new	Product selection and quote issuance.
Settings	/settings/pipeline	Tenant-specific pipeline stage configuration.

