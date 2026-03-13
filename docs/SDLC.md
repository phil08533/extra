# Landscaping Estimator & Job Manager
## Complete Software Development Life Cycle (SDLC)

## 1. Project Overview

### Purpose
The Landscaping Estimator App is designed to help landscaping companies:
- Quickly generate professional estimates
- Send estimates to customers
- Track accepted jobs
- Assign work to employees
- Track employee time on jobs
- Manage job costing

The system prioritizes:
- Simplicity
- Speed
- Offline capability
- Minimal infrastructure cost

## 2. System Architecture

The system consists of three layers.

### 1) Static Web Estimator (Free)
Runs entirely in the browser.

Features:
- Estimate builder
- Templates
- Material calculators
- PDF export
- Email sending

No accounts required.
No backend required.

### 2) Local Companion App (Optional)
Desktop + mobile companion.

Features:
- Local database
- Customer history
- Employee management
- Job assignments
- Time tracking
- Reporting

Data is stored locally.

### 3) Optional Cloud Sync (Paid Feature)
Optional module.

Allows:
- Device synchronization
- Remote backups
- Multi-device access

Users can enable or disable this.
Core app remains 100% free and open source.

## 3. User Roles

### Business Owner
Full access.

Capabilities:
- Create estimates
- Manage templates
- Manage materials
- Assign jobs
- Manage employees
- Edit time logs
- Export reports

### Manager
Limited admin.

Capabilities:
- Assign jobs
- Edit job time
- View reports

### Employee
Simple interface.

Capabilities:
- View assigned jobs
- Clock in
- Clock out
- Start lunch
- Stop lunch

## 4. Core Estimator System

The estimator is the primary feature.

### Template System
Users create reusable templates.

Example: Mulch Installation Template

Includes:
- Mulch
- Landscape fabric
- Pins
- Edging (optional)
- Labor
- Truck
- Dump fee
- Cleanup time

Template structure:

```text
Template
├ Materials
├ Labor
├ Equipment
├ Fees
└ Optional Add-ons
```

### Material Calculation Engine
Materials can automatically calculate quantities.

Example formulas:

Mulch:
```text
Cubic Yards = (Length × Width × Depth) / 324
```

Soil:
```text
Cubic Yards = Volume / 27
```

Gravel:
```text
Tons = Cubic Yards × Density
```

### Multiple Dimension Entries
Users can add multiple areas.

Example:

```text
Bed 1
12 × 4 × 3"

Bed 2
10 × 6 × 3"
```

System totals the material automatically.

## 5. Calculation Library

Large built-in library of formulas.

Examples:
- Mulch coverage
- Gravel coverage
- Soil volume
- Sod coverage
- Square footage
- Cubic yards
- Linear feet
- Block count

Users select formulas from a dropdown.
No math required.

## 6. Material Library

Businesses store their materials.

Example:

```text
Mulch
$35 per yard

Topsoil
$40 per yard

River Rock
$90 per ton
```

Option:

```text
Requires Dimension Input
```

If enabled, estimator prompts user for measurements.

## 7. Estimate PDF Generation

The system generates professional PDFs.

### Logo System
Businesses upload their logo.

Supported formats:
- PNG
- JPG
- SVG

Controls:
- Scale
- Alignment

### PDF Page 1 — Estimate
Contains:
- Company logo
- Company info
- Customer info
- Estimate number
- Itemized services
- Total cost

### PDF Page 2 — Agreement
Agreement page contains:
- Terms & conditions
- Job description
- Payment terms
- Signature area

Example:

```text
Customer Signature: ___________

Date: ___________

Approved Total: $______
```

## 8. Agreement System

Businesses set a default agreement.

Example:

```text
50% deposit required
Balance due upon completion
Work subject to weather delays
```

During estimate creation, users can:

```text
Use Default Agreement
Edit Agreement
```

## 9. Email Estimate Feature

Users send estimates directly.

Fields:

```text
Your Email
Customer Email
Message
```

Email includes:
- PDF estimate
- Payment link

## 10. Payment Page

Estimates include a **Pay Now** link.

The system does **not** process payments.
Instead it redirects to:
- PayPal
- Venmo
- Cash App
- Stripe payment links
- Zelle

Example:

```text
Pay Now
→ opens PayPal
```

## 11. Estimate Status Tracking

Each estimate has status.

Options:

```text
Accepted
Rejected
No Response
```

Accepted estimates move to the Work Dashboard.

## 12. Work Dashboard

The job dashboard shows active jobs.

Example:

```text
Mulch Install – Smith Residence
Status: Accepted
Assigned: Crew A
```

Managers can assign employees.

## 13. Employee Profiles

Employee profiles include:

```text
Name
Photo
Role
Hourly Pay
Permissions
```

Permissions example:

```text
Can Edit Time
Can Assign Jobs
Clock In Only
```

## 14. Job Assignment

Jobs can have multiple employees.

Example:

```text
Mulch Install
Crew:
John
Mike
Alex
```

System tracks total labor hours.

Example:

```text
2 workers × 5 hours = 10 labor hours
```

## 15. Time Tracking System

Designed to be extremely simple.

Employee interface includes only large buttons.

Example UI:

```text
START JOB
STOP JOB

START LUNCH
END LUNCH
```

## 16. Employee Job Screen

Shows:

```text
Job Name
Address
Crew Members
Start Button
Stop Button
```

Employees can add coworkers.

Example:

```text
Working With:
+ Add Worker
```

## 17. Time Editing

Depending on permissions:

Employees may:
- Adjust start time
- Adjust stop time

Managers always can.

## 18. Worker Dashboard

Employees can view:

```text
Today's Jobs
Current Job
Hours Worked
```

## 19. Weekly Pay Tracking

The system calculates weekly pay.

Example:

```text
John Smith

Mon: 8 hours
Tue: 7 hours
Wed: 6 hours

Total: 21 hours

Pay: $420
```

## 20. Local Database

All data is stored locally.

Database example:

```text
SQLite
```

Contains:
- Employees
- Customers
- Estimates
- Time logs
- Materials
- Templates

## 21. Data Encryption

Local database encrypted.

Suggested encryption:

```text
AES-256
```

Protects:
- Customer data
- Employee records
- Pricing data

## 22. Sync System

Two modes available.

### Local Sync (Free)
Manual sync between devices.

Example:

```text
Desktop Sync Button
```

Pulls data from employee devices.
Requires internet.
Phones upload job logs.
Desktop downloads them.

### Cloud Sync (Optional Paid Feature)
Allows:
- Automatic sync
- Device backup
- Remote access

Possible technologies:
- Firebase
- Supabase
- Simple REST server

Core app remains free.

## 23. Backup System

Users can export data.

Example:

```text
Backup Database
```

Exports:

```text
estimator_data.db
```

## 24. Security Considerations

System protects:
- Customer information
- Employee pay data
- Estimates

Security features include:
- Encryption
- Permission roles
- Local storage

## 25. Development Phases

### Phase 1 — Core Estimator
Build:
- Template system
- Calculation engine
- Material library
- Estimate builder

### Phase 2 — PDF Engine
Add:
- Logo system
- PDF export
- Agreement page

### Phase 3 — Email + Payment Links
Add:
- Email sending
- Payment links

### Phase 4 — Local Companion App
Add:
- Database
- Customers
- Estimate history

### Phase 5 — Job Management
Add:
- Work dashboard
- Employee assignments
- Job tracking

### Phase 6 — Time Tracking
Add:
- Clock in/out
- Lunch tracking
- Crew hours

### Phase 7 — Sync + Backup
Add:
- Sync button
- Backups
- Optional cloud sync

## Final Result

The software becomes a complete landscaping business system.

Features include:
- Estimating
- Job tracking
- Employee time tracking
- Professional PDFs
- Payment links
- Optional CRM
- Optional sync

All without requiring a heavy backend.
