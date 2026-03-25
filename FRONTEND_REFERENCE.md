# Frontend Reference

> Comprehensive frontend implementation guide for GymFlow Admin. Based on actual codebase audit — not generic advice. Optimized for AI and developer consumption when building new features.

---

## 1. Overview

GymFlow Admin is a gym management dashboard. Single-page application with file-based routing, server-side Hono API, and PostgreSQL. All UI is Tailwind CSS with a handful of shared components. No formal design system — this document reverse-engineers one from the implementation.

**Key principle:** The app uses a small set of reusable components (`Button`, `Badge`, `Card`, `DataTable`, `ConfirmationModal`) combined with raw Tailwind classes. There is no component library like shadcn or Chakra in active use — despite both being installed.

---

## 2. Frontend Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | React 18 + React Router v7 | File-based routing via `src/app/routes.ts` |
| Server | Hono (Node.js) | API routes at `src/app/api/**/route.js` |
| Styling | Tailwind CSS 3 | PostCSS-based, no CSS modules |
| State (server) | React Query v5 (`@tanstack/react-query`) | All API data |
| State (client) | `useState` | Pagination, filters, modals |
| Forms | react-hook-form | All form pages |
| Icons | Lucide React | Consistent across app |
| Toasts | Sonner | `toast.success()` / `toast.error()` |
| Charts | Recharts | Reports page only |
| Class merge | `cn()` from `tailwind-merge` + `clsx` | At `src/utils/cn.js` |

**Not in active use** (installed but unused in pages):
- Chakra UI (`src/client-integrations/chakra-ui.jsx` — dead code)
- shadcn/ui wrappers (`src/client-integrations/shadcn-ui.jsx` — 1,260 lines, 0 imports)
- Zustand (imported but no stores found)

---

## 3. App Structure

```
src/
├── app/
│   ├── root.tsx              # HTML shell, SessionProvider, Toaster, ErrorBoundary
│   ├── layout.jsx            # QueryClientProvider wrapper
│   ├── routes.ts             # File-based route generator
│   ├── global.css            # Tailwind directives + base input resets
│   ├── page.jsx              # Root page (redirects)
│   ├── account/              # Auth pages (signin, signup, logout)
│   ├── dashboard/
│   │   ├── layout.jsx        # Sidebar + header + content area
│   │   ├── page.jsx          # Dashboard home (stats + recent lists)
│   │   ├── members/          # CRUD: page, new, [id], [id]/edit
│   │   ├── attendance/       # CRUD: page, new, [id], [id]/edit
│   │   ├── payments/         # CRUD: page, new, [id], [id]/edit
│   │   ├── trainers/         # page, new, [id]
│   │   ├── staff/            # CRUD: page, new, [id], [id]/edit
│   │   ├── inventory/        # Tabbed: items + categories (each has CRUD)
│   │   ├── memberships/      # Tabbed: plans + subscriptions (each has CRUD)
│   │   └── reports/          # Charts page
│   └── api/                  # Hono API routes
├── components/
│   ├── ui/                   # Button, Badge, Card (shared primitives)
│   ├── sidebar.jsx           # Navigation sidebar
│   ├── data-table.jsx        # Table with search/filter/pagination
│   ├── confirmation-modal.jsx
│   ├── empty-state.jsx       # Exists but rarely used
│   ├── loading-skeleton.jsx  # Exists but never imported
│   ├── image-upload-with-webcam.jsx
│   └── signature-pad.jsx
├── utils/
│   ├── cn.js                 # tailwind-merge + clsx
│   ├── useAuth.js            # Auth hook
│   ├── useUser.js            # User session hook
│   └── useUpload.js          # File upload hook
└── client-integrations/      # Re-exports of external libs (mostly unused)
```

---

## 4. Layout Patterns

### Dashboard Layout (`src/app/dashboard/layout.jsx`)

```
┌──────────┬─────────────────────────────────────┐
│          │  Header (h-16, sticky, bg-white)     │
│ Sidebar  ├─────────────────────────────────────┤
│ (w-64)   │                                     │
│ sticky   │  Main Content (p-8, bg-gray-50)     │
│ bg-white │                                     │
│ border-r │                                     │
└──────────┴─────────────────────────────────────┘
```

- Outer: `flex min-h-screen bg-gray-50`
- Sidebar: `w-64 border-r bg-white h-screen sticky top-0`
- Header: `h-16 bg-white border-b sticky top-0 z-10 px-8`
- Content: `flex-1 p-8`

### Auth Pages Layout

Split-screen on desktop, stacked on mobile:
- Left: `hidden lg:flex lg:w-1/2` indigo gradient brand panel
- Right: `flex-1 bg-gray-50` centered form
- Mobile: logo + form only

### Page Content Widths

| Page type | Max width | Class |
|-----------|-----------|-------|
| List pages | Full width | (none) |
| Detail pages | 6xl | `max-w-6xl mx-auto` |
| Form pages | 2xl | `max-w-2xl mx-auto` |
| Auth pages | md / sm | `max-w-md` or `max-w-sm` |

---

## 5. Navigation Patterns

### Sidebar (`src/components/sidebar.jsx`)

- Uses React Router `<Link to>` and `useLocation()` for active state
- Active: `bg-indigo-50 text-indigo-600`
- Inactive: `text-gray-600 hover:bg-gray-50 hover:text-gray-900`
- Logout: `hover:bg-red-50 hover:text-red-600`

### In-Page Navigation

**Always use React Router** — enforced by tests:
```jsx
import { useNavigate } from "react-router";
const navigate = useNavigate();
navigate("/dashboard/members/new");
```

**Never use:**
- `window.location.href` (causes full page reload)
- `<a href>` for internal links

> **Known inconsistency:** Some detail pages still use `<a href>` for back buttons. These should be `navigate()` or `<Link>`.

### Breadcrumb / Back Pattern

Back button at top of detail/form pages:
```jsx
<button onClick={() => navigate("/dashboard/members")} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
  <ChevronLeft className="h-5 w-5 text-gray-600" />
</button>
```

### Tab Navigation (Detail/Complex Pages)

Inline implementation (no shared component):
```jsx
<button className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
  activeTab === key
    ? "border-indigo-500 text-indigo-600"
    : "border-transparent text-gray-500 hover:text-gray-700"
}`}>
```

> **Inconsistency:** Tabs are implemented inline in each page. No shared `<Tabs>` component exists despite `CustomTabs` being defined in unused shadcn wrapper.

---

## 6. Theme and Visual Design

### Design Philosophy

Clean, professional, indigo-branded. Gray neutrals. Minimal decoration. Card-based content sections. Status indicated by colored badges.

### No Dark Mode

Zero `dark:` classes anywhere. No theme context. No color mode toggle.

### Color Palette

**Primary:**
| Token | Usage |
|-------|-------|
| `indigo-600` | Buttons, links, active states, brand |
| `indigo-700` | Button hover |
| `indigo-50` | Active nav bg, light accents |
| `indigo-100` | Badges, avatar bg |

**Neutrals:**
| Token | Usage |
|-------|-------|
| `gray-50` | Page bg |
| `gray-100` | Skeleton bg, secondary bg |
| `gray-200` | Skeleton placeholders, borders |
| `gray-300` | Input borders |
| `gray-400` | Icons, placeholders |
| `gray-500` | Secondary text |
| `gray-600` | Nav text, form labels |
| `gray-700` | Input text |
| `gray-900` | Headings, primary text |

**Status:**
| Status | Background | Text |
|--------|-----------|------|
| Success | `green-100` | `green-800` |
| Warning | `yellow-100` | `yellow-800` |
| Danger | `red-100` | `red-800` |
| Info | `blue-100` | `blue-800` |

**Status-to-value mapping** (inferred, not centralized):
| Value | Badge variant |
|-------|--------------|
| ACTIVE | `success` |
| INACTIVE | `warning` |
| CONFIRMED | `success` |
| PENDING | `warning` |
| REJECTED / VOIDED | `danger` |
| EXPIRED | `danger` |
| FROZEN | `info` |

> **Inconsistency:** `image-upload-with-webcam.jsx` uses `blue-600` and `purple-600` for buttons. `signature-pad.jsx` uses `green-600`. These break the indigo primary convention. Use `Button` component instead.

---

## 7. Typography

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Page title | `text-2xl` | `font-bold` | `text-gray-900` |
| Page subtitle | `text-sm` or default | normal | `text-gray-500` |
| Card title | `text-lg` | `font-semibold` | `text-gray-900` |
| Card subtitle | `text-sm` | normal | `text-gray-500` |
| Stat value | `text-2xl` | `font-bold` | `text-gray-900` |
| Stat label | `text-sm` | `font-medium` | `text-gray-500 uppercase tracking-wider` |
| Form label | `text-sm` | `font-medium` | `text-gray-700` |
| Form error | `text-xs` | normal | `text-red-600` |
| Form helper | `text-xs` | normal | `text-gray-500` |
| Table header | `text-xs` | `font-medium` | `text-gray-500 uppercase tracking-wider` |
| Table cell | `text-sm` | normal | `text-gray-900` |
| Detail label | `text-sm` | normal | `text-gray-600` |
| Detail value | default | `font-semibold` | `text-gray-900` |

**Font:** Inter (sans-serif), configured in `tailwind.config.js`

---

## 8. Spacing and Sizing

### Standard Spacing

| Pattern | Value | Usage |
|---------|-------|-------|
| `space-y-6` | 24px | Page-level section spacing |
| `space-y-4` | 16px | Form field spacing |
| `space-y-1` / `space-y-1.5` | 4-6px | Label-to-input spacing |
| `gap-2` | 8px | Button icon groups |
| `gap-3` | 12px | Modal button groups |
| `gap-4` | 16px | Grid items, form grids |
| `gap-6` | 24px | Stat card grid |
| `gap-8` | 32px | Section grid |
| `p-6` | 24px | Card content |
| `p-8` | 32px | Main content area |
| `px-6 py-4` | | Card header/content |
| `px-6 py-3` | | Table header/cell |

### Border Radius

| Element | Class |
|---------|-------|
| Buttons | `rounded-md` |
| Inputs | `rounded-md` |
| Cards | `rounded-lg` |
| Table container | `sm:rounded-lg` |
| Badges | `rounded-full` |
| Auth cards | `rounded-2xl` |
| Avatars | `rounded-full` |

### Shadows

| Element | Class |
|---------|-------|
| Buttons | `shadow-sm` |
| Cards | `shadow-sm` |
| Tables | `shadow` |
| Auth cards | `shadow-lg` or `shadow-2xl` |
| Modals | `shadow-xl` |

---

## 9. Buttons

### Component: `src/components/ui/button.jsx`

```jsx
<Button variant="primary" size="md" loading={saving}>Save</Button>
<Button variant="secondary" onClick={cancel}>Cancel</Button>
<Button variant="danger" onClick={remove}>Delete</Button>
<Button variant="ghost" size="sm" className="p-1"><Eye className="h-4 w-4" /></Button>
```

| Variant | Background | Text | Hover | Focus ring |
|---------|-----------|------|-------|-----------|
| `primary` | `bg-indigo-600` | `text-white` | `hover:bg-indigo-700` | `ring-indigo-500` |
| `secondary` | `bg-white border border-gray-300` | `text-gray-700` | `hover:bg-gray-50` | `ring-indigo-500` |
| `danger` | `bg-red-600` | `text-white` | `hover:bg-red-700` | `ring-red-500` |
| `ghost` | `bg-transparent` | `text-gray-600` | `hover:bg-gray-100` | `ring-gray-500` |

| Size | Padding | Text |
|------|---------|------|
| `sm` | `px-3 py-1.5` | `text-xs` |
| `md` | `px-4 py-2` | `text-sm` |
| `lg` | `px-6 py-3` | `text-base` |

**States:**
- Disabled: `opacity-50 cursor-not-allowed`
- Loading: Inline SVG spinner with `animate-spin`, button disabled
- Focus: `ring-2 ring-offset-2`

### Button Placement Convention

| Context | Placement |
|---------|-----------|
| List page header | Right-aligned `<Button>` with Plus icon |
| Form footer | `pt-4 flex justify-end gap-3 border-t` — Cancel (secondary) then Submit (primary) |
| Detail page header | Right-aligned Edit button |
| Table row actions | `flex items-center gap-2` — Eye, Edit2, Trash2 icons in ghost buttons |
| Modal footer | `flex gap-3 justify-end mt-6` — Cancel then Confirm |

---

## 10. Forms and Inputs

### Library: react-hook-form

All forms use:
```jsx
const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch } = useForm();
```

### Input Styling

**Standard input** (used in all dashboard forms):
```
block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm
```

**Auth page input** (slightly different):
```
w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white
focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-sm
```

### Form Structure

```jsx
<div className="space-y-6 max-w-2xl mx-auto">
  {/* Back button + title */}
  <Card>
    <CardHeader title="..." subtitle="..." />
    <CardContent>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Field pairs */}
        </div>
        {/* Full-width fields */}
        <div className="pt-4 flex justify-end gap-3 border-t">
          <Button variant="secondary" onClick={() => navigate("...")}>Cancel</Button>
          <Button type="submit" loading={isSubmitting}>Create</Button>
        </div>
      </form>
    </CardContent>
  </Card>
</div>
```

### Validation Pattern

```jsx
<input {...register("firstName", { required: "First name is required" })} />
{errors.firstName && <p className="text-xs text-red-600">{errors.firstName.message}</p>}
```

### Edit Form Data Loading

```jsx
const { data, isLoading } = useQuery({ queryKey: ["member", id], ... });
const { reset } = useForm();
useEffect(() => { if (data) reset(data); }, [data, reset]);
```

### Select Dropdowns with Related Data

```jsx
const { data: trainers } = useQuery({ queryKey: ["trainers-select"], queryFn: ... });
<select {...register("trainerId")}>
  <option value="">No Trainer</option>
  {trainers?.map(t => <option key={t.id} value={t.id}>{t.first_name}</option>)}
</select>
```

### Textarea

Same input classes + `rows` attribute. Used for: notes (3 rows), descriptions (4 rows).

> **Inconsistency:** No `<FormInput>` wrapper component exists. The same className string is repeated 50+ times across forms. Should be extracted.

---

## 11. Tables and Data Display

### Component: `src/components/data-table.jsx`

Props passed by every list page:
```jsx
<DataTable
  columns={columns}
  data={data?.data || []}
  totalCount={data?.totalCount || 0}
  pageIndex={pageIndex}
  pageSize={pageSize}
  setPageIndex={setPageIndex}
  setPageSize={setPageSize}
  isLoading={isLoading}
  searchQuery={searchQuery}
  setSearchQuery={setSearchQuery}
  filters={filters}
  setFilters={setFilters}
  availableFilters={availableFilters}
/>
```

### Column Definition

```jsx
const columns = [
  { header: "ID", accessorKey: "id" },
  { id: "name", header: "Name", cell: ({ row }) => <span>{row.original.first_name}</span> },
  { header: "Status", accessorKey: "status", cell: ({ getValue }) => <Badge variant={getValue() === "ACTIVE" ? "success" : "warning"}>{getValue()}</Badge> },
  { id: "actions", header: "Actions", cell: ({ row }) => (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" className="p-1" onClick={() => navigate(`/dashboard/members/${row.original.id}`)}><Eye className="h-4 w-4" /></Button>
      <Button variant="ghost" size="sm" className="p-1" onClick={() => navigate(`/dashboard/members/${row.original.id}/edit`)}><Edit2 className="h-4 w-4" /></Button>
      <Button variant="ghost" size="sm" className="p-1 text-red-600 hover:text-red-700" onClick={() => handleDeleteClick(row.original)}><Trash2 className="h-4 w-4" /></Button>
    </div>
  )},
];
```

### Filter Configuration

```jsx
const availableFilters = [
  { id: "status", label: "Status", type: "select", options: [{ label: "Active", value: "ACTIVE" }] },
  { id: "startDate", label: "From Date", type: "date" },
];
```

### Table Styling

- Container: `bg-white shadow sm:rounded-lg border overflow-hidden`
- Header: `bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider`
- Row: `hover:bg-gray-50 transition-colors`
- Cell: `px-6 py-4 whitespace-nowrap text-sm text-gray-900`
- Empty: inline "No records found" text (not using EmptyState component)

> **Anti-pattern:** Every list page duplicates pagination/filter state boilerplate. Should extract a `useDataTable()` hook.

---

## 12. Cards and Containers

### Component: `src/components/ui/card.jsx`

- **Card:** `bg-white border rounded-lg shadow-sm overflow-hidden`
- **CardHeader:** `px-6 py-4 border-b flex justify-between items-center`
  - Title: `text-lg font-semibold text-gray-900`
  - Subtitle: `text-sm text-gray-500 mt-1`
- **CardContent:** `px-6 py-4`
- **StatCard:** Icon in `p-3 bg-indigo-50 rounded-full` + label + value + trend indicator

### Info Grid Pattern (Detail Pages)

```jsx
<div className="grid gap-6 md:grid-cols-2">
  <Card>
    <CardHeader title="Personal Information" />
    <CardContent className="space-y-3">
      <div>
        <p className="text-sm text-gray-600">Full Name</p>
        <p className="font-semibold">{name}</p>
      </div>
    </CardContent>
  </Card>
</div>
```

---

## 13. Feedback States

### Loading

- **Page loading:** Inline `animate-pulse` skeletons (not using `loading-skeleton.jsx`)
- **Table loading:** Spinner `animate-spin h-5 w-5 border-b-2 border-indigo-600 rounded-full`
- **Button loading:** Built-in `loading` prop on Button component
- **Data loading (forms):** `animate-spin h-8 w-8 border-b-2 border-indigo-600 rounded-full` centered
- **Simple text:** Some pages just show `"Loading..."` text

### Error

- **Form validation:** `<p className="text-xs text-red-600">{error.message}</p>` below field
- **Auth errors:** `bg-red-50 border border-red-200 p-3 text-sm text-red-700 rounded-lg`
- **API errors:** `toast.error("Failed to create member")`
- **Missing:** No error boundaries on individual pages. No 404 page for invalid IDs. No network retry UI.

### Empty

- **Component exists:** `src/components/empty-state.jsx` — icon + title + description + action
- **Rarely used:** Most pages show inline "No records found" text instead
- **DataTable:** Shows "No records found" centered in table

### Success

- `toast.success("Member created successfully")`
- Then `navigate()` to list or detail page

---

## 14. Modals / Drawers / Overlays

### Confirmation Modal (`src/components/confirmation-modal.jsx`)

```jsx
<ConfirmationModal
  isOpen={open}
  onClose={() => setOpen(false)}
  onConfirm={handleDelete}
  title="Delete Member"
  message="Are you sure?"
  confirmText="Delete"
  isLoading={deleting}
/>
```

- Overlay: `fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50`
- Modal: `bg-white rounded-lg shadow-xl max-w-md w-full p-6`
- Alert icon: `p-3 bg-yellow-100 rounded-full` with `text-yellow-600` AlertTriangle
- Actions: Cancel (secondary) + Confirm (variant) in `flex gap-3 justify-end mt-6`

> **Missing:** No `aria-modal`, `role="alertdialog"`, focus trap, or escape-key handler.

### No Drawers

The app does not use drawer/sheet components.

---

## 15. Icons and Visual Elements

### Library: Lucide React

| Size | Class | Usage |
|------|-------|-------|
| `h-4 w-4` | Small | Button icons, table actions, inline |
| `h-5 w-5` | Medium | Sidebar nav, back buttons |
| `h-6 w-6` | Large | Stat cards, modal alert icon |
| `h-8 w-8` | XL | Auth page branding, loading spinners |

### Common Icons

| Icon | Usage |
|------|-------|
| `Plus` | Add buttons |
| `Eye` | View action |
| `Edit2` | Edit action |
| `Trash2` | Delete action |
| `ChevronLeft` / `ChevronRight` | Back button, pagination |
| `Search` | Search input |
| `Filter` | Filter toggle |
| `X` | Close modal |
| `Loader2` | Loading spinner (with `animate-spin`) |
| `Mail`, `Lock`, `Eye`, `EyeOff` | Auth form inputs |
| `Dumbbell` | GymFlow branding |
| `AlertTriangle` | Warning modal |
| `ShieldAlert` | Restricted access |

### Avatars

Initials in circle: `h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs`

---

## 16. Responsive Behavior

| Breakpoint | Width | Usage |
|-----------|-------|-------|
| `md` | 768px | 2-col form grids, filter row layout, search width |
| `lg` | 1024px | 4-col stat grid, 2-col detail grid, sidebar visibility |

### Common Responsive Patterns

- Grids: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
- Sidebar: Always visible (no mobile collapse/hamburger)
- Search: `w-full md:w-96`
- Auth: `hidden lg:flex` for brand panel, stacked on mobile

> **Gap:** No mobile sidebar handling. Sidebar is always 256px. On small screens, content is pushed off.

---

## 17. Reusable Components and Shared Patterns

### Use These Components

| Component | File | When to use |
|-----------|------|-------------|
| `Button` | `src/components/ui/button.jsx` | All clickable actions |
| `Badge` | `src/components/ui/badge.jsx` | Status indicators |
| `Card`, `CardHeader`, `CardContent` | `src/components/ui/card.jsx` | Content sections |
| `StatCard` | `src/components/ui/card.jsx` | Dashboard KPIs |
| `DataTable` | `src/components/data-table.jsx` | Any paginated list |
| `ConfirmationModal` | `src/components/confirmation-modal.jsx` | Delete confirmations |
| `EmptyState` | `src/components/empty-state.jsx` | No data states |
| `cn()` | `src/utils/cn.js` | Merging Tailwind classes |

### Not Shared But Should Be

| Pattern | Currently | Should be |
|---------|-----------|-----------|
| Form input | Inline className repeated 50+ times | `<FormInput>` component |
| Tab navigation | Inline in each page | Shared `<Tabs>` component |
| DataTable state | 6 useState calls in each list page | `useDataTable()` hook |
| Delete modal state | 2 useState calls in each list page | `useDeleteModal()` hook |
| Page loading | Inline spinners | Consistent `<PageSkeleton>` |

---

## 18. UX Conventions

### Data Fetching

```jsx
const { data, isLoading } = useQuery({
  queryKey: ["members", pageIndex, pageSize, searchQuery, filters],
  queryFn: async () => {
    const params = new URLSearchParams({ page: pageIndex, limit: pageSize, search: searchQuery, ...filters });
    const res = await fetch(`/api/members?${params}`);
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  },
});
```

**API response format:** `{ data: [...], totalCount: number }`

### Mutations

```jsx
const mutation = useMutation({
  mutationFn: async (data) => { /* POST/PUT/DELETE */ },
  onSuccess: () => {
    toast.success("Created successfully");
    queryClient.invalidateQueries(["members"]);
    navigate("/dashboard/members");
  },
  onError: (error) => toast.error(error.message),
});
```

### Query Key Convention

| Pattern | Example |
|---------|---------|
| List | `["members", pageIndex, pageSize, searchQuery, filters]` |
| Detail | `["member", id]` |
| Related select | `["trainers-select"]` |
| Tab data | `["member-attendance", id]` with `enabled: activeTab === "attendance"` |
| Invalidation | `["members"]` (broad match) |

### React Query Config (`src/app/layout.jsx`)

```jsx
staleTime: 5 * 60 * 1000,  // 5 minutes
cacheTime: 30 * 60 * 1000, // 30 minutes (note: deprecated, should be gcTime)
retry: 1,
refetchOnWindowFocus: false,
```

---

## 19. Inconsistencies / Tech Debt

### Critical

| Issue | Location | Fix |
|-------|----------|-----|
| `image-upload-with-webcam.jsx` uses `blue-600`, `purple-600` buttons | Lines 119-149 | Use `<Button>` component |
| `signature-pad.jsx` uses `green-600` buttons | Multiple lines | Use `<Button>` component |
| CSS typo `text-red-red-600` | `subscriptions/[id]/edit/page.jsx` line 248 | Fix to `text-red-600` |
| `console.log()` in production | `subscriptions/[id]/edit/page.jsx` lines 23, 44, 78 | Remove |
| Duplicate `<Toaster>` instances | `root.tsx` + `dashboard/layout.jsx` | Keep only one in root |

### Medium

| Issue | Details |
|-------|---------|
| Form input class repeated 50+ times | No `<FormInput>` wrapper |
| DataTable boilerplate in every list page | No `useDataTable()` hook |
| Delete modal state in every list page | No `useDeleteModal()` hook |
| Tabs implemented inline in 3+ pages | No shared `<Tabs>` component |
| `loading-skeleton.jsx` exists but never used | Pages use inline skeletons |
| `empty-state.jsx` exists but rarely used | Pages show inline text |
| `cacheTime` deprecated in React Query v5 | Should be `gcTime` |
| Detail pages use `<a href>` for back button | Should use `navigate()` |
| Staff edit missing ADMIN role option | Doesn't match staff new form |
| Subscription edit shows all plans, new shows only active | Inconsistent filtering |

### Low

| Issue | Details |
|-------|---------|
| No accessibility (ARIA roles, labels, focus trap) | Entire app |
| No dark mode | No `dark:` classes |
| Chakra UI installed but unused | Dead code in `client-integrations/` |
| shadcn wrappers installed but unused (1,260 lines) | Dead code |
| No mobile sidebar collapse | Sidebar always visible at w-64 |

---

## 20. How to Build New Features Consistently

### Step-by-step for a new CRUD module

1. **API routes:** Create `src/app/api/{resource}/route.js` and `[id]/route.js`
2. **List page:** Copy `src/app/dashboard/members/page.jsx` as template
3. **New form:** Copy `src/app/dashboard/members/new/page.jsx`
4. **Detail page:** Copy `src/app/dashboard/members/[id]/page.jsx`
5. **Edit form:** Copy `src/app/dashboard/members/[id]/edit/page.jsx`
6. **Add to sidebar:** Add entry in `src/components/sidebar.jsx` navigation array

### Checklist before shipping new UI

- [ ] Uses `<Button>` component (not inline `<button>` with custom classes)
- [ ] Uses `<Badge>` variants (not inline status classes)
- [ ] Uses `<Card>` wrapper for content sections
- [ ] Uses `react-hook-form` for all forms
- [ ] Uses `useNavigate()` for navigation (never `window.location.href`)
- [ ] Uses `toast.success()` / `toast.error()` for feedback
- [ ] Query keys follow `["resource", ...dependencies]` convention
- [ ] Invalidates queries on mutation success
- [ ] Form has Cancel + Submit buttons in `pt-4 flex justify-end gap-3 border-t`
- [ ] Loading state shown during data fetch
- [ ] Error messages shown below invalid fields
- [ ] Page title uses `text-2xl font-bold text-gray-900`
- [ ] Inputs use standard class: `block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`
- [ ] No hardcoded colors outside the established palette

---

## 21. Recommended Reference Components / Files

### Copy patterns from these files first

| Purpose | Reference file |
|---------|---------------|
| List page with DataTable | `src/app/dashboard/members/page.jsx` |
| Create form | `src/app/dashboard/members/new/page.jsx` |
| Edit form with data loading | `src/app/dashboard/members/[id]/edit/page.jsx` |
| Detail page with tabs | `src/app/dashboard/members/[id]/page.jsx` |
| Dashboard stats | `src/app/dashboard/page.jsx` |
| Complex tabbed page | `src/app/dashboard/inventory/page.jsx` |
| Auth page | `src/app/account/signin/page.jsx` |
| API route (GET + POST) | `src/app/api/members/route.js` |
| API route (GET + PATCH + DELETE) | `src/app/api/members/[id]/route.js` |

### Things to avoid

- Don't use `window.location.href` — use `useNavigate()`
- Don't create inline buttons with custom colors — use `<Button>` component
- Don't hardcode filter/pagination state — copy the existing pattern from members/page.jsx
- Don't import from `@chakra-ui/react` or `@lshay/ui` — they're unused dead code
- Don't add a new `<Toaster>` — one already exists in root.tsx
- Don't use inline `bg-green-100 text-green-800` for status — use `<Badge variant="success">`

---

## 22. Summary

### Frontend DNA

GymFlow Admin is a **pragmatic, Tailwind-first React SPA** with a small component library (Button, Badge, Card, DataTable, Modal) and consistent page patterns. It values simplicity over abstraction — forms use raw `register()` calls, tables repeat their state setup, and styling is direct Tailwind classes. The design language is **indigo primary, gray neutrals, status badges, card-based layout**. It's functional and consistent at the page level but has accumulated duplication that would benefit from extraction into hooks and wrapper components.

### Most Important Patterns to Preserve

1. **Indigo-600 as primary color** — every interactive element
2. **Card-based content** — all sections wrapped in `<Card>`
3. **DataTable for lists** — with search, filters, pagination, actions
4. **react-hook-form for all forms** — with `register()` + error display
5. **React Query for all data** — queryKey convention, invalidation on mutation
6. **Sonner toast for feedback** — success/error after mutations
7. **useNavigate for routing** — enforced by navigation safety tests

### Biggest Inconsistencies to Fix

1. Upload components using non-primary colors (`blue-600`, `purple-600`, `green-600`)
2. No shared form input component (same className repeated 50+ times)
3. No shared tab component (inline implementation in 3+ pages)
4. Duplicate Toaster instances
5. Dead code: unused Chakra UI and shadcn wrappers
