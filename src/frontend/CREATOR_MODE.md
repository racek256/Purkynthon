# Creator Mode Documentation

## Secret Activation

To activate Creator Mode, type the following key sequence anywhere in the application:

**↑ ↑ ↓ ↓ ← → ← → b a**

(Arrow keys: Up, Up, Down, Down, Left, Right, Left, Right, then 'b', then 'a')

## Features

### 1. Editable Level Metadata
- **Double-click** the level title to edit it
- **Double-click** the level description to edit it
- Press **Enter** to save changes
- Press **Escape** to cancel editing

### 2. Add Node Button
- A green "Add Node" button appears in the bottom-right corner
- Click to add new blank nodes to the canvas
- New nodes appear at random positions

### 3. Editable Node Titles
- **Double-click** any node title to edit it
- Press **Enter** to save, **Escape** to cancel
- All node titles become editable in Creator Mode

### 4. Enhanced JSON Export
- Click "Run Code" to export the complete level data
- JSON includes:
  - `name`: Level title
  - `description`: Level description  
  - `nodes`: All node data
  - `edges`: All connection data
  - `tags`: Metadata including "creator-mode" and timestamp
- Export is automatically copied to clipboard
- Full JSON is also displayed in console with colored formatting

## Deactivation

Type the secret sequence again to deactivate Creator Mode.

## Notes

- Creator Mode state is **not persistent** - it resets on page refresh
- All changes are temporary and only exist during the session
- The secret sequence is intentionally hidden from users
- No UI hints indicate the existence of Creator Mode

## Console Output Examples

### Activation
```
🎨 Creator Mode Activated! 🎨
```

### Deactivation  
```
Creator Mode Deactivated
```

### JSON Export
```
↓↓↓ JSON copy this ↓↓↓
{
  "name": "My Custom Level",
  "description": "This is my awesome level",
  "nodes": [...],
  "edges": [...],
  "tags": ["creator-mode", "2025-12-13T10:30:45.123Z"]
}
↑↑↑ JSON copy this ↑↑↑
✅ JSON copied to clipboard!
```