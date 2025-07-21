# Radix Themes + shadcn/ui Integration Implementation Plan

## Overview

This guide provides a systematic approach to complement shadcn/ui components with Radix Themes components across all route files, leveraging the strengths of both libraries while maintaining consistency and functionality.

## Strategy

**Hybrid Approach**: Use Radix Themes for layout, typography, and basic UI elements while keeping shadcn/ui for complex form controls, specialized components, and interactive elements that Radix Themes doesn't provide.

## Component Mapping Guide

### ✅ **Replace with Radix Themes**

| shadcn/ui                | Radix Themes  | Use Case          |
| ------------------------ | ------------- | ----------------- |
| `<div>` containers       | `<Box>`       | Layout containers |
| `<div className="flex">` | `<Flex>`      | Flexbox layouts   |
| `<div className="grid">` | `<Grid>`      | Grid layouts      |
| `<h1>`, `<h2>`, etc.     | `<Heading>`   | Typography        |
| `<p>`, `<span>`          | `<Text>`      | Body text         |
| `<hr>`                   | `<Separator>` | Visual separators |
| Basic `<Button>`         | `<Button>`    | Simple buttons    |
| Basic `<Card>`           | `<Card>`      | Content cards     |
| `<Badge>`                | `<Badge>`     | Status indicators |

### 🤝 **Keep shadcn/ui**

- `<Input>`, `<Textarea>` - Form controls
- `<Select>`, `<Checkbox>`, `<Switch>` - Interactive form elements
- `<Dialog>`, `<Popover>`, `<Tooltip>` - Complex overlays
- `<Table>` - Data tables
- `<Progress>`, `<Slider>` - Interactive components
- `<Alert>`, `<AlertDialog>` - Specialized feedback

## Route-by-Route Implementation Plan

### Phase 1: Foundation Routes (Week 1)

#### 1. **`index.tsx`** - Home Page ✅ COMPLETED

**Priority**: High | **Complexity**: Low | **Status**: ✅ Done

**Changes Made**:

- Replaced basic containers with `<Box>`
- Updated typography to use `<Heading>` and `<Text>`
- Converted separators to `<Separator>`
- Replaced button with Radix `<Button>`
- Updated loading states and error messages

**Result**: Clean hybrid implementation demonstrating the pattern.

#### 2. **`hydration-test.tsx`** - SSR Hydration Testing

**Priority**: Medium | **Complexity**: Low

**Implementation**:

```typescript
<Box className="container mx-auto p-8 space-y-8">
    <Heading size="7">SSR Hydration Test Page</Heading>
    <Text size="3" color="gray">
        Testing hydration solutions with various patterns
    </Text>

    <Flex direction="column" gap="4">
        <Box>
            <Heading size="5" mb="4">Testing Hydration Solutions</Heading>
            {/* Keep ClientOnly components as-is */}
        </Box>
    </Flex>
</Box>
```

#### 3. **`ssr-example.tsx`** - SSR Example

**Priority**: Medium | **Complexity**: Low

**Implementation**:

```typescript
<Box className="p-5">
    <Heading size="6" mb="4">SSR Example with TanStack Router</Heading>
    <Text mb="5">
        This page demonstrates proper SSR implementation...
    </Text>

    <Flex direction="column" gap="4">
        {posts.map((post) => (
            <Card key={post.id}>
                <Heading size="4" mb="2">{post.title}</Heading>
                <Text>{post.body}</Text>
                <Text size="2" color="gray" mt="2">
                    Post ID: {post.id} | User ID: {post.userId}
                </Text>
            </Card>
        ))}
    </Flex>
</Box>
```

### Phase 2: Demo/Showcase Routes (Week 2)

#### 4. **`radix-themes-demo.tsx`** - Already Implemented ✅

**Status**: Complete - This file already demonstrates Radix Themes usage

#### 5. **`shadcn-demo.tsx`** - Component Showcase

**Priority**: High | **Complexity**: Medium

**Strategy**: Enhance this file to show the hybrid approach - demonstrate both libraries working together

**Implementation**:

```typescript
<Box className="container mx-auto p-6 space-y-8">
    <Box className="text-center">
        <Heading size="7" mb="2">shadcn/ui Components Demo</Heading>
        <Text size="3" color="gray">Showcasing the installed component library</Text>
    </Box>

    {/* Add Radix Themes section alongside shadcn examples */}
    <Separator size="4" />

    <Box>
        <Heading size="6" mb="4">Hybrid Component Approach</Heading>
        <Flex gap="4" direction="column">
            <Card> {/* Radix Card */}
                <Heading size="4" mb="3">Form Example</Heading>
                <Flex direction="column" gap="3">
                    <Input placeholder="Email" /> {/* shadcn Input */}
                    <Button size="3">Submit</Button> {/* Radix Button */}
                </Flex>
            </Card>
        </Flex>
    </Box>

    <Grid columns="2" gap="6">
        <Card>
            <Heading size="4" mb="2">Radix Themes</Heading>
            <Text size="2" mb="3">Layout, typography, and basic UI</Text>
            <Badge color="green">Layout System</Badge>
        </Card>

        <Card>
            <Heading size="4" mb="2">shadcn/ui</Heading>
            <Text size="2" mb="3">Form controls and complex interactions</Text>
            <Badge variant="outline">Form Controls</Badge>
        </Card>
    </Grid>
</Box>
```

#### 6. **`logger-demo.tsx`** & **`logger-file-demo.tsx`** - Logging Demos

**Priority**: Medium | **Complexity**: Low

**Implementation**:

```typescript
// logger-demo.tsx
<Box className="min-h-screen bg-gray-50 py-8">
    <Flex direction="column" gap="4" className="max-w-4xl mx-auto px-4">
        <Box className="mb-8">
            <Heading size="7" mb="4">Pino v8 Logger Demonstration</Heading>
            <Text size="4" mb="2">
                This page demonstrates the structured logging capabilities using Pino v8.
            </Text>
            <Text size="2" color="gray">
                Open your browser's Developer Tools console to see the structured log output.
            </Text>
        </Box>

        <Card>
            <Heading size="5" mb="4">Logging Features Demonstrated</Heading>
            <Grid columns="2" gap="4">
                <Box>
                    <Heading size="3" mb="2">Core Features</Heading>
                    <Flex direction="column" gap="1">
                        <Text size="2">• Structured JSON logging</Text>
                        <Text size="2">• Component lifecycle tracking</Text>
                        <Text size="2">• Error logging with stack traces</Text>
                        <Text size="2">• Performance metric collection</Text>
                    </Flex>
                </Box>
                <Box>
                    <Heading size="3" mb="2">Context & Metadata</Heading>
                    <Flex direction="column" gap="1">
                        <Text size="2">• User ID tracking</Text>
                        <Text size="2">• Operation counters</Text>
                        <Text size="2">• Timestamp inclusion</Text>
                        <Text size="2">• Browser metadata</Text>
                    </Flex>
                </Box>
            </Grid>
        </Card>
    </Flex>
</Box>
```

### Phase 3: Complex Demo Routes (Week 3)

#### 7. **`drizzle-example.tsx`** - Database Example

**Priority**: High | **Complexity**: Medium

**Implementation**:

```typescript
<Box className="container mx-auto p-8">
    <Heading size="7" mb="8">Drizzle ORM + TanStack Start Example</Heading>

    <Flex direction="column" gap="12">
        {/* Users Section */}
        <Box>
            <Heading size="5" mb="4">Users</Heading>

            <Suspense fallback={<Text color="gray">Loading users...</Text>}>
                <Await promise={loaderData.usersPromise}>
                    {(users: User[]) => (
                        <>
                            {/* Create User Form */}
                            <Card className="bg-gray-100 p-4 rounded-lg mb-6">
                                <Heading size="3" mb="3">Create New User</Heading>
                                <form className="space-y-3" onSubmit={handleCreateUser}>
                                    <Input
                                        className="w-full p-2 border rounded"
                                        placeholder="Name"
                                        required={true}
                                        type="text"
                                        value={newUserName}
                                        onChange={(e) => setNewUserName(e.target.value)}
                                    />
                                    <Input
                                        className="w-full p-2 border rounded"
                                        placeholder="Email"
                                        required={true}
                                        type="email"
                                        value={newUserEmail}
                                        onChange={(e) => setNewUserEmail(e.target.value)}
                                    />
                                    <Button type="submit" size="3">
                                        Create User
                                    </Button>
                                </form>
                            </Card>

                            {/* Users List */}
                            <Grid columns="3" gap="4">
                                {users.map((user: User) => (
                                    <Card key={user.id} className="p-4">
                                        <Heading size="3" mb="1">{user.name}</Heading>
                                        <Text size="2" color="gray" mb="1">{user.email}</Text>
                                        {user.age && <Text size="1">Age: {user.age}</Text>}
                                        <Text size="1" color="gray">
                                            Created: {new Date(user.createdAt).toLocaleDateString()}
                                        </Text>
                                    </Card>
                                ))}
                            </Grid>
                        </>
                    )}
                </Await>
            </Suspense>
        </Box>

        {/* Database Info */}
        <Card className="bg-blue-50 p-6">
            <Heading size="5" mb="4">Database Information</Heading>
            <Suspense fallback={<Text color="gray">Loading stats...</Text>}>
                <Await promise={loaderData.usersPromise}>
                    {(users: User[]) => (
                        <Grid columns="3" gap="4">
                            <Box className="text-center">
                                <Text size="6" weight="bold" color="blue">
                                    {users.length}
                                </Text>
                                <Text size="2" color="gray">Total Users</Text>
                            </Box>
                            {/* Additional stats */}
                        </Grid>
                    )}
                </Await>
            </Suspense>
        </Card>
    </Flex>
</Box>
```

#### 8. **Map-related routes** - Map Demos

**Priority**: Medium | **Complexity**: High

**Files**: `map-demo.tsx`, `map-debug.tsx`, `map-debug-simple.tsx`, `map-resize-demo.tsx`

**Implementation Pattern**:

```typescript
// map-demo.tsx
<Flex direction="column" gap="6">
    <Box>
        <Heading size="6" mb="2">Simple Map Demo</Heading>
        <Text size="3" color="gray">A basic demonstration of the map module.</Text>
    </Box>

    <Card className="border rounded-lg overflow-hidden shadow-sm">
        <ClientOnly
            fallback={
                <Flex align="center" justify="center" className="h-[600px] w-full bg-gray-100">
                    <Text color="gray">Loading map...</Text>
                </Flex>
            }
        >
            <MapProvider initialConfig={mapConfig}>
                <Box className="h-[600px] w-full">
                    <MapComponent initialView={mapConfig.initialView} styleUrl={mapConfig.styleUrl} />
                </Box>
            </MapProvider>
        </ClientOnly>
    </Card>
</Flex>
```

### Phase 4: Specialized Demo Routes (Week 4)

#### 9. **`layer-manager-demo.tsx`** - Complex Layer Management

**Priority**: High | **Complexity**: High

**Implementation**:

```typescript
<Flex className="h-screen w-full">
    {/* Map Container */}
    <Box className="flex-1 relative">
        <MapProvider initialConfig={createMapConfig(layerManagerConfig)}>
            <MapComponent
                initialView={createInitialView()}
                styleUrl="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
            />
        </MapProvider>
    </Box>

    {/* Configuration Panel */}
    <Box className="w-96 bg-background border-l p-6 overflow-y-auto">
        <Card>
            <Heading size="4" mb="2">Layer Manager Configuration</Heading>
            <Text size="2" color="gray" mb="4">
                Customize the LayerManager widget behavior and appearance
            </Text>

            <Flex direction="column" gap="6">
                <Flex align="center" justify="between">
                    <Box>
                        <Text size="2" weight="bold">Enhanced Mode</Text>
                        <Text size="1" color="gray">
                            Enable advanced UI features like opacity controls
                        </Text>
                    </Box>
                    <Switch /> {/* Keep shadcn Switch */}
                </Flex>

                <Separator />

                <Box>
                    <Heading size="3" mb="3">Preset Configurations</Heading>
                    <Flex direction="column" gap="2">
                        <Button
                            variant="outline"
                            size="2"
                            className="w-full justify-start"
                            onClick={() => setLayerManagerConfig({...})}
                        >
                            Full Featured
                        </Button>
                        <Button
                            variant="outline"
                            size="2"
                            className="w-full justify-start"
                            onClick={() => setLayerManagerConfig({...})}
                        >
                            Read-Only Mode
                        </Button>
                    </Flex>
                </Box>
            </Flex>
        </Card>
    </Box>
</Flex>
```

#### 10. **SIDC Demo Routes** - Military Visualization

**Priority**: Medium | **Complexity**: High

**Files**: `sidc-demo.tsx`, `sidc-layer-demo.tsx`

**Implementation**:

```typescript
// sidc-demo.tsx
<Box className="min-h-screen bg-gray-50 p-4">
    <Box className="max-w-7xl mx-auto">
        {/* Header */}
        <Box className="mb-6">
            <Heading size="7" mb="2">SIDC Layer Management Demo</Heading>
            <Text size="3" color="gray">
                Interactive demonstration of military unit visualization with dynamic layer management.
            </Text>
        </Box>

        {/* Controls */}
        <Flex gap="4" mb="6">
            <Button
                variant={isSimulating ? "solid" : "outline"}
                color={isSimulating ? "red" : "blue"}
                onClick={() => setIsSimulating(!isSimulating)}
            >
                {isSimulating ? "Stop Simulation" : "Start Simulation"}
            </Button>
            <Button variant="outline" onClick={resetLayers}>
                Reset Layers
            </Button>
        </Flex>

        {/* Main Content Grid */}
        <Grid columns="4" gap="6">
            {/* Unit Information Panel */}
            <Box>
                <Heading size="5" mb="4">Unit Status</Heading>
                <Flex direction="column" gap="4">
                    {units.map((unit) => (
                        <Card key={unit.id} className="p-4">
                            <Flex align="center" justify="between" mb="2">
                                <Heading size="3">{unit.name}</Heading>
                                <Badge color={getStatusColor(unit.status)}>
                                    {unit.status}
                                </Badge>
                            </Flex>
                            <Text size="2" color="gray">
                                SIDC: {unit.sidc}
                            </Text>
                            <Separator size="1" my="2" />
                            <Grid columns="2" gap="2">
                                <Text size="1">Fuel: {unit.fuel}%</Text>
                                <Text size="1">Personnel: {unit.personnel}</Text>
                            </Grid>
                        </Card>
                    ))}
                </Flex>
            </Box>

            {/* Map Visualization */}
            <Box className="col-span-2">
                <MapVisualization layerStates={layerStates} />
            </Box>

            {/* Layer Controls */}
            <Box>
                <Card>
                    <Heading size="4" mb="4">Layer Controls</Heading>
                    <Flex direction="column" gap="4">
                        {Object.entries(LAYER_GROUPS).map(([groupId, group]) => (
                            <Box key={groupId}>
                                <Flex align="center" justify="between" mb="2">
                                    <Flex align="center" gap="2">
                                        <Text>{group.icon}</Text>
                                        <Box>
                                            <Text size="2" weight="bold">{group.name}</Text>
                                            <Text size="1" color="gray">{group.description}</Text>
                                        </Box>
                                    </Flex>
                                    <Switch /> {/* Keep shadcn Switch */}
                                </Flex>
                            </Box>
                        ))}
                    </Flex>
                </Card>
            </Box>
        </Grid>
    </Box>
</Box>
```

#### 11. **`server-log-broadcast-demo.tsx`** - Server Logging

**Priority**: Medium | **Complexity**: Medium

**Implementation**:

```typescript
<Box className="container mx-auto py-8">
    <Flex direction="column" gap="6">
        <Box>
            <Heading size="6" mb="2">Server Log Broadcasting Demo</Heading>
            <Text size="3" color="gray">
                Generate server-side logs and see them replayed in your browser console!
            </Text>
        </Box>

        <Grid columns="2" gap="6">
            <Card>
                <Heading size="4" mb="2">🚀 Generate Server Logs</Heading>
                <Text size="2" color="gray" mb="4">
                    Click to generate logs on the server and broadcast them to your browser
                </Text>

                <Flex direction="column" gap="2">
                    <Button
                        className="w-full"
                        disabled={loading}
                        onClick={() => generateLogs(5)}
                    >
                        Generate 5 Server Logs
                    </Button>
                    <Button
                        className="w-full"
                        disabled={loading}
                        variant="outline"
                        onClick={() => generateLogs(10, true)}
                    >
                        Generate 10 Logs (with errors)
                    </Button>
                </Flex>

                <Box className="mt-4">
                    <Text size="2" color="gray">These logs include:</Text>
                    <Flex direction="column" gap="1" className="mt-1">
                        <Text size="1">• Server timestamps and process info</Text>
                        <Text size="1">• Memory usage and system details</Text>
                        <Text size="1">• Warnings and debug information</Text>
                        <Text size="1">• Optional error simulation</Text>
                    </Flex>
                </Box>
            </Card>

            <Card>
                <Heading size="4" mb="2">🔧 Complex Operations</Heading>
                <Text size="2" color="gray" mb="4">
                    Run server operations with detailed logging
                </Text>

                <Flex direction="column" gap="2">
                    <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => performOperation("analyze")}
                    >
                        Run Analysis Operation
                    </Button>
                    <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => performOperation("process")}
                    >
                        Run Processing Operation
                    </Button>
                </Flex>

                <Flex gap="2" className="pt-2">
                    <Button size="1" variant="ghost" onClick={checkCurrentLogs}>
                        Check Current Logs
                    </Button>
                    <Button
                        disabled={logCount === 0}
                        size="1"
                        variant="ghost"
                        onClick={replay}
                    >
                        Replay Logs ({logCount})
                    </Button>
                </Flex>
            </Card>
        </Grid>
    </Flex>
</Box>
```

## Implementation Guidelines

### 1. **Import Strategy**

```typescript
// Always import Radix Themes with aliases to avoid conflicts
import {
    Box,
    Button as RadixButton,
    Card as RadixCard,
    Flex,
    Grid,
    Heading,
    Text,
    Separator,
    Badge as RadixBadge,
} from "@radix-ui/themes";

// Keep shadcn for specialized components
import { Input, Switch, Select, Alert } from "@/lib/components/ui";
```

### 2. **Component Decision Matrix**

| Component Type | Use Radix When      | Use shadcn When          |
| -------------- | ------------------- | ------------------------ |
| **Layout**     | Always              | Never                    |
| **Typography** | Always              | For form labels only     |
| **Buttons**    | Simple actions      | Complex form submissions |
| **Cards**      | Information display | Interactive forms        |
| **Inputs**     | Never               | Always                   |
| **Badges**     | Status indicators   | Interactive filters      |

### 3. **Styling Approach**

```typescript
// ✅ GOOD - Radix props + Tailwind classes
<Box className="container mx-auto p-8">
    <Heading size="6" mb="4">Title</Heading>
    <Text size="3" color="gray">Description</Text>
</Box>

// ✅ GOOD - Hybrid approach
<Card> {/* Radix Card */}
    <form className="space-y-4"> {/* Tailwind for form layout */}
        <Input placeholder="Email" /> {/* shadcn Input */}
        <RadixButton type="submit">Submit</RadixButton> {/* Radix Button */}
    </form>
</Card>
```

### 4. **Migration Checklist per Route**

For each route file:

- [ ] **Layout**: Replace `<div>` containers with `<Box>`, `<Flex>`, `<Grid>`
- [ ] **Typography**: Replace headings with `<Heading>`, paragraphs with `<Text>`
- [ ] **Separators**: Replace `<hr>` with `<Separator>`
- [ ] **Simple Buttons**: Replace with Radix `<Button>`
- [ ] **Cards**: Replace basic cards with Radix `<Card>`
- [ ] **Badges**: Replace status badges with Radix `<Badge>`
- [ ] **Keep Forms**: Maintain shadcn form components
- [ ] **Test**: Verify functionality and visual consistency

## Expected Outcomes

### **Benefits**

1. **Consistent Design Language**: Unified theme system across components
2. **Better Integration**: Native Radix Themes integration with existing theme
3. **Improved DX**: Better prop APIs for layout and typography
4. **Reduced Bundle Size**: Fewer duplicate components

### **Timeline**

- **Week 1**: Foundation routes (3-4 files)
- **Week 2**: Demo/showcase routes (3-4 files)
- **Week 3**: Complex demo routes (4-5 files)
- **Week 4**: Specialized routes (3-4 files)

### **Success Metrics**

- [ ] All routes maintain existing functionality
- [ ] Consistent visual hierarchy using Radix typography
- [ ] Improved code readability with semantic component names
- [ ] No accessibility regressions
- [ ] Bundle size reduction of 5-10% from component consolidation

## Quality Assurance

### **Testing Strategy**

- [ ] Visual regression testing for each route
- [ ] Accessibility testing with screen readers
- [ ] Performance testing for bundle size impact
- [ ] Cross-browser compatibility verification

### **Code Review Checklist**

- [ ] Consistent import patterns across files
- [ ] Proper component selection based on decision matrix
- [ ] No accessibility regressions
- [ ] Form functionality preserved
- [ ] Visual consistency maintained

### **Documentation Updates**

- [ ] Update component usage guidelines
- [ ] Create examples of hybrid patterns
- [ ] Document decision rationale
- [ ] Update team style guide

## Risk Mitigation

### **Potential Risks**

1. **Breaking Changes**: Component API differences
2. **Styling Conflicts**: Theme system clashes
3. **Performance Impact**: Bundle size increases
4. **Team Adoption**: Learning curve for new patterns

### **Mitigation Strategies**

1. **Incremental Migration**: One route at a time
2. **Comprehensive Testing**: Automated and manual testing
3. **Fallback Plans**: Keep original components as backup
4. **Team Training**: Documentation and examples

## Next Steps

1. **✅ Complete index.tsx** (Done)
2. **Begin hydration-test.tsx** implementation
3. **Create shared component patterns** for reuse
4. **Set up automated testing** for visual regressions
5. **Document lessons learned** from first implementations

This systematic approach ensures a smooth migration while preserving the strengths of both component libraries and maintaining excellent developer experience.
