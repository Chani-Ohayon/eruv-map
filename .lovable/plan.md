

# מפת העירוב — Eruv Map

## Overview
A real-time Eruv status tracker for Israel, built with Hebrew RTL layout, Leaflet maps, and Supabase backend. The app serves both public users checking Eruv status and inspectors updating it.

## Pages & Features

### 1. Homepage — Interactive Map View
- Full-screen Leaflet map of Israel with RTL Hebrew UI
- **Green markers** for Kosher Eruv locations, **Red markers** for non-Kosher/under repair
- Floating search bar at top: "חפש עיר או יישוב לשבת"
- Clicking a marker opens a bottom-sheet status card showing: city name, status (כשר/פסול), last updated time, supervising rabbi
- Seeded with 5-10 major Israeli cities (Jerusalem, Tel Aviv, Haifa, Be'er Sheva, Bnei Brak, Petah Tikva, Netanya, Ashdod)

### 2. Search & Filter
- Search bar filters map markers by city name in real-time
- Map pans/zooms to selected city

### 3. Shabbat Alerts Subscription
- Popup/section: "קבלת התראת עירוב ליום שישי"
- Fields: Name, Phone/Email, City selection
- Subscribe button with confirmation toast
- Data stored in Supabase `alert_subscriptions` table

### 4. Admin Dashboard (Eruv Inspector)
- Login page for authorized inspectors (Supabase Auth)
- Simple dashboard to update Eruv status per city: status toggle (כשר/פסול), notes, supervising rabbi
- Role-based access using a `user_roles` table (admin role)

### 5. Footer
- "שבת שלום - שמרו על גבולות השבת"

## Database Schema
- **eruv_locations**: id, city_name, lat, lng, status (kosher/not_kosher), supervising_rabbi, last_updated, updated_by
- **alert_subscriptions**: id, name, contact (phone/email), city_id, created_at
- **user_roles**: id, user_id, role (admin/user)

## Design
- Heebo font, RTL throughout
- Color tokens: Navy (#0F172A), Emerald (#059669), Red (#DC2626), White cards on slate background
- Large touch targets (48px+), high contrast for outdoor/mobile use
- Card-based status display with layered shadows
- Smooth animations via Framer Motion

