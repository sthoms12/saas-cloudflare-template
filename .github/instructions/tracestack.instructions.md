## Big Picture & Architecture

tracestack is a **solo developer troubleshooting session management application** that helps developers and IT Professionals systematically track, organize, and resolve technical issues through structured workflows with advanced analytics and hypothesis-driven debugging.

**Core Value**: Transform chaotic debugging sessions into organized, searchable knowledge with multiple workflow views (Timeline, Kanban, Raw Notes, Brainstorm, Hypothesis Tracker, Unified View) that adapt to different troubleshooting styles. Features intelligent pattern recognition and actionable insights.

## Pages & Features
1. **Landing Page**: Feature overview, login CTA, tracestack brand in lowercase with gradient text.
2. **Dashboard**: Session counts by status (active, resolved, blocked, archived), recent sessions list, quick stats.
3. **Sessions List**: Table/list with search, filter (status/priority/tags), duplicate sessions, export functionality.
4. **Create Session**: Form for title, description, environment, priority, tags, project name.
5. **Session View**: Multiple views (Timeline, Kanban, Raw Notes, Brainstorm, Hypothesis Tracker, Unified View), add/edit/delete entries, RCA report generation.
6. **Analytics**: Advanced pattern recognition, resolution time analysis, efficiency metrics, smart recommendations.
7. **Search**: Global full-text search across sessions, entries, hypotheses with highlighting and filters.
8. **Account/Privacy/Terms**: User management and legal pages.

## Data Models

### User
```javascript
{
  id,                 // Clerk user ID (TEXT PRIMARY KEY)
  email,              // Primary email from Clerk (UNIQUE NOT NULL)
  name,               // Display name from Clerk
  created_date,       // ISO timestamp
  updated_date        // ISO timestamp
}
```

### Session
```javascript
{
  id,                 // UUID (TEXT PRIMARY KEY)
  title,              // Session title (TEXT NOT NULL)
  description,        // Detailed problem context (TEXT)
  status,             // "active" | "blocked" | "resolved" | "archived" (TEXT)
  priority,           // "low" | "medium" | "high" (TEXT)
  environment,        // JSON object with system details (TEXT - JSON string)
  tags,               // Array of categorization labels (TEXT - JSON array)
  error_codes,        // Array of relevant error codes (TEXT - JSON array)
  project_name,       // Associated project (TEXT)
  estimated_time,     // Minutes estimated (REAL)
  actual_time,        // Minutes calculated from lifecycle (REAL)
  resolution_summary, // Final outcome description (TEXT)
  rca_report_text,    // Generated RCA report (TEXT)
  is_favorite,        // Prioritization flag (BOOLEAN)
  created_by,         // User email FK (TEXT NOT NULL)
  created_date,       // ISO timestamp (TEXT NOT NULL)
  updated_date        // ISO timestamp (TEXT NOT NULL)
}
```

### SessionEntry
```javascript
{
  id,                 // UUID (TEXT PRIMARY KEY)
  session_id,         // Session FK (TEXT NOT NULL)
  content,            // Entry content (TEXT NOT NULL)
  entry_type,         // "step" | "note" | "command" (TEXT)
  status,             // "to_try" | "in_progress" | "done" | "blocked" (TEXT)
  duration,           // Time spent on this entry in minutes (REAL)
  commands_run,       // Array of executed commands (TEXT - JSON array)
  outcome,            // Result description (TEXT)
  attachments,        // Array of file references (TEXT - JSON array)
  tags,               // Array of entry-specific tags (TEXT - JSON array)
  timestamp,          // Entry timestamp (TEXT NOT NULL)
  aerial_x,           // Layout coordinate X for aerial view (INTEGER)
  aerial_y,           // Layout coordinate Y for aerial view (INTEGER)
  aerial_connections, // Array of linked entry IDs (TEXT - JSON array)
  created_by,         // User email FK (TEXT NOT NULL)
  created_date,       // ISO timestamp (TEXT NOT NULL)
  updated_date        // ISO timestamp (TEXT NOT NULL)
}
```

### BrainstormItem
```javascript
{
  id,                 // UUID (TEXT PRIMARY KEY)
  session_id,         // Session FK (TEXT NOT NULL)
  content,            // Brainstorm content (TEXT NOT NULL)
  category,           // "idea" | "hypothesis" | "approach" (TEXT)
  priority,           // "low" | "medium" | "high" (TEXT)
  status,             // "open" | "converted" | "discarded" (TEXT)
  created_by,         // User email FK (TEXT NOT NULL)
  created_date,       // ISO timestamp (TEXT NOT NULL)
  updated_date        // ISO timestamp (TEXT NOT NULL)
}
```

### Hypothesis
```javascript
{
  id,                 // UUID (TEXT PRIMARY KEY)
  session_id,         // Session FK (TEXT NOT NULL)
  description,        // Hypothesis description (TEXT NOT NULL)
  confidence,         // "low" | "medium" | "high" (TEXT)
  status,             // "untested" | "testing" | "confirmed" | "disproven" (TEXT)
  test_plan,          // How to test this hypothesis (TEXT)
  evidence,           // Supporting/contradicting evidence (TEXT - JSON array)
  tags,               // Categorization tags (TEXT - JSON array)
  created_by,         // User email FK (TEXT NOT NULL)
  created_date,       // ISO timestamp (TEXT NOT NULL)
  updated_date        // ISO timestamp (TEXT NOT NULL)
}
```

### Full-Text Search Tables
The system includes FTS5 virtual tables for fast search across all content:
- `sessions_fts`, `session_entries_fts`, `brainstorm_items_fts`, `hypotheses_fts`
- Automatically synchronized with main tables via triggers
- Enables global search across titles, descriptions, content, tags, etc.


⸻

## Patterns & Conventions
- **Session Views**: isolated components in `src/components/session/` (Timeline, Kanban, RawNotes, Brainstorm, HypothesisTracker, UnifiedView)
- **UI Primitives**: shared components in `src/components/ui/` (Radix UI + Tailwind)
- **Search Components**: specialized search components in `src/components/search/`
- **Hooks**: reusable logic in `src/hooks/` (use-toast, use-mobile, etc.)
- **Styling**: Tailwind utility classes + global styles in App.css / index.css
- **Type Safety**: JavaScript only; optional JSDoc / PropTypes
- **State Management**: React hooks, no external state library
- **Data Fetching**: Direct fetch calls via cloudflareClient, no React Query/SWR

⸻

## Additional Notes
- **Solo workflow**: no team collaboration or roles
- **Smart Analytics**: Rule-based pattern recognition and intelligent insights (no external AI required)
- **Quick Stats**: Live updates for active sessions and sessions created this week
- **RCA generation**: AI-powered report generation for resolved sessions
- **Hypothesis-driven debugging**: Systematic approach to troubleshooting with test plans
- **Full-text search**: Global search across all content with highlighting
- **Aerial view**: Visual layout mode with coordinates and connections (in development)
- **Time tracking**: Automatic and manual time tracking for resolution analysis

## User Journey & Workflows

### Project Structure Overview

```
/src/
├── pages/                    # Main application pages
│   ├── Landing.jsx          # Public landing page with features
│   ├── Dashboard.jsx        # Session overview and quick stats
│   ├── Sessions.jsx         # Session list with filters
│   ├── CreateSession.jsx    # New session creation form
│   ├── SessionView.jsx      # Main session interface with tabs
│   ├── Analytics.jsx        # Smart analytics and insights
│   ├── Search.jsx           # Global search interface
│   ├── Account.jsx          # User account management
│   ├── Privacy.jsx          # Privacy policy page
│   └── Terms.jsx            # Terms of service page
├── components/
│   ├── session/             # Session-specific components
│   │   ├── SessionTimeline.jsx      # Chronological view
│   │   ├── SessionKanban.jsx        # Board view
│   │   ├── SessionRawNotes.jsx      # Quick capture view
│   │   ├── SessionBrainstorm.jsx    # Ideation view
│   │   ├── HypothesisTracker.jsx    # Hypothesis management
│   │   ├── UnifiedSessionView.jsx   # Comprehensive view
│   │   ├── AddEntryDialog.jsx       # Entry creation modal
│   │   ├── EditEntryDialog.jsx      # Entry editing modal
│   │   ├── QuickEntryForm.jsx       # Rapid entry input
│   │   └── RcaReportDialog.jsx      # RCA generation
│   ├── search/              # Search-related components
│   │   ├── GlobalSearch.jsx         # Search input and controls
│   │   └── SearchResults.jsx        # Search results display
│   └── ui/                  # Reusable UI primitives (Radix + Tailwind)
├── api/
│   ├── cloudflareClient.js  # HTTP client for Worker API
│   ├── entities.js          # Data model classes
│   └── integrations.js      # External service stubs
├── hooks/                   # Custom React hooks
├── utils/                   # Utility functions
└── lib/                     # Library configurations
```

### Session Creation Flow
1. **Entry Point**: User clicks "New Session" button from Dashboard or "Create" from Sessions list
2. **Form Completion**: User fills out Create Session form:
   - Title (required) - brief description of the issue
   - Description (optional) - detailed problem context
   - Environment (JSON object) - system details, versions, etc.
   - Priority (low/medium/high) - urgency level
   - Tags (array) - categorization labels
3. **Session Creation**: Form submits → `POST /api/sessions` → redirects to Session View (Timeline mode default)
4. **Initial State**: New session starts with status "active", empty entries list

### Session Management & Entry Workflows

#### Accessing Sessions
- **From Dashboard**: Click on recent session or "View All Sessions"
- **From Sessions List**: Click on any session row → opens Session View
- **Direct Link**: Sessions have shareable URLs for bookmarking

#### Session View Modes & Use Cases

**Timeline View** (Default):
- **Purpose**: Chronological troubleshooting log
- **Entry Addition**: "Add Entry" button → dialog with entry_type selector (step/note/command)
- **Display**: Entries shown in timestamp order with status indicators
- **Interaction**: Click entry to edit, status dropdown to update progress

**Kanban View**:
- **Purpose**: Visual status tracking and workflow management
- **Columns**: "To Try" | "In Progress" | "Done" | "Blocked"
- **Entry Addition**: "+" button in any column creates entry with that status
- **Interaction**: Drag entries between columns to update status
- **Visual Cues**: Color coding by entry_type, priority indicators

**Raw Notes View**:
- **Purpose**: Quick, unstructured capture during active troubleshooting
- **Entry Addition**: Free-form text area, "Add Note" button for rapid entry
- **Bulk Actions**: Convert multiple notes to structured entries
- **Auto-parsing**: Detects commands (lines starting with `$` or `#`) and creates command-type entries

**Brainstorm View**:
- **Purpose**: Ideation and hypothesis generation
- **Entry Addition**: Quick text input, "Add Idea" button
- **Conversion Workflow**: 
  1. User adds brainstorm items (stored as BrainstormItem records)
  2. Clicks "Convert to Entry" on promising ideas
  3. System creates SessionEntry and marks BrainstormItem as converted
- **Organization**: Group related ideas, mark favorites

**Hypothesis Tracker View**:
- **Purpose**: Systematic hypothesis-driven debugging methodology
- **Hypothesis Management**: Create, test, confirm/disprove hypotheses
- **Confidence Levels**: Track confidence (low/medium/high) and status (untested/testing/confirmed/disproven)
- **Test Plans**: Document how to test each hypothesis
- **Evidence Tracking**: Collect supporting or contradicting evidence
- **Smart Insights**: Identify patterns and suggest next steps

**Unified View**:
- **Purpose**: Comprehensive overview combining multiple perspectives
- **Layout**: Integrated display of timeline, hypotheses, and key metrics
- **Quick Actions**: Rapid entry creation and status updates
- **Context Switching**: Seamless transition between different view modes
- **Progress Tracking**: Visual indicators of session progress and completion

#### Entry Management Patterns

**Adding Entries**:
- **Timeline/Kanban**: Structured dialog with fields for content, entry_type, tags
- **Raw Notes**: Direct text input with auto-parsing
- **Brainstorm**: Minimal quick-capture input

**Entry Types & Usage**:
- **Step**: Specific action taken ("Checked database connection")
- **Note**: Observation or finding ("Error occurs only in production")
- **Command**: Executable instruction ("curl -X GET /api/health")

**Status Progression**:
- **to_try** → **in_progress** → **done** (successful completion)
- **to_try** → **in_progress** → **blocked** (stuck, needs different approach)
- Direct status updates via dropdown or Kanban drag-and-drop

#### Session Lifecycle Management

**Active Session Work**:
1. User adds entries as they troubleshoot
2. Updates entry statuses as work progresses
3. Switches between views based on current need:
   - Timeline for detailed logging
   - Kanban for status overview
   - Raw Notes for rapid capture
   - Brainstorm for exploring new approaches

**Session Resolution**:
1. User marks final entries as "done"
2. Updates session status to "resolved"
3. Fills `resolution_summary` field
4. Optional: Generates RCA report (when feature available)

**Session States & Transitions**:
- **active** → **resolved**: Problem solved, solution documented
- **active** → **blocked**: Stuck, waiting for external input
- **blocked** → **active**: Unblocked, resuming work
- **resolved** → **archived**: Long-term storage, removes from active views
- **active** → **archived**: Abandoned/deprioritized issues

#### Navigation & Context Switching

**Between Sessions**:
- Breadcrumb navigation: Dashboard > Sessions > [Session Title]
- "Back to Sessions" link in Session View header
- Recent sessions dropdown in global header

**Within Session**:
- Tab-based view switching (Timeline | Kanban | Raw Notes | Brainstorm | Hypothesis | Unified)
- View state preserved per session (user's last-used view remembered)
- Entry count indicators on each tab
- Quick action toolbar for common operations (add entry, change status, etc.)

#### Time Tracking Integration

**Automatic Tracking**:
- Session `created_at` → first entry timestamp = time to start
- Entry timestamps track troubleshooting pace
- Session resolution time = `updated_at` when status changes to "resolved"

**Manual Estimates**:
- `estimated_time` set during session creation
- `actual_time` calculated from session lifecycle
- Analytics compare estimated vs actual across sessions

### Common User Workflows

**Hypothesis-Driven Debugging** (Hypothesis Tracker → Timeline):
1. User creates session with systematic approach in mind
2. Uses Hypothesis Tracker to formulate and test theories
3. Documents test plans and evidence for each hypothesis
4. Converts confirmed hypotheses to actionable Timeline entries
5. Tracks resolution through evidence-based decision making

**Rapid Troubleshooting** (Raw Notes → Timeline):
1. User encounters issue → creates session with minimal details
2. Switches to Raw Notes for quick capture while actively debugging
3. Later reviews and converts notes to structured Timeline entries
4. Marks session resolved with summary

**Systematic Debugging** (Timeline → Kanban):
1. User creates session with detailed description
2. Adds methodical troubleshooting steps in Timeline
3. Switches to Kanban to track progress across multiple approaches
4. Updates status as each approach succeeds/fails

**Comprehensive Analysis** (Unified View):
1. User opens Unified View for complex, multi-faceted issues
2. Simultaneously tracks timeline progress, hypothesis testing, and metrics
3. Uses integrated perspective to identify patterns and next steps
4. Leverages smart analytics for resolution insights

**Collaborative Handoff** (Future):
1. User documents current state in Timeline
2. Adds blocked entries with clear next steps
3. Changes session status to "blocked" 
4. Shares session link for colleague review

This user journey clarifies the practical flow from session creation through resolution while highlighting how different views serve different troubleshooting styles and phases.

## Implementation details and runbook (grounded in this repo)

### Smart Analytics Implementation

The Analytics page features sophisticated rule-based algorithms for intelligent insights:

**Pattern Recognition**:
- **Recurring Issue Detection**: Intelligent signature matching to identify similar problems across sessions
- **Resolution Time Analysis**: Trend analysis with 7-day rolling averages and performance indicators
- **Issue Complexity Scoring**: Based on resolution time, entry count, and success rates
- **Knowledge Gap Identification**: Detects stalled investigations and suggests next steps
- **Error Pattern Extraction**: Automated grouping and tracking of error codes and patterns

**Recommendation Engine**:
- **Runbook Suggestions**: Recommends documentation for frequently occurring issues (5+ occurrences)
- **Efficiency Alerts**: Flags when resolution times increase by 20%+ compared to historical average
- **Success Rate Monitoring**: Alerts when resolution rates drop below 70%
- **Error Documentation**: Suggests creating guides for error codes appearing 3+ times
- **Best Practice Sharing**: Identifies high-success patterns (90%+ resolution rate) for replication

**Visualizations**:
- **Area Charts**: Resolution time trends over 7-day periods with trend lines
- **Bar Charts**: Issue complexity rankings and entry type distributions
- **Pie Charts**: Status and priority distributions with interactive filtering
- **Interactive Cards**: Detailed breakdowns with trend indicators and actionable recommendations
