# Generic Business Requirements Template - Order Form

Use this template for any project by replacing the placeholders in **\[ \]**.

# Business Requirement Document (BRD)

## Document Information

| Field            | Value                                  |
| ---------------- | -------------------------------------- |
| Project Name     | \[Project Name\]                       |
| Requirement ID   | \[REQ-001\]                            |
| Requirement Name | \[Order Form Creation and Submission\] |
| Business Owner   | \[Name\]                               |
| Business Analyst | \[Name\]                               |
| Version          | \[Version\]                            |
| Date             | \[DD/MM/YYYY\]                         |

# 1\. Business Objective

## Background

Provide a brief description of the business problem or opportunity.

**Example:** The business requires a standardized order form to capture customer requests and facilitate order processing.

## Objective

The purpose of this requirement is to enable users to:

- \[Objective 1\]
- \[Objective 2\]
- \[Objective 3\]

## Success Criteria

- Reduced manual processing effort.
- Improved data accuracy.
- Faster order submission and approval.
- Complete audit trail.

# 2\. Scope

## In Scope

- Create order forms.
- Capture customer details.
- Capture product/service details.
- Calculate totals.
- Submit orders.
- Generate order reference number.

## Out of Scope

- Payment processing.
- Customer account creation.
- Inventory management.
- External system changes.

# 3\. Stakeholders

| Column 1           | Column 2                   |
| ------------------ | -------------------------- |
| Role               | Responsibility             |
| Business Owner     | Defines business needs     |
| End User           | Creates and submits orders |
| Operations Team    | Processes orders           |
| Solution Architect | Designs solution           |
| Development Team   | Implements solution        |
| Testing Team       | Verifies functionality     |

# 4\. Functional Requirements

## FR-01: Create Order

**Description**

The system shall allow users to create a new order.

**Inputs**

- Customer information
- Product information
- Delivery details

**Output**

- Draft order created

## FR-02: Customer Information

**Description**

The system shall allow users to enter customer details.

### Fields

| Field            | Mandatory | Validation             |
| ---------------- | --------- | ---------------------- |
| Customer Name    | Yes       | Maximum 100 characters |
| Email Address    | Yes       | Valid email format     |
| Contact Number   | Yes       | Numeric only           |
| Billing Address  | Yes       | Not blank              |
| Delivery Address | Yes       | Not blank              |

## FR-03: Order Details

**Description**

The system shall allow users to add one or multiple items.

### Fields

| Field        | Mandatory | Validation           |
| ------------ | --------- | -------------------- |
| Product Code | Yes       | Must exist           |
| Product Name | Yes       | Auto populated       |
| Quantity     | Yes       | Greater than 0       |
| Unit Price   | Yes       | Currency value       |
| Discount     | No        | Percentage or amount |
| Tax          | No        | Configured rate      |

## FR-04: Order Calculations

**Description**

The system shall automatically calculate all financial values.

### Calculation Values

- Subtotal
- Discount Amount
- Tax Amount
- Shipping Cost
- Total Amount

### Formula

1 Total Amount =

2 Subtotal - Discount + Tax + Shipping

## FR-05: Validation

The system shall prevent order submission when:

- Mandatory fields are missing.
- Quantity is less than or equal to zero.
- Invalid customer information is entered.
- No order items exist.

## FR-06: Review Order

The system shall provide an order summary page displaying:

- Customer information
- Delivery information
- Order items
- Totals and charges

## FR-07: Submit Order

The system shall:

- Save the order.
- Generate a unique order number.
- Display confirmation message.
- Send notification where applicable.

# 5\. Business Rules

| Rule ID | Business Rule                           |
| ------- | --------------------------------------- |
| BR-01   | An order must contain at least one item |
| BR-02   | Mandatory fields must be completed      |
| BR-03   | Quantity must be greater than zero      |
| BR-04   | Order reference must be unique          |
| BR-05   | Only authorised users may submit orders |

# 6\. Non-Functional Requirements

## Performance

- Form shall load within 3 seconds.
- Calculations shall complete within 1 second.

## Security

- Users must be authenticated.
- Sensitive information must be protected.

## Audit

The system shall record:

- Created By
- Created Date
- Updated By
- Updated Date
- Submitted By
- Submitted Date

## Availability

- System availability: 99.9%

# 7\. User Story

1 As a \[User Role\]

2

3 I want to create and submit an order form

4

5 So that orders can be processed accurately and efficiently.

# 8\. Acceptance Criteria

### Scenario: Successful Order Submission

**Given** A user has entered all mandatory information

**When** The user submits the order

**Then**

- The order is saved.
- An order number is generated.
- A confirmation message is displayed.
- The order becomes available for processing.

# 9\. Assumptions

- Product information is available.
- Users have the appropriate permissions.
- Notification services are operational.

# 10\. Dependencies

- Authentication service
- Product catalogue
- Notification service
- Reporting system

# 11\. Risks

| Risk                  | Impact | Mitigation                      |
| --------------------- | ------ | ------------------------------- |
| Incorrect data entry  | High   | Validation rules                |
| Duplicate submissions | Medium | Unique order references         |
| Service outage        | High   | Retry and monitoring mechanisms |

# 12\. Approval

| Name              | Role               | Status  | Date |
| ----------------- | ------------------ | ------- | ---- |
| \[Approver Name\] | Business Owner     | Pending |      |
| \[Approver Name\] | Product Owner      | Pending |      |
| \[Approver Name\] | Solution Architect | Pending |      |

This template can be reused for **Order Forms, Request Forms, Registration Forms, Approval Forms, Service Requests, Change Requests, and Workflow-based applications** by simply replacing the business process and field definitions.