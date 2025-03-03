# Probhub - Programming Problems Hub

Probhub is a modern web application that provides a curated collection of programming problems from various competitive programming platforms. It helps users improve their coding skills, prepare for technical interviews, and master algorithmic thinking.

## Features

- **Dark Theme**: Modern dark theme with clean UI
- **Problem Listing**: Browse problems from Codeforces (with more platforms coming soon)
- **Advanced Filtering**: Filter problems by difficulty, tags, or search by name
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: SvelteKit, TypeScript
- **Styling**: CSS with custom variables for theming

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- pnpm (v6 or later)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/cameroncuster/probhub.git
   cd probhub
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Start the development server:

   ```bash
   pnpm dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Building for Production

To create a production build:

```bash
pnpm build
```

You can preview the production build with:

```bash
pnpm preview
```

## Project Structure

- `src/routes`: Page components and routes
- `src/lib`: Shared components and utilities
  - `src/lib/header`: Header component
  - `src/lib/services`: API services (e.g., Codeforces API)
- `static`: Static assets

## Future Plans

- Add support for more competitive programming platforms (LeetCode, HackerRank, AtCoder, etc.)
- Implement user accounts to track solved problems
- Add personalized problem recommendations
- Create discussion forums for each problem
- Add detailed statistics and analytics

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [SvelteKit](https://kit.svelte.dev/) for the framework
- All the competitive programmers who inspire this project
