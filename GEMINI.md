# Project Overview

This is a Next.js project that visualizes a 3D globe using React Three Fiber. It features a rotating globe with grid lines and scattered interactive points, rendered with custom shaders for visual effects.

**Main Technologies:**

*   Next.js
*   React
*   React Three Fiber (`@react-three/fiber`)
*   Three.js (`three`)
*   `@react-three/drei`
*   TypeScript
*   Tailwind CSS (inferred from dependencies)

# Building and Running

To build, run, and develop this project, use the following commands:

*   **Install Dependencies:**
    ```bash
    npm install
    # or yarn install
    # or pnpm install
    ```

*   **Run in Development Mode:**
    ```bash
    npm run dev
    ```

*   **Build for Production:**
    ```bash
    npm run build
    ```

*   **Start Production Server:**
    ```bash
    npm run start
    ```

*   **Run Linter:**
    ```bash
    npm run lint
    ```

# Development Conventions

*   **Language:** TypeScript is used throughout the project.
*   **Styling:** Tailwind CSS is used for styling components.
*   **Component Structure:** React components are organized within the `components` directory, with UI components under `components/ui`.
*   **3D Rendering:** 3D elements are rendered using React Three Fiber, with `Globe.tsx` being the primary 3D scene component.
