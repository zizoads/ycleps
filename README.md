# Yclep AI Product Analysis Platform

This project is a comprehensive implementation of Clean Architecture for a product analysis platform named Yclep. It is built with TypeScript, React, and utilizes a serverless-first approach designed for platforms like Vercel. The core feature is a sophisticated AI Orchestrator that manages multiple AI agents to perform detailed product analysis, with built-in resilience and failover capabilities.

## Project Architecture

The codebase is strictly organized following the principles of Clean Architecture to ensure separation of concerns, testability, and maintainability.

- **`src/domain`**: The core of the application. Contains business models, rules, and ports (interfaces). It has zero external dependencies.
- **`src/application`**: Implements the use cases defined in the domain layer. It contains the application-specific logic, including the AI Orchestrator and its agents. It depends on the domain layer.
- **`src/infrastructure`**: Provides concrete implementations for the ports defined in the domain layer. This includes database adapters (Postgres, In-Memory), AI provider clients, and other external services. It depends on the domain and application layers.
- **`src/api` (simulated)**: The entry point for external requests. In a true serverless setup, these would be individual functions. Here, they are simulated within the React application's `apiService` for demonstration.
- **`src/web`**: The frontend React application, which consumes the API.

## Core Features

- **Clean Architecture**: A robust and scalable project structure.
- **AI Orchestrator**: A "Mastermind" service that coordinates multiple AI agents for tasks like data scouting, SEO analysis, copywriting, and visual design.
- **Resilient AI Providers**: Abstracted AI providers (Gemini, Fallback) with configurable retry logic, exponential backoff, and automatic failover.
- **Asynchronous Job Processing**: Analysis tasks are run in the background, allowing for a non-blocking user experience.
- **Content Hub**: Generate and manage long-form articles and buying guides to support affiliate products.
- **Strategy Hub**: Utilize strategic AI agents like `Opportunity Hunter` and `Market Sentinel` to find new trends and ensure content freshness.
- **Interactive Terminal**: A diagnostic terminal within the dashboard to monitor and simulate system events.
- **Command Bar (`Ctrl+K`)**: A powerful, AI-driven command interface to navigate and operate the platform using natural language.
- **Modern Frontend**: A responsive UI built with React, TypeScript, and Tailwind CSS, featuring a dashboard and a public-facing site.
- **Database Agnostic**: Uses a repository pattern that can be backed by different databases (Postgres and In-Memory versions provided).

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Local Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd yclep-clean-architecture
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add the following variables.

    ```env
    # Your Google Gemini API Key
    API_KEY="your_gemini_api_key_here"

    # Password for the admin dashboard
    ADMIN_PASSWORD="your_secure_password"
    
    # (Optional) API key for a fallback AI provider
    FALLBACK_API_KEY="your_fallback_api_key"

    # (Optional) Sentry DSN for error logging
    SENTRY_DSN="your_sentry_dsn"
    ```
    *Note: In a standard Create React App, variables need a `REACT_APP_` prefix. However, this environment injects them directly, so we use the simpler names.*

4.  **Run the development server:**
    This project is designed to run from `index.html`. Use a simple live server extension in your IDE (like VS Code's Live Server) to open `index.html`.

## Project Structure Explained

- **Adding a new AI Agent**:
  1.  Create a new class in `src/application/ai-orchestrator/agents/`.
  2.  Implement its `run` method, crafting a detailed prompt for the Gemini API.
  3.  Integrate the agent into the `AiOrchestrator.ts` analysis pipeline.
  4.  Expose its functionality through the `apiService.ts` and connect it to the UI.

- **Adding a new Command Bar action**:
  1.  Define a new function tool in the `tools` array within `apiService.ts` in the `runCommand` function.
  2.  Implement the logic for that function.
  3.  The Gemini model will then be able to trigger this action based on user input in the Command Bar.
