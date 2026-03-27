import type { Lesson } from '../../types/curriculum';

export const typescriptLessons: Lesson[] = [
  {
    id: 'ts_0',
    title: 'TypeScript: The Big Picture',
    badge: 'Foundations',
    badgeClass: 'badge-concept',
    content: [
      'TypeScript is JavaScript with **Syntax for Types**. It doesn\'t run in the browser; it is a "Static Type Checker" that finds bugs in your code before you even run it. If JS is the Wild West, TS is the sheriff fixing the town.',
      'The biggest benefit is **Developer Experience**. Because TS understands your data shapes, your editor can provide perfect auto-complete, instant documentation, and safe refactoring. It turns "undefined is not a function" errors from a runtime nightmare into a compile-time fix.',
      'TypeScript is "Gradual". You don\'t have to type everything at once. You can start with a standard JS file and slowly add types as you go, making it the perfect tool for scaleable, professional web development.'
    ],
    code: `// ── JavaScript (Silent Failures) ──
function add(a, b) { return a + b; }
add(5, "10"); // "510" (Wait, what?)

// ── TypeScript (Instant Feedback) ──
function addTS(a: number, b: number): number {
  return a + b;
}

addTS(5, "10"); 
// ❌ Error: Argument of type 'string' is not assignable to parameter of type 'number'.`
  },
  {
    id: 'ts_1',
    title: 'Interfaces vs Type Aliases',
    badge: 'Core',
    badgeClass: 'badge-concept',
    content: [
      'Both `interface` and `type` allow you to define the shape of an object, but they have different strengths. **Interfaces** are better for defining objects and can be "Extended" (merged) later. They are the standard for public APIs.',
      '**Type Aliases** are more flexible. They can represent primitives, unions (`string | number`), tuples, and more complex intersections. You can\'t "re-open" a type alias once it\'s defined, making them more predictable for internal logic.',
      'The rule of thumb: use `interface` for object structures that might be extended, and `type` for everything else (unions, utility types, and complex logic).'
    ],
    code: `// ── Interface: Extendable ──
interface User {
  id: string;
  name: string;
}

interface Admin extends User {
  role: 'superadmin' | 'moderator';
}

// ── Type: Flexible ──
type Status = 'loading' | 'success' | 'error';
type ID = string | number;

type Response = {
  data: User;
  status: Status;
};`
  },
  {
    id: 'ts_2',
    title: 'Generics: Reusable Logic',
    badge: 'Advanced',
    badgeClass: 'badge-concept',
    content: [
      '**Generics** are like "variables for types". They allow you to write components and functions that work with a variety of types while still maintaining full type safety. It\'s how libraries like React handle things like `useState<number>(0)`.',
      'Instead of using `any` (which turns off type-checking), a generic `<T>` captures the type the user provides and enforces it throughout the execution. This is essential for building reusable data structures like "ApiResponse", "List", or "Form".',
      'Complex generics can have "Constraints". You can tell TS that "T must at least be an object with an ID property" using `T extends { id: string }`. This gives you the flexibility of dynamic code with the safety of static types.'
    ],
    code: `// ── Generic API Wrapper ──
interface ApiResponse<DataType> {
  data: DataType;
  error?: string;
  timestamp: number;
}

// Usage with different types:
type UserResponse = ApiResponse<User>;
type PostResponse = ApiResponse<Post[]>;

// ── Generic Function with Constraint ──
function getID<T extends { id: string }>(item: T): string {
  return item.id;
}

getID({ id: "123", name: "Puru" }); // works!
// getID({ name: "Puru" }); // ❌ Error: Missing 'id'`
  },
  {
    id: 'ts_3',
    title: 'Union Types & Narrowing',
    badge: 'Core',
    badgeClass: 'badge-concept',
    content: [
      '**Union Types** (`A | B`) allow a value to be one of several types. This is incredibly common in real-world data (e.g., an API can return data OR an error).',
      '**Type Narrowing** is how you handle unions safely. You use conditional logic (`if`, `switch`, `typeof`) to "narrow down" the type so TS knows exactly what properties are available in that specific branch of your code.',
      'Advanced narrowing uses "Type Guards" and "Discriminated Unions". By adding a common `type` or `kind` property to your objects, you can handle complex logic with 100% type safety and zero "as any" casting.'
    ],
    code: `type NetworkState = 
  | { status: 'loading' }
  | { status: 'success', data: string }
  | { status: 'error',   message: string };

function render(state: NetworkState) {
  switch (state.status) {
    case 'loading':
      return "Spinning...";
    case 'success':
      // TS knows 'data' exists here!
      return state.data;
    case 'error':
      // TS knows 'message' exists here!
      return state.message;
  }
}`
  },
  {
    id: 'ts_4',
    title: 'UTILITY TYPES: Partial, Omit & Pick',
    badge: 'Core',
    badgeClass: 'badge-practice',
    content: [
      'You often need to create new types based on existing ones. TypeScript provides **Utility Types** to make this easy. `Partial<User>` makes every property in a User object optional — perfect for an "Update User" form.',
      '`Pick<User, "name" | "email">` creates a new type with only those specific properties. This is great for keeping your data lean when passing props to a small UI component.',
      '`Omit<User, "password" | "secret">` does the opposite — it takes everything *except* what you list. These utilities prevent you from having to manually sync 10 different versions of the same data shape.'
    ],
    code: `interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// 1. Partial: everything is optional
const updates: Partial<User> = { name: "New Name" };

// 2. Pick: only selected fields
type UserPreview = Pick<User, "name" | "avatar">;

// 3. Omit: remove sensitive fields
type PublicUser = Omit<User, "email">;

// 4. Record: handy for lookups
const userLookup: Record<string, User> = {
  "id_123": { id: "id_123", name: "Puru", email: "p@dev.com" }
};`
  },
  {
    id: 'ts_5',
    title: 'Mapped Types & Conditional Logic',
    badge: 'Expert',
    badgeClass: 'badge-concept',
    content: [
      '**Mapped Types** allow you to transform one type into another by iterating over its keys. You can turn every property of an object into a "Readonly" version, or prepend "get" to every property name.',
      '**Conditional Types** (`T extends U ? X : Y`) are the "if/else" of the type system. They allow you to create dynamic types that change based on the inputs. This is how high-level libraries (like Prisma or TRPC) achieve their "magic" type safety.',
      'While complex, these features allow you to build an "Unbreakable Architecture" where changing a single definition in your database propagates type errors through your entire stack, preventing whole classes of bugs from ever reaching production.'
    ],
    code: `// ── Mapped Type: Lock everything ──
type Locked<T> = {
  readonly [P in keyof T]: T[P];
};

const user: Locked<User> = { id: "1", name: "Puru" };
// user.name = "New"; // ❌ Error: Cannot assign to 'name' (read-only)

// ── Conditional Type ──
type IsString<T> = T extends string ? true : false;
type A = IsString<string>; // true
type B = IsString<number>; // false

// ── Template Literal Types (TS 4.1+) ──
type Color = 'primary' | 'secondary';
type Intensity = 'light' | 'dark';
type ThemeKeys = \`\${Intensity}-\${Color}\`; 
// Result: 'light-primary' | 'dark-primary' | ...`
  },
  {
    id: 'ts_6',
    title: 'Configuration: tsconfig.json Mastery',
    badge: 'Practice',
    badgeClass: 'badge-practice',
    content: [
      'The `tsconfig.json` file is where you define the "Strictness" of your project. Professional projects should always have **"strict": true** enabled. This turns on checks like `noImplicitAny` and `strictNullChecks`.',
      '**Path Aliases** (`compilerOptions.paths`) allow you to avoid "Import Hell" (e.g., `../../../components/Button`). Instead, you can define `@components/Button`, making your codebase much cleaner and easier to move files around.',
      'Understanding "Target" (which version of JS to compile to) and "Module" (how code is linked) is vital for performance. For modern web apps, targeting `ESNext` and using `ESNext` modules provides the best tree-shaking and smallest bundle sizes.'
    ],
    code: `// ── Recommended tsconfig-base.json ──
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "strict": true,            /* 👈 NEVER TURN THIS OFF */
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],        /* 👈 Alias mapping */
      "@data/*": ["src/data/*"]
    },
    "skipLibCheck": true,
    "moduleResolution": "bundler"
  }
}`
  },
  {
    id: 'ts_7',
    title: 'Project Execution: Type-safe Form Engine',
    badge: 'Project',
    badgeClass: 'badge-practice',
    content: [
      'In this task, you will build a generic Form component that uses TypeScript to enforce the shape of its inputs. The goal is to create a configuration-driven UI where the editor catches errors if the "name" of a field doesn\'t exist on the data model.',
      'You will use Generics, Mapped Types, and the `Partial` utility. You must also implement a "ValidationSchema" type that ensures every field has a corresponding validator function.',
      '**Studio Task**: Build the "JobTrackr" EditProfile form. It must take a `User` generic and ensure that any field you add (like "bio" or "website") is correctly typed on the submission payload.'
    ],
    code: `// ── Type-Safe Form Prototype ──
interface FormProps<T> {
  initialValues: T;
  onSubmit: (values: T) => void;
  // This ensures 'fields' only contains keys from T!
  fields: (keyof T)[];
}

function UniversalForm<T>({ initialValues, fields }: FormProps<T>) {
  // ... implementation ...
}

// Usage:
<UniversalForm<User> 
  initialValues={currentUser} 
  fields={["name", "email"]} // "wrong_field" would cause an error!
/>`
  },
  {
  id: 'ts_8',
  title: 'unknown vs any (Safe Typing)',
  badge: 'Core',
  badgeClass: 'badge-concept',
  content: [
    '`any` disables type checking completely, making your code unsafe. It should be avoided in most cases.',
    '`unknown` is a safer alternative. You must check the type before using it, which prevents runtime errors.',
    'Use `unknown` when dealing with external data like APIs.'
  ],
  code: `let value: unknown = "hello";

// ❌ Error
// value.toUpperCase();

// ✅ Safe narrowing
if (typeof value === "string") {
  console.log(value.toUpperCase());
}`
},
{
  id: 'ts_9',
  title: 'Literal Types & "as const"',
  badge: 'Advanced',
  badgeClass: 'badge-concept',
  content: [
    '`as const` tells TypeScript to treat values as exact literals instead of general types.',
    'This is useful for configs, action types, and preventing accidental mutations.',
    'It helps create more precise and predictable types.'
  ],
  code: `const roles = ["admin", "user"] as const;

// type Role = "admin" | "user"
type Role = typeof roles[number];

const config = {
  theme: "dark"
} as const;`
},
{
  id: 'ts_10',
  title: 'The "satisfies" Operator',
  badge: 'Expert',
  badgeClass: 'badge-concept',
  content: [
    '`satisfies` ensures an object matches a type without losing its inferred values.',
    'Unlike `as`, it does not override type checking — it validates while preserving precision.',
    'This is extremely useful in configs and large-scale applications.'
  ],
  code: `type Config = {
  mode: "dark" | "light";
};

const config = {
  mode: "dark",
  extra: true
} satisfies Config;

// ❌ Error: extra property not allowed`
}
];
