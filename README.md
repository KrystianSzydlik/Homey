# 🏠 HOMEY

> Minimalistyczna aplikacja webowa dla par do zarządzania wspólnym życiem

## 📋 O Projekcie

HOMEY to prywatna aplikacja dla Ciebie i Twojej partnerki, która pomaga zarządzać:
- 🛒 **Listą zakupów** - wspólne planowanie zakupów
- ✅ **Todo listą** - zadania do zrobienia
- 📖 **Cookbook** - przepisy kulinarne ze zdjęciami
- 🌟 **Habit Tracker** - śledzenie nawyków z gamifikacją

## 🚀 Tech Stack

### Frontend
- **Next.js 14+** (App Router) - framework React z SSR
- **TypeScript** - type safety
- **CSS Modules** - scoped styling (SCSS/LESS opcjonalnie)
- **Framer Motion** - animacje i transitions
- **Mantine** - komponenty UI

### Backend
- **Next.js Server Actions** - API bez endpoint'ów
- **Prisma ORM** - type-safe database client
- **PostgreSQL** (Neon) - relacyjna baza danych
- **NextAuth.js v5** - autoryzacja (2 hardcoded konta)

### Storage & Deployment
- **Vercel Blob** - storage dla zdjęć przepisów
- **Vercel** - hosting (wszystko w jednym)

## 🔐 Autoryzacja

Aplikacja używa NextAuth.js z **2 hardcoded kontami**:
- Twoje konto
- Konto partnera

Hasła są hashowane za pomocą bcrypt. Brak możliwości rejestracji.

## 🛠 Setup Projektu

### 1. Instalacja
```bash
# Clone repo (jeśli używasz Git)
git clone <repo-url>
cd homey

# Install dependencies
npm install

# Setup Prisma
npx prisma init
npx prisma migrate dev --name init
npx prisma generate
```

### 2. Environment Variables

Stwórz plik `.env.local`:
```bash
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://..."

# NextAuth
AUTH_SECRET="wygeneruj-32-znakowy-secret"
# Wygeneruj: openssl rand -base64 32

# Vercel Blob (opcjonalne na start)
BLOB_READ_WRITE_TOKEN="..."
```

### 3. Hashowanie haseł
```bash
node
```
```javascript
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('twoje_haslo', 10);
console.log(hash);
```

Wklej hashe do `lib/auth-users.ts`

### 4. Run Development Server
```bash
npm run dev
```

Otwórz [http://localhost:3000](http://localhost:3000)

## 📂 Struktura Projektu
```
homey/
├── app/
│   ├── (dashboard)/          # Chronione strony (wymaga logowania)
│   │   ├── page.tsx          # Landing z 4 kartami
│   │   ├── shopping/         # Lista zakupów
│   │   ├── todo/             # Todo lista
│   │   ├── cookbook/         # Przepisy
│   │   └── habits/           # Habit tracker
│   ├── login/                # Strona logowania
│   └── api/
│       └── auth/             # NextAuth API routes
├── components/               # Reusable components
│   ├── DashboardCard.tsx
│   ├── LogoutButton.tsx
│   └── animations/           # Framer Motion animacje
├── lib/
│   ├── auth-users.ts         # Hardcoded users
│   └── prisma.ts             # Prisma client
├── prisma/
│   └── schema.prisma         # Database schema
├── auth.ts                   # NextAuth config
├── auth.config.ts            # NextAuth config opcje
└── middleware.ts             # Route protection
```

## 🎨 Design System

### Kolory
- Primary: `#667eea` → `#764ba2` (gradient)
- Background: `#f9fafb`
- Text: `#374151`
- Accent: `#3b82f6`

### Typography
- Font: System fonts (Inter, SF Pro, Segoe UI)
- Heading: 600-700 weight
- Body: 400-500 weight

### Spacing
- Base unit: 4px (0.25rem)
- Typical gaps: 8px, 16px, 24px, 32px

## 🗓 Roadmap MVP (4-6 tygodni)

### ✅ Tydzień 1: Foundation (CURRENT)
- [x] Setup Next.js + TypeScript
- [x] NextAuth z 2 hardcoded kontami
- [x] Prisma + Neon PostgreSQL
- [x] Login page + middleware
- [ ] Basic routing structure

### 📅 Tydzień 2: Landing + Lists
- [ ] Landing page z 4 animowanymi kartami
  - [ ] Długopis dla Shopping/Todo
  - [ ] Otwierająca się książka dla Cookbook
  - [ ] Radosne słońce dla Habit Tracker
- [ ] Shopping List CRUD
  - [ ] Dodawanie produktów
  - [ ] Checkbox do zaznaczania
  - [ ] Usuwanie
- [ ] Todo List CRUD
  - [ ] Dodawanie zadań
  - [ ] Oznaczanie jako ukończone
  - [ ] Usuwanie

### 📅 Tydzień 3: Cookbook
- [ ] Listing przepisów (grid view)
- [ ] Detail page przepisu
- [ ] Formularz dodawania przepisu
  - [ ] Tytuł, opis
  - [ ] Lista składników (dynamic fields)
  - [ ] Kroki przygotowania
- [ ] Upload zdjęcia (Vercel Blob)
- [ ] Search/filter przepisów

### 📅 Tydzień 4: Habit Tracker
- [ ] Lista nawyków
- [ ] Dodawanie/usuwanie nawyku
- [ ] Calendar view (oznaczanie dni)
- [ ] Streak counter (serie dni z rzędu)
- [ ] Podstawowa wizualizacja postępu

### 📅 Tydzień 5: Polish & Responsive
- [ ] Responsywność (mobile-first)
- [ ] Loading states
- [ ] Error handling
- [ ] Empty states
- [ ] Accessibility (a11y)

### 📅 Tydzień 6: Testing & Deploy
- [ ] Manual testing wszystkich features
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] Deploy na Vercel Production

## 🎯 Post-MVP Features (Przyszłość)

### Zaawansowane
- [ ] Dark mode
- [ ] React Three Fiber dla 3D habit tree
- [ ] WebSocket dla real-time sync
- [ ] Push notifications
- [ ] Data export (JSON/CSV)
- [ ] Shared shopping lists z real-time updates

### Gamification
- [ ] Achievement system
- [ ] XP points za ukończone nawyki
- [ ] Level up system
- [ ] Animated rewards

### Social
- [ ] Wspólne notes/komentarze
- [ ] Photo gallery z timeline
- [ ] Anniversary tracker

## 🧪 Prisma Commands
```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name <migration_name>

# Open Prisma Studio (DB GUI)
npx prisma studio

# Reset database (careful!)
npx prisma migrate reset
```

## 📝 Git Workflow (opcjonalnie)
```bash
# Feature branch
git checkout -b feature/shopping-list
git add .
git commit -m "feat: add shopping list CRUD"
git push origin feature/shopping-list

# Merge do main
git checkout main
git merge feature/shopping-list
```

## 🐛 Common Issues

### Problem: NextAuth session nie działa
**Rozwiązanie:** Sprawdź czy `AUTH_SECRET` jest ustawiony w `.env.local`

### Problem: Prisma nie widzi zmian w schema
**Rozwiązanie:** 
```bash
npx prisma generate
npx prisma migrate dev
```

### Problem: CORS errors
**Rozwiązanie:** NextAuth w Next.js 14+ nie powinien mieć problemów z CORS

### Problem: Nie mogę się zalogować
**Rozwiązanie:** 
1. Sprawdź czy email w formularzu zgadza się z `lib/auth-users.ts`
2. Sprawdź czy hasło jest poprawnie zahashowane
3. Sprawdź console/network tab w DevTools

## 📚 Dokumentacja

- [Next.js Docs](https://nextjs.org/docs)
- [NextAuth.js](https://authjs.dev/)
- [Prisma](https://www.prisma.io/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Mantine](https://mantine.dev/)

## 👥 Team

- Developer 1: Ty
- Developer 2: (opcjonalnie partner)

## 📄 License

Private project - not for distribution

---

**Made with ❤️ for better life organization**