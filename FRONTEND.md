# GymFlow Admin — Frontend Reference

This document is the definitive UI/UX reference for building features in GymFlow. Follow these patterns for consistency.

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `indigo-600` | #4f46e5 | Primary brand, buttons, links, active states |
| `indigo-700` | #4338ca | Button hover |
| `indigo-50` | #eef2ff | Active nav background, light accents |
| `indigo-100` | #e0e7ff | Badges, avatar backgrounds |
| `gray-50` | #f9fafb | Page backgrounds |
| `gray-100` | #f3f4f6 | Card/skeleton backgrounds |
| `gray-200` | #e5e7eb | Borders, skeleton placeholders |
| `gray-300` | #d1d5db | Input borders |
| `gray-400` | #9ca3af | Icons, placeholder text |
| `gray-500` | #6b7280 | Secondary text, descriptions |
| `gray-600` | #4b5563 | Nav text, labels |
| `gray-700` | #374151 | Input text |
| `gray-900` | #111827 | Headings, primary text |
| `green-100` / `green-800` | | Success badges |
| `red-100` / `red-800` | | Danger badges |
| `yellow-100` / `yellow-800` | | Warning badges |
| `blue-100` / `blue-800` | | Info badges |

## Typography

| Element | Classes |
|---------|---------|
| Page title | `text-2xl font-bold text-gray-900` |
| Page subtitle | `text-gray-500` |
| Card title | `text-lg font-semibold text-gray-900` |
| Card subtitle | `text-sm text-gray-500 mt-1` |
| Stat value | `text-2xl font-bold text-gray-900` |
| Stat label | `text-sm font-medium text-gray-500 uppercase tracking-wider` |
| Body text | `text-sm text-gray-900` |
| Secondary text | `text-sm text-gray-500` |
| Small text | `text-xs text-gray-500` |
| Form label | `text-sm font-medium text-gray-700` |
| Table header | `text-xs font-medium text-gray-500 uppercase tracking-wider` |

**Font:** Inter (sans-serif)

## Icons

**Library:** Lucide React

| Size | Usage |
|------|-------|
| `h-4 w-4` | Buttons, inline icons, action buttons |
| `h-5 w-5` | Sidebar nav, back buttons |
| `h-6 w-6` | Stat cards, modal icons |
| `h-8 w-8` | Auth page branding |

## Components

### Button (`src/components/ui/button.jsx`)

```jsx
import { Button } from "@/components/ui/button";

<Button variant="primary" size="md">Save</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="danger">Delete</Button>
<Button variant="ghost" size="sm" className="p-1"><Eye className="h-4 w-4" /></Button>
```

| Variant | Background | Text | Hover |
|---------|-----------|------|-------|
| `primary` | `bg-indigo-600` | `text-white` | `hover:bg-indigo-700` |
| `secondary` | `bg-white border border-gray-300` | `text-gray-700` | `hover:bg-gray-50` |
| `danger` | `bg-red-600` | `text-white` | `hover:bg-red-700` |
| `ghost` | `bg-transparent` | `text-gray-600` | `hover:bg-gray-100` |

| Size | Classes |
|------|---------|
| `sm` | `px-3 py-1.5 text-xs` |
| `md` | `px-4 py-2 text-sm` |
| `lg` | `px-6 py-3 text-base` |

**States:** `disabled:opacity-50 disabled:cursor-not-allowed`, loading shows `animate-spin` spinner.

### Badge (`src/components/ui/badge.jsx`)

```jsx
<Badge variant="success">ACTIVE</Badge>
<Badge variant="warning">PENDING</Badge>
<Badge variant="danger">REJECTED</Badge>
```

Base: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`

| Variant | Classes |
|---------|---------|
| `default` | `bg-gray-100 text-gray-800` |
| `success` | `bg-green-100 text-green-800` |
| `warning` | `bg-yellow-100 text-yellow-800` |
| `danger` | `bg-red-100 text-red-800` |
| `info` | `bg-blue-100 text-blue-800` |
| `indigo` | `bg-indigo-100 text-indigo-800` |

### Card (`src/components/ui/card.jsx`)

```jsx
<Card>
  <CardHeader title="Members" subtitle="Manage gym members" />
  <CardContent>...</CardContent>
</Card>
```

- **Card:** `bg-white border rounded-lg shadow-sm overflow-hidden`
- **CardHeader:** `px-6 py-4 border-b flex justify-between items-center`
- **CardContent:** `px-6 py-4`
- **StatCard:** `flex items-center p-6` with icon in `p-3 bg-indigo-50 rounded-full`

### Confirmation Modal (`src/components/confirmation-modal.jsx`)

```jsx
<ConfirmationModal
  isOpen={open}
  onClose={() => setOpen(false)}
  onConfirm={handleDelete}
  title="Delete Member"
  message="Are you sure? This cannot be undone."
  confirmText="Delete"
  isLoading={deleting}
/>
```

- Overlay: `fixed inset-0 bg-black bg-opacity-50 z-50`
- Modal: `bg-white rounded-lg shadow-xl max-w-md w-full p-6`
- Icon: `p-3 bg-yellow-100 rounded-full` with `h-6 w-6 text-yellow-600` AlertTriangle
- Actions: `flex gap-3 justify-end mt-6`

### Data Table (`src/components/data-table.jsx`)

Props: `columns`, `data`, `totalCount`, `pageIndex`, `pageSize`, `setPageIndex`, `setPageSize`, `isLoading`, `searchQuery`, `setSearchQuery`, `filters`, `setFilters`, `availableFilters`

- Search: `pl-10 pr-3 py-2 border border-gray-300 rounded-md` with Search icon
- Table: `bg-white shadow sm:rounded-lg border` wrapping `min-w-full divide-y divide-gray-200`
- Header cells: `bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider`
- Body cells: `px-6 py-4 whitespace-nowrap text-sm text-gray-900`
- Row hover: `hover:bg-gray-50 transition-colors`
- Loading: `animate-spin h-5 w-5 border-b-2 border-indigo-600`
- Pagination: `bg-white px-4 py-3 border-t border-gray-200`

## Form Inputs

Standard input styling used across all form pages:

```
block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm
```

Auth page inputs (slightly different):
```
w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white
focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-sm
```

Select dropdowns use the same styling as text inputs.

## Page Patterns

### List Page

```
┌─────────────────────────────────────────────┐
│  Title              Description    [+ Add]  │
├─────────────────────────────────────────────┤
│  🔍 Search...              [Filters ▼]      │
├─────────────────────────────────────────────┤
│  ID │ Name │ Contact │ Status │ Actions     │
│  1  │ ...  │ ...     │ ACTIVE │ 👁 ✏ 🗑    │
│  2  │ ...  │ ...     │ INACTIVE│ 👁 ✏ 🗑   │
├─────────────────────────────────────────────┤
│  Showing 1-10 of 20        [< 1 >]         │
└─────────────────────────────────────────────┘
```

**Structure:**
```jsx
<div className="space-y-6">
  <div className="flex justify-between items-center">
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Members</h2>
      <p className="text-gray-500">Manage your gym members</p>
    </div>
    <Button onClick={() => navigate("/dashboard/members/new")}>
      <Plus className="h-4 w-4" /> Add Member
    </Button>
  </div>
  <DataTable columns={columns} data={data?.data || []} ... />
  <ConfirmationModal ... />
</div>
```

**Data fetching:** `useQuery` with queryKey `["resource", pageIndex, pageSize, searchQuery, filters]`
**Delete:** `useMutation` → `queryClient.invalidateQueries(["resource"])`
**Navigation:** `navigate("/dashboard/resource/${id}")` for View/Edit

### Detail Page

```
┌─────────────────────────────────────────────┐
│  ← Back    Member Name #123        [Edit]   │
├─────────────────────────────────────────────┤
│  Overview │ Attendance │ Payments │ Plans    │
├─────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐          │
│  │ Personal     │  │ Membership  │          │
│  │ Name: ...    │  │ Status: ... │          │
│  │ Phone: ...   │  │ Plan: ...   │          │
│  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────┘
```

**Structure:**
```jsx
<div className="space-y-6 max-w-6xl mx-auto">
  {/* Header with back button */}
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-4">
      <button onClick={() => navigate("/dashboard/members")} className="p-2 hover:bg-gray-100 rounded-full">
        <ChevronLeft className="h-5 w-5 text-gray-600" />
      </button>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{name}</h2>
        <p className="text-sm text-gray-600">Member #{id}</p>
      </div>
    </div>
    <Button onClick={() => navigate(`/dashboard/members/${id}/edit`)}>Edit</Button>
  </div>
  {/* Tab navigation */}
  {/* Info cards in grid: grid gap-6 md:grid-cols-2 */}
</div>
```

**Tabs:** `border-b-2` active indicator, `border-indigo-500 text-indigo-600` active, `text-gray-500` inactive
**Tab data:** `useQuery` with `enabled: activeTab === "tabName"` (lazy loading)

### Form Page (New / Edit)

```
┌─────────────────────────────────────────────┐
│  ← Back    Add New Member                   │
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐    │
│  │ Member Information                  │    │
│  │ ┌──────────┐ ┌──────────┐          │    │
│  │ │First Name│ │Last Name │          │    │
│  │ └──────────┘ └──────────┘          │    │
│  │ ┌──────────────────────┐           │    │
│  │ │Phone                 │           │    │
│  │ └──────────────────────┘           │    │
│  │              [Cancel] [Create]     │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

**Structure:**
```jsx
<div className="space-y-6 max-w-2xl mx-auto">
  {/* Back button + title */}
  <Card>
    <CardHeader title="Member Information" subtitle="Basic details" />
    <CardContent>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Input fields with react-hook-form register */}
        </div>
        <div className="pt-4 flex justify-end gap-3 border-t">
          <Button variant="secondary" onClick={() => navigate("/dashboard/members")}>Cancel</Button>
          <Button type="submit" loading={isSubmitting}>Create Member</Button>
        </div>
      </form>
    </CardContent>
  </Card>
</div>
```

**Forms:** `react-hook-form` with `register`, `handleSubmit`, `formState: { errors, isSubmitting }`
**Mutations:** `useMutation` → `toast.success("Created")` → `navigate("/dashboard/resource")`
**Validation errors:** `<p className="text-xs text-red-600">{errors.field.message}</p>`

### Dashboard Home

```
┌───────┬───────┬───────┬───────┐
│Members│Plans  │Revenue│Checked│
│  17   │  17   │ 0 PKR │  0   │
└───────┴───────┴───────┴───────┘
┌─────────────────┬─────────────────┐
│ Recent Members  │ Recent Payments │
│ Name - Status   │ Name - Amount   │
│ Name - Status   │ Name - Amount   │
└─────────────────┴─────────────────┘
```

**Stats:** `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6` using `StatCard`
**Lists:** `grid grid-cols-1 lg:grid-cols-2 gap-8` with Card containers

## Layout

- **Sidebar:** `w-64` fixed left, `bg-white border-r h-screen sticky top-0`
- **Header:** `h-16 bg-white border-b sticky top-0 z-10 px-8`
- **Content:** `flex-1 p-8 bg-gray-50`
- **Max widths:** `max-w-2xl` for forms, `max-w-6xl` for detail pages, none for list pages

## Navigation

Always use React Router — never `window.location.href`:

```jsx
import { useNavigate } from "react-router";
import { Link } from "react-router";

const navigate = useNavigate();
navigate("/dashboard/members/new");    // programmatic
<Link to="/account/signin">Sign in</Link>  // declarative
```

## Data Fetching

```jsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Fetch
const { data, isLoading } = useQuery({
  queryKey: ["members", pageIndex, pageSize, searchQuery, filters],
  queryFn: async () => { /* fetch */ },
});

// Mutate
const mutation = useMutation({
  mutationFn: async (data) => { /* fetch POST/PUT/DELETE */ },
  onSuccess: () => {
    toast.success("Success message");
    queryClient.invalidateQueries(["members"]);
    navigate("/dashboard/members");
  },
  onError: (error) => toast.error(error.message),
});
```

## Toast Notifications

```jsx
import { toast } from "sonner";

toast.success("Member created successfully");
toast.error("Failed to create member");
```

Position: `top-right` (configured in dashboard layout via `<Toaster>`)

## Responsive Breakpoints

| Breakpoint | Width | Common usage |
|-----------|-------|-------------|
| `md` | 768px | 2-col grids, filter layout, search width |
| `lg` | 1024px | 4-col stat grid, 2-col detail grid, sidebar visibility |

## Spacing Reference

| Pattern | Usage |
|---------|-------|
| `space-y-6` | Page-level vertical spacing |
| `space-y-4` | Form field spacing |
| `gap-2` | Action button groups |
| `gap-3` | Modal button groups |
| `gap-4` | Grid items, form grid |
| `gap-6` | Stat card grid |
| `gap-8` | Section spacing |
| `p-6` | Card content padding |
| `p-8` | Main content area padding |
| `px-6 py-4` | Card header/content padding |
| `px-6 py-3` | Table cell padding |

## Shadows & Borders

| Element | Shadow | Border | Radius |
|---------|--------|--------|--------|
| Card | `shadow-sm` | `border` | `rounded-lg` |
| Button | `shadow-sm` | — | `rounded-md` |
| Input | `shadow-sm` | `border border-gray-300` | `rounded-md` |
| Modal | `shadow-xl` | — | `rounded-lg` |
| Auth card | `shadow-lg` | `border border-gray-100` | `rounded-2xl` |
| Badge | — | — | `rounded-full` |
| Table | `shadow` | `border` | `sm:rounded-lg` |

## Utility: `cn()`

```jsx
import { cn } from "@/utils/cn";

// Merges Tailwind classes safely (resolves conflicts)
className={cn("base-classes", isActive && "active-classes", className)}
```

Uses `clsx` + `tailwind-merge` under the hood.

## Loading States

- **Spinner:** `animate-spin h-5 w-5 border-b-2 border-indigo-600 rounded-full`
- **Skeleton:** `animate-pulse` with `bg-gray-200 rounded` placeholders
- **Button loading:** Built-in `loading` prop shows spinner + disabled state
- **Page loading:** `PageSkeleton` component with stat cards + table skeleton
