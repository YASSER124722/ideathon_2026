1. Project overview
Build VMS Nexus, a modern, secure, intelligent inventory and
demand-management web application for the VMS Industrie hackathon
challenge.

The application helps VMS Industrie anticipate motorcycle demand across
its dealership network, identify shortages and excess stock, recommend
stock transfers, and protect company information through role-based
access and a segmented network design.

The application must be a working interactive prototype, not merely
a static landing page or a collection of dashboard screenshots.
Prioritize a coherent end-to-end demonstration with realistic workflows,
polished UI/UX, and clear system architecture.
Core business problem
VMS Industrie manufactures motorcycles and distributes them through more
than 80 agencies in Algeria. Some components are imported and have long
lead times. Some agencies face stock shortages while others retain
unsold inventory.

The company also has interconnected production units, remote sites,
shared files, and internal systems containing sensitive commercial,
financial, HR, and technical information.

VMS Nexus must help anticipate demand, improve inventory allocation, and
protect information without adding unnecessary friction to employees'
work.
2. Important organizational structure
The application already has three user roles. Preserve these role
names and build the application around them:
1. Agence --- dealership-level user.
2. Unité de production --- production-unit-level user.
3. Direction --- central management user.
Do not replace these roles with a different role model. Internal
permission details may be refined, but these three roles must remain the
primary application roles.
Organizational hierarchy
- One production unit serves a group of agencies in its nearby region.
- Each agency belongs to one production unit.
- A production unit has its own warehouse and manages its assigned
  agencies.
- Production units can coordinate and share stock with other
  production units when necessary.
- Direction has a central overview of all production units and
  agencies.
Role permissions
Agence
- View its own stock by motorcycle model.
- View its own sales history and demand forecast.
- View low-stock and shortage alerts.
- View recommendations relevant to its agency.
- Request replenishment or propose a stock transfer.
- Track the status of its requests and transfers.
- Cannot view other agencies' confidential details or manage another
  production unit.
Unité de production
- View its own warehouse and all agencies assigned to its production
  unit.
- View aggregated demand and forecasts for its region.
- Review agency shortages and excess stock.
- Approve or reject transfers within its authorized scope.
- Recommend warehouse replenishment and production/procurement
  actions.
- Coordinate stock transfers with other production units.
- View operational activity and relevant audit records for its unit.
- Cannot access unrelated production units' restricted information
  unless an authorized inter-unit workflow permits it.
Direction
- View a consolidated overview of all production units and agencies.
- Compare demand, stock, shortages, excess inventory, and forecasts
  across regions.
- View inter-unit transfer recommendations and approve actions
  assigned to Direction.
- Monitor operational performance and security alerts.
- Manage organizational records and user access in the prototype.
- View central audit activity.
Enforce permissions in the application's navigation, UI, and
server-side/API logic. Hiding a button alone is not sufficient
authorization.
3. Data policy and source limitations
VMS Industrie has not supplied internal sales, inventory, production, or
dealership data.

Use two distinct data categories:
Public catalog data
Use public information from these user-provided sources to create a
motorcycle catalog:
- https://www.autobip.com/ar/prix-vms-algerie/81
- https://motobladi.dz/product-brand/vms/
Public catalog fields may include: - Motorcycle model/name - Brand -
Category, if listed - Publicly listed price - Product image, if
permitted and available - Source URL - Date collected or source
publication date

Do not assume that public prices are current. Display source dates and
label prices as public reference prices.

Before automated scraping, check each website's terms, robots.txt, and
access restrictions. Respect rate limits; do not bypass authentication,
access controls, or anti-bot protections. If automated collection is not
permitted or fails, use a small manually reviewed catalog and retain
source attribution.
Simulated business data
Generate clearly labeled synthetic data for: - Agency sales history -
Agency and warehouse inventory - Minimum stock levels - Forecast inputs
and outputs - Incoming orders and transfers - Production-unit and agency
assignments - Lead times and replenishment assumptions

Never present synthetic values as actual VMS Industrie data. Add a
visible label such as "Données de démonstration --- simulées" or
"Demo data --- simulated" wherever users could mistake them for real
business data.

The prototype must remain usable without access to any private VMS
system or API.
4. Main product capabilities
4.1 Demand forecasting
Forecast demand by: - Motorcycle model - Individual agency - Production
unit, aggregated from its agencies - Forecast horizon

Support at least these horizons: - 7 days - 30 days - 90 days

The interface should show historical demand, forecast demand, current
stock, expected shortage/excess, and a clear explanation of the
forecast's assumptions.
an important point is the last months and last days has a potential impact on the forecast.

For the prototype, use a transparent baseline method such as a weighted
moving average or another simple method that can be explained to the
jury. Do not claim the model is highly accurate or production-ready
without validation.

Forecasts should be refreshed when new simulated sales or inventory data
is added. Show that a closer horizon may be more actionable, but do not
claim forecast accuracy automatically improves just because the target
date is closer.
4.2 Inventory and safety stock
Track stock at: - Each agency - Each production-unit warehouse

Support configurable minimum stock / safety stock per model and
location.

Use a transparent reorder-point rule such as:

Reorder point = expected demand during replenishment lead time + safety stock

Show current quantity, expected demand during lead time, safety stock,
incoming stock, and the resulting reorder recommendation.

Avoid a single universal minimum stock threshold for every agency and
model.
4.3 Smart replenishment and stock transfer recommendations
This is a core differentiator and must connect forecasting to concrete
business actions.

When a shortage is predicted, evaluate possible actions in this order:
1. Transfer available excess stock from a suitable nearby agency, while
   preserving that agency's own safety stock.
2. Replenish from the assigned production-unit warehouse.
3. If local stock is insufficient, check whether another production
   unit can provide stock through an authorized inter-unit workflow.
4. If no existing stock is available, recommend a production or
   procurement action for human review.
Recommendations should consider: - Forecast demand - Current stock -
Safety stock - Incoming orders - Available excess stock - Source and
destination production-unit relationship - Simulated lead time and
transport constraints

Do not automatically execute a transfer. Require the appropriate role to
review and approve it.
4.4 Transfer workflow
Implement an interactive end-to-end workflow:
1. The system detects or simulates an impending shortage.
2. It proposes a suitable source and quantity.
3. The responsible user receives an in-app notification.
4. The authorized manager reviews and approves or rejects the proposal.
5. On approval, update the simulated stock quantities consistently.
6. Record the action in an audit trail.
7. Update relevant inventory views and forecasts.
Use clear transfer states, for example: - Proposed - Pending approval -
Approved - Rejected - In transit - Completed - Cancelled

The prototype must make the state changes visible to the user.
4.5 Spare-parts demand relationship
Include this as a future-ready or lightweight prototype capability.

Do not assume motorcycle sales alone directly determine immediate
spare-parts demand. Spare-parts demand can also depend on the existing
motorcycle fleet, vehicle age, usage, maintenance, and repair history.

If spare parts are demonstrated, clearly label assumptions and simulated
relationships. Do not present unsupported correlations as validated
facts.
4.6 Security and audit
The application should demonstrate: - Role-based access control using
the three existing roles. - Separation of agency, production-unit, and
central views. - Audit records for important actions such as approvals,
rejections, stock updates, and permission changes. - A security
monitoring screen with simulated security events. - A demonstration of
an unauthorized access attempt being denied.

Security events in the UI may be simulated for the hackathon. Clearly
distinguish simulated events from real monitoring.
5. Cybersecurity architecture concept
The intended network model is:
- One VM represents one production unit.
- That VM represents the production unit's network and its assigned
  nearby agencies.
- Each production unit has a warehouse and multiple agencies.
- Production units communicate through a controlled central network.
- Sensitive services and data are separated from agency networks.
Use network segmentation, firewall rules, and encrypted connections in
the proposed architecture. Do not claim that VMs alone provide security.

For the prototype, simulate the architecture and access-denial scenario
in the application. A small VirtualBox demonstration may be added if
time permits, but do not make the UI dependent on real VM connectivity.

The architecture diagram should show: - Central Direction / central
services - Production Unit 1 VM and its agencies - Production Unit 2 VM
and its agencies - Production Unit 3 VM and its agencies - Controlled
inter-unit communication - Isolated sensitive-data environment -
Firewalls / access-control boundaries

The number of production units and agencies must be configurable; three
units and a few agencies per unit are only demonstration data.
6. Required application pages
Build a consistent application shell with navigation and a role-aware
header.
A. Login / role selection for demo
Provide a demo-friendly way to enter as one of the three roles: -
Agence - Unité de production - Direction

If authentication is mocked, label it as a prototype/demo mode. Do not
store real passwords or secrets in client-side code.

Allow the demo user to select a specific agency or production unit when
appropriate.
B. Central dashboard
For Direction, show: - Total simulated stock - Predicted demand for
selected horizon - Number of agencies with critical shortage risk -
Number of locations with excess stock - Pending approvals - Demand and
inventory charts - Critical alerts - Production-unit comparison

For other roles, show only the data permitted for their scope.
C. Forecasting
Include: - Model selector - Agency / production-unit selector based on
role - 7/30/90-day horizon selector - Historical and forecast chart -
Forecast assumptions or explanation - Current stock and predicted
shortage/excess - Suggested action
D. Inventory
Include: - Search and filters - Model, location, current quantity,
safety stock, incoming stock, and status - Low-stock and excess-stock
indicators - Details view for a selected model/location
E. Smart transfers
Include: - Recommended transfers - Source and destination -
Product/model and quantity - Reason for recommendation - Expected effect
on source and destination stock - Approval/rejection actions based on
role - Transfer status and history
F. Production units
For authorized roles, show: - Production-unit summary - Assigned
agencies - Warehouse inventory - Aggregated demand - Cross-unit stock
coordination - Unit-level alerts
G. Security
Include: - Conceptual network topology - Role/access overview -
Simulated security events - Audit log - Unauthorized-access
demonstration
H. Settings / data source
Include: - Demo-data label - Catalog source attribution - Data
collection/source date where available - Forecast assumptions - Ability
to reset demo data if practical
7. UI/UX and visual design
Build a polished industrial B2B dashboard, not a generic consumer app.
Visual direction
- Professional, calm, modern, industrial.
- Clear hierarchy and generous spacing.
- High contrast and readable typography.
- Avoid excessive animation, gradients, and decorative elements.
- Use color consistently for status, not as the only status indicator.
Suggested palette: - Deep navy for navigation and primary structure -
Teal/blue for primary actions and information - Amber/orange for
warnings - Red for critical states - Neutral light backgrounds for
tables and dashboards

Use icons consistently and include text labels alongside important
status colors.
UX requirements
- Responsive desktop-first dashboard, usable on tablet.
- Main actions should be easy to find.
- Use clear empty, loading, error, and success states.
- Confirm consequential actions such as approving or rejecting
  transfers.
- Use realistic, concise French or English interface text
  consistently; do not mix languages randomly.
- Make the demo workflow easy for a jury to follow.
8. Technology and implementation requirements
Use: - Next.js with App Router - TypeScript - Tailwind CSS - shadcn/ui
or equivalent accessible components - Recharts for charts - Lucide
icons - PostgreSQL and Prisma if a database is introduced

Start with local mock/synthetic data so the prototype can be developed
quickly. Keep data access and business logic separate from UI
components.

Suggested structure:
src/
  app/
    login/
    dashboard/
    forecasting/
    inventory/
    transfers/
    production-units/
    security/
    settings/
    api/
  components/
    layout/
    dashboard/
    charts/
    inventory/
    transfers/
    security/
  lib/
    data/
    forecasting/
    inventory/
    permissions/
    recommendations/
  types/
Prefer small, reusable components and typed data models.

Do not overengineer the prototype. Build the complete demonstration flow
first, then add database persistence or real network integration only if
time allows.
9. Suggested data entities
Use typed models for at least:
- ProductionUnit
- Agency
- Product
- InventoryRecord
- SalesRecord
- Forecast
- Transfer
- User / DemoUser
- AuditEvent
- SecurityEvent
Key relationship: - Each agency belongs to one production unit. - Each
inventory record belongs to a product and a location. - Each transfer
has a source, destination, product, quantity, status, and audit history.

Use stable IDs rather than display names as relationships.
10. Demo scenario the application must support
Create a clear scenario using simulated data:
1. Agency A is predicted to run short of a motorcycle model within
   seven days.
2. Agency B, in the same production unit, has excess stock after its
   safety stock is protected.
3. The system recommends transferring an appropriate quantity from B to
   A.
4. The production-unit manager reviews and approves the transfer.
5. Stock quantities and transfer status update in the UI.
6. The audit log records who approved the transfer and when.
7. Direction can see the consolidated impact.
Add a second short security scenario:
1. A demo user from Agency A attempts to access restricted data
   belonging to another production unit.
2. The application denies access.
3. A simulated security event appears in the security view.
4. The event is recorded in the audit/security log.
All scenario data must be clearly identified as simulated.
11. Deliverable expectations
The application should support the hackathon deliverables:
1. Interactive UI/UX prototype: coherent identity, role-specific
   views, and complete user journeys.
2. Technical report support: clear roles, functional requirements,
   non-functional requirements, architecture, data flow, and security
   rationale.
3. Deployment and feasibility support: explain a pilot deployment
   using one production unit and a small group of agencies before
   scaling.
4. Business model support: explain qualitative value such as fewer
   shortages, less excess stock, better coordination, and improved data
   protection. Do not invent unsupported financial estimates.
12. Implementation priorities
Build in this order:
1. Create the app shell, navigation, and role selector using the three
   existing roles.
2. Define typed synthetic data and organizational relationships.
3. Build the role-aware dashboard.
4. Build inventory and forecasting screens.
5. Implement stock-transfer recommendations and approval workflow.
6. Add audit history and the security view.
7. Add source attribution and demo-data labels.
8. Polish responsive behavior, empty states, and the jury demo path.
13. Acceptance criteria
The prototype is ready for demonstration when:
- The three existing roles are preserved and have distinct,
  appropriate views.
- One production unit contains multiple agencies.
- A production unit's dashboard aggregates its agencies' data.
- Direction can view consolidated information across units.
- Forecasts and stock values are visibly labeled as simulated.
- A shortage can lead to a stock-transfer recommendation.
- An authorized manager can approve or reject the transfer.
- Approval updates the displayed stock and transfer status.
- The action appears in an audit log.
- Unauthorized access is denied in the prototype.
- The security screen shows the simulated incident.
- The application has a consistent, professional UI and can be
  demonstrated without private VMS data.
14. Agent behavior while implementing
- Inspect the existing codebase before making changes.
- Preserve the three existing roles and any working code that already
  implements them.
- Do not overwrite existing project configuration without checking it
  first.
- Build incrementally and keep the application runnable after each
  major step.
- Use realistic synthetic data and clearly label it.
- Do not invent VMS internal facts, real dealership assignments,
  actual sales, or actual inventory.
- Explain assumptions in the UI or documentation where they affect
  interpretation.
- Prefer a complete, testable business workflow over many unfinished
  features.
- When a requirement is ambiguous, choose the simplest safe
  implementation and document the assumption.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:nextjs-agent-feedback -->

## Report Next.js feedback

The project owner enabled `experimental.agentFeedback`, authorizing this feedback pass. When enabled, `next dev` writes this block and restores it if removed. Commit `AGENTS.md` with your work to keep the tree clean.

During the current user request, retain anonymized facts as feedback candidates for meaningful or recurring Next.js issues:

- Crashes, hangs, OOMs, or unexpected slowness
- Incorrect behavior, output, errors, or diagnostics
- Missing, unclear, or conflicting documentation
- Unexpected CLI, codemod, Skill, or upgrade behavior and non-obvious workarounds

Continue the current user request without reporting immediately. Routine debugging is not feedback. Verify changes before retaining them as feedback candidates. Never retain code, logs, paths, URLs, secrets, personal information, or project-specific data.

Retain qualifying friction even if it is later fixed or worked around; record the final outcome during the reporting pass.

Before the final response, run one reporting pass. If candidates remain, from this file's directory run `npx --no-install next internal agent-feedback-instructions` once without piping or truncating its output. Follow its output or error guidance. If a network sandbox blocks it, retry with network access; if it still returns no output, continue normally.

<!-- END:nextjs-agent-feedback -->
