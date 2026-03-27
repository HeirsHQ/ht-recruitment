# Recruitment Portal — API Specification

> Authentication is handled separately and is not part of this spec.

All responses follow the envelope:

```json
{
  "success": true,
  "data": {},
  "status": 200,
  "meta": {} // pagination, counts — present on list endpoints
}
```

Error responses:

```json
{
  "success": false,
  "error": { "code": "NOT_FOUND", "message": "Job not found" },
  "status": 404
}
```

Pagination query params (all list endpoints):
| Param | Type | Default | Description |
|----------|--------|---------|------------------------|
| `page` | number | 0 | Zero-based page index |
| `limit` | number | 20 | Items per page (max 100) |

---

## Jobs

### `GET /jobs`

List jobs with optional filters.

| Query Param      | Type   | Description                                                                                                                          |
| ---------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `search`         | string | Search title, company, location, role                                                                                                |
| `status`         | string | `open`, `closed`, `cancelled`, `pending`, `in progress`                                                                              |
| `jobType`        | string | `full-time`, `part-time`, `contract`                                                                                                 |
| `workType`       | string | `on-site`, `hybrid`, `remote`                                                                                                        |
| `experienceType` | string | `internship`, `entry-level`, `associate-level`, `mid-level`, `senior-level`, `management-level`, `director-level`, `executive-level` |
| `department`     | string | Department name                                                                                                                      |
| `salaryMin`      | number | Minimum salary floor                                                                                                                 |
| `salaryMax`      | number | Maximum salary ceiling                                                                                                               |

**Response** `200`

```json
{
  "data": [Job],
  "meta": { "page": 0, "limit": 20, "total": 48 }
}
```

### `GET /jobs/:id`

Get full job details including nested applications.

**Response** `200` — `Job` object
**Response** `404` — job not found

### `POST /jobs`

Create a new job.

**Body** — `CreateJobDto`

| Field              | Type     | Required | Notes                                |
| ------------------ | -------- | -------- | ------------------------------------ |
| `title`            | string   | yes      |                                      |
| `description`      | string   | no       |                                      |
| `jobType`          | string   | no       | `full-time`, `part-time`, `contract` |
| `workType`         | string   | no       | `on-site`, `hybrid`, `remote`        |
| `experienceType`   | string   | no       |                                      |
| `location`         | string   | no       |                                      |
| `remote`           | boolean  | no       |                                      |
| `role`             | string   | no       |                                      |
| `department`       | string   | no       |                                      |
| `company`          | string   | no       |                                      |
| `salaryMin`        | number   | no       | >= 0                                 |
| `salaryMax`        | number   | no       | must be >= `salaryMin`               |
| `currency`         | string   | no       | `NGN`, `USD`, `EUR`, `GBP`           |
| `openUntil`        | datetime | no       | must be in the future                |
| `responsibilities` | string[] | no       |                                      |
| `requirements`     | string[] | no       |                                      |
| `benefits`         | string[] | no       |                                      |
| `tags`             | string[] | no       |                                      |

**Response** `201` — created `Job`

### `PUT /jobs/:id`

Update a job. Accepts same fields as create.

**Response** `200` — updated `Job`
**Response** `404` — job not found

### `PATCH /jobs/:id/status`

Change job status.

**Body**

| Field    | Type   | Required | Notes                                                   |
| -------- | ------ | -------- | ------------------------------------------------------- |
| `status` | string | yes      | `open`, `closed`, `cancelled`, `pending`, `in progress` |

**Response** `200` — updated `Job`

### `DELETE /jobs/:id`

Delete a job. Fails if the job has active applications.

**Response** `204` — no content
**Response** `409` — conflict (has applications)

### `GET /jobs/:id/analytics`

Job-level analytics.

**Response** `200`

```json
{
  "data": {
    "views": 342,
    "applicationsOverTime": [{ "date": "2026-03-01", "count": 5 }],
    "sourceBreakdown": [{ "source": "LinkedIn", "count": 12, "percentage": 35 }],
    "stats": { "total": 34, "pending": 12, "accepted": 8, "rejected": 14 }
  }
}
```

### `GET /jobs/:id/activities`

Audit trail of events for a job (applications received, stage changes, notes, etc.).

**Response** `200` — paginated `ActivityEntry[]`

```json
{
  "data": [
    {
      "id": "...",
      "type": "application_received",
      "message": "New application from Jane Doe",
      "actorName": "System",
      "candidateName": "Jane Doe",
      "fromStage": null,
      "toStage": null,
      "createdAt": "2026-03-15T10:00:00Z"
    }
  ],
  "meta": { "page": 0, "limit": 20, "total": 12 }
}
```

`type` enum: `application_received`, `stage_changed`, `note_added`, `status_changed`, `attachment_uploaded`

### `GET /jobs/:id/attachments`

List attachments for a job.

**Response** `200` — `Attachment[]`

```json
{
  "data": [
    {
      "id": "...",
      "name": "job-description.pdf",
      "url": "https://...",
      "mimeType": "application/pdf",
      "size": 204800,
      "uploadedAt": "2026-03-10T09:00:00Z",
      "uploadedBy": "John HR"
    }
  ]
}
```

### `POST /jobs/:id/attachments`

Upload a file attachment to a job.

**Body** — `multipart/form-data`

| Field  | Type | Required | Notes |
| ------ | ---- | -------- | ----- |
| `file` | file | yes      |       |

**Response** `201` — created `Attachment`

### `DELETE /jobs/:id/attachments/:attachmentId`

Remove a job attachment.

**Response** `204` — no content

---

## Job Templates

### `GET /job-templates`

List available job templates.

**Response** `200` — `JobTemplate[]`

### `GET /job-templates/:id`

Get a single template.

**Response** `200` — `JobTemplate`

---

## Applications

### `POST /jobs/:jobId/applications`

Submit a job application (public).

**Body** — `multipart/form-data`

| Field         | Type     | Required | Notes             |
| ------------- | -------- | -------- | ----------------- |
| `fullName`    | string   | yes      |                   |
| `email`       | string   | yes      | valid email       |
| `phoneNumber` | string   | yes      |                   |
| `location`    | string   | yes      |                   |
| `linkedInUrl` | string   | yes      | valid URL         |
| `summary`     | string   | yes      |                   |
| `skills`      | string[] | yes      |                   |
| `coverLetter` | string   | yes      |                   |
| `resumeFile`  | file     | yes      | PDF only, max 5MB |

**Response** `201` — created `JobApplication`

### `GET /jobs/:jobId/applications`

List applications for a job.

| Query Param | Type   | Description                                                                        |
| ----------- | ------ | ---------------------------------------------------------------------------------- |
| `status`    | string | Filter by pipeline stage ID                                                        |
| `source`    | string | `LinkedIn`, `Referral`, `Job Board`, `Company Website`, `Recruiter`, `Career Fair` |
| `sortBy`    | string | `matchScore`, `appliedAt`, `status`                                                |
| `order`     | string | `asc`, `desc`                                                                      |

**Response** `200` — paginated `JobApplication[]`

### `GET /jobs/:jobId/applications/:applicationId`

Get application details.

**Response** `200` — `JobApplication`
**Response** `404`

### `PATCH /jobs/:jobId/applications/:applicationId/status`

Move application to a different pipeline stage.

**Body**

| Field    | Type   | Required | Notes           |
| -------- | ------ | -------- | --------------- |
| `status` | string | yes      | Target stage ID |

**Response** `200` — updated `JobApplication`
**Response** `409` — stage requires approval (triggers approval request automatically)

### `PATCH /jobs/:jobId/applications/:applicationId/rating`

Set a rating on an application.

**Body**

| Field    | Type   | Required | Notes                                                   |
| -------- | ------ | -------- | ------------------------------------------------------- |
| `rating` | string | yes      | `none`, `strong-yes`, `yes`, `maybe`, `no`, `strong-no` |

**Response** `200`

### `POST /jobs/:jobId/applications/:applicationId/notes`

Add a note to an application.

**Body**

| Field  | Type   | Required |
| ------ | ------ | -------- |
| `text` | string | yes      |

**Response** `201`

---

## Pipeline Stages (per job)

### `GET /jobs/:jobId/stages`

List all pipeline stages for a job.

**Response** `200` — `PipelineStageConfig[]`

### `POST /jobs/:jobId/stages`

Add a new stage.

**Body**

| Field                        | Type     | Required | Notes                                                                           |
| ---------------------------- | -------- | -------- | ------------------------------------------------------------------------------- |
| `title`                      | string   | yes      | unique within job                                                               |
| `color`                      | string   | yes      | hex colour                                                                      |
| `notifications.enabled`      | boolean  | no       |                                                                                 |
| `notifications.recipients`   | string[] | no       | email addresses                                                                 |
| `approval.required`          | boolean  | no       |                                                                                 |
| `approval.approvers`         | string[] | no       | email addresses                                                                 |
| `workflow.autoMoveAfterDays` | number   | no       |                                                                                 |
| `workflow.sendEmailTemplate` | string   | no       | `status-update`, `interview-invite`, `rejection`, `offer-letter`, or empty `""` |

**Response** `201` — created `PipelineStageConfig`
**Response** `409` — duplicate stage title

### `PUT /jobs/:jobId/stages/:stageId`

Update a stage's configuration.

**Response** `200` — updated `PipelineStageConfig`

### `PUT /jobs/:jobId/stages/reorder`

Reorder stages.

**Body**

| Field      | Type     | Required | Notes                     |
| ---------- | -------- | -------- | ------------------------- |
| `stageIds` | string[] | yes      | ordered list of stage IDs |

**Response** `200`

### `DELETE /jobs/:jobId/stages/:stageId`

Remove a stage. Fails if any applications are currently in this stage.

**Response** `204`
**Response** `409` — stage has applications

---

## Candidates

### `GET /candidates`

List candidates across all jobs.

| Query Param      | Type   | Description                       |
| ---------------- | ------ | --------------------------------- |
| `search`         | string | Name or email                     |
| `pipelineId`     | string | Filter by pipeline                |
| `stageId`        | string | Filter by current stage           |
| `jobId`          | string | Filter by job                     |
| `status`         | string | `active`, `inactive`              |
| `approvalStatus` | string | `pending`, `approved`, `rejected` |
| `minMatchScore`  | number | Minimum match score (0–100)       |

**Response** `200` — paginated `Candidate[]`

### `GET /candidates/:id`

Get full candidate profile (experience, education, certifications, stage history).

**Response** `200` — `Candidate` with nested relations
**Response** `404`

### `PATCH /candidates/:id`

Update candidate information.

**Body** — partial update of:

| Field    | Type     | Notes                |
| -------- | -------- | -------------------- |
| `tags`   | string[] |                      |
| `notes`  | string   |                      |
| `rating` | number   | 1–5                  |
| `status` | string   | `active`, `inactive` |

**Response** `200`

### `PATCH /candidates/:id/stage`

Move a candidate to a different stage. Records history automatically.

**Body**

| Field         | Type   | Required | Notes                    |
| ------------- | ------ | -------- | ------------------------ |
| `toStageId`   | string | yes      | target stage ID          |
| `performedBy` | string | yes      | user performing the move |
| `notes`       | string | no       |                          |

**Response** `200` — updated candidate
**Response** `409` — stage requires approval (creates approval request)

### `GET /candidates/:id/pipeline-instance`

Get the pipeline instance tracking this candidate's progression.

**Response** `200`

```json
{
  "data": {
    "id": "...",
    "pipelineId": "...",
    "candidateId": "...",
    "jobId": "...",
    "currentStageId": "interview-scheduled",
    "status": "active",
    "stageHistory": [
      {
        "stageId": "pending",
        "stageName": "Pending",
        "enteredAt": "2026-03-10T09:00:00Z",
        "exitedAt": "2026-03-12T14:00:00Z",
        "action": "moved",
        "performedBy": "John HR",
        "notes": ""
      }
    ],
    "startedAt": "2026-03-10T09:00:00Z",
    "completedAt": null
  }
}
```

`status` enum: `active`, `completed`, `rejected`
`action` enum: `moved`, `approved`, `rejected`, `auto-moved`

---

## Pipelines (Templates)

### `GET /pipelines`

List pipeline templates.

| Query Param  | Type    | Description          |
| ------------ | ------- | -------------------- |
| `isActive`   | boolean | Filter by status     |
| `department` | string  | Filter by department |

**Response** `200` — paginated `PipelineTemplate[]`

### `GET /pipelines/:id`

Get pipeline template with all stage configs.

**Response** `200` — `PipelineTemplate`

### `POST /pipelines`

Create a pipeline template.

**Body**

| Field         | Type                  | Required |
| ------------- | --------------------- | -------- |
| `name`        | string                | yes      |
| `description` | string                | no       |
| `department`  | string                | yes      |
| `stages`      | PipelineStageConfig[] | yes      |

**Response** `201` — created `PipelineTemplate`

### `PUT /pipelines/:id`

Update a pipeline template (name, description, stages, department).

**Response** `200` — updated `PipelineTemplate`

### `PATCH /pipelines/:id/status`

Activate or deactivate a pipeline.

**Body**

| Field      | Type    | Required |
| ---------- | ------- | -------- |
| `isActive` | boolean | yes      |

**Response** `200`

### `DELETE /pipelines/:id`

Delete a pipeline template. Fails if any active candidates are using it.

**Response** `204`
**Response** `409` — in use

---

## Approvals

### `GET /approvals`

List approval requests.

| Query Param  | Type   | Description                       |
| ------------ | ------ | --------------------------------- |
| `status`     | string | `pending`, `approved`, `rejected` |
| `jobId`      | string | Filter by job                     |
| `pipelineId` | string | Filter by pipeline                |

**Response** `200` — paginated `ApprovalRequest[]`

### `GET /approvals/:id`

Get approval request with comments.

**Response** `200` — `ApprovalRequest`

### `POST /approvals`

Create an approval request (typically triggered automatically on stage move).

**Body**

| Field           | Type     | Required |
| --------------- | -------- | -------- |
| `candidateId`   | string   | yes      |
| `applicationId` | string   | yes      |
| `jobId`         | string   | yes      |
| `pipelineId`    | string   | yes      |
| `stageId`       | string   | yes      |
| `fromStageId`   | string   | yes      |
| `requestedBy`   | string   | yes      |
| `assignedTo`    | string[] | yes      |

**Response** `201`

### `POST /approvals/:id/approve`

Approve a request.

**Body**

| Field        | Type   | Required |
| ------------ | ------ | -------- |
| `resolvedBy` | string | no       |
| `comment`    | string | no       |

**Response** `200` — candidate is moved to the target stage

### `POST /approvals/:id/reject`

Reject a request.

**Body**

| Field        | Type   | Required |
| ------------ | ------ | -------- |
| `resolvedBy` | string | no       |
| `comment`    | string | no       |

**Response** `200` — candidate stays in current stage

### `POST /approvals/:id/comments`

Add a comment to an approval request.

**Body**

| Field        | Type   | Required |
| ------------ | ------ | -------- |
| `authorName` | string | yes      |
| `text`       | string | yes      |

**Response** `201`

---

## Notifications

### `GET /notifications`

List notifications for the current user.

| Query Param | Type    | Description        |
| ----------- | ------- | ------------------ |
| `isRead`    | boolean | Filter read/unread |

**Response** `200` — paginated `Notification[]`

### `PATCH /notifications/:id/read`

Mark a notification as read.

**Response** `200`

### `PATCH /notifications/read-all`

Mark all notifications as read.

**Response** `200`

---

## Dashboard

### `GET /dashboard/stats`

Aggregate dashboard metrics.

**Response** `200`

```json
{
  "data": {
    "activeJobs": 12,
    "totalCandidates": 248,
    "inPipeline": 180,
    "hired": 24,
    "pipelineDistribution": [
      { "stage": "Pending", "count": 40 },
      { "stage": "Interview Scheduled", "count": 22 }
    ],
    "candidatesBySource": [
      { "source": "LinkedIn", "count": 80 },
      { "source": "Referral", "count": 45 }
    ],
    "recentJobs": [Job]
  }
}
```

---

## Reports

All report endpoints accept optional date range filters:

| Query Param | Type | Description           |
| ----------- | ---- | --------------------- |
| `from`      | date | Start date (ISO 8601) |
| `to`        | date | End date (ISO 8601)   |

### `GET /reports/summary`

KPI summary stats.

**Response** `200`

```json
{
  "data": {
    "totalCandidates": 248,
    "activeInPipeline": 180,
    "hired": 24,
    "totalJobs": 45
  }
}
```

### `GET /reports/applications-over-time`

Weekly aggregated application counts for the area chart.

**Response** `200`

```json
{
  "data": [
    { "week": "Mar 3", "applications": 12 },
    { "week": "Mar 10", "applications": 18 }
  ]
}
```

### `GET /reports/pipeline-distribution`

Candidate counts per pipeline stage bucket.

**Response** `200`

```json
{
  "data": [
    { "stage": "Applied", "count": 120 },
    { "stage": "Interview", "count": 45 }
  ]
}
```

### `GET /reports/conversion-rates`

Stage-to-stage conversion percentages.

**Response** `200`

```json
{
  "data": [
    { "from": "Applied", "to": "Phone Screen", "rate": 62.5, "fromCount": 120, "toCount": 75 },
    { "from": "Phone Screen", "to": "Interview", "rate": 60.0, "fromCount": 75, "toCount": 45 }
  ]
}
```

### `GET /reports/candidate-sources`

Source breakdown for the pie chart.

**Response** `200`

```json
{
  "data": [
    { "source": "LinkedIn", "count": 80 },
    { "source": "Referral", "count": 45 },
    { "source": "Job Board", "count": 30 }
  ]
}
```

### `GET /reports/hiring-by-department`

Department hiring counts.

**Response** `200`

```json
{
  "data": [
    { "department": "Engineering", "hired": 12 },
    { "department": "Marketing", "hired": 5 }
  ]
}
```

---

## Reference Data

### `GET /departments`

**Response** `200` — `{ id, name }[]`

### `GET /roles`

List job roles (Software Engineer, Product Manager, etc.).

**Response** `200` — `{ id, name }[]`
