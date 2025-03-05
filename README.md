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
- **Database**: Supabase (PostgreSQL)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- pnpm (v6 or later)
- Supabase account and project

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

3. Set up environment variables:

   Create a `.env` file in the root directory with the following variables:

   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the database migration script to populate the database with initial problems:

   ```bash
   pnpm tsx scripts/migrate-problems.ts
   ```

5. Start the development server:

   ```bash
   pnpm dev
   ```

6. Open your browser and navigate to `http://localhost:5173`

### Database Setup

The application uses Supabase as its database. The schema is defined in `supabase.session.sql`. You need to:

1. Create a Supabase project
2. Run the SQL commands in `supabase.session.sql` to create the necessary tables
3. Set up the environment variables as described above
4. Run the migration script to populate the database with initial problems

## Building for Production

To create a production build:

```bash
pnpm build
```

You can preview the production build with:

```bash
pnpm preview
```

## Continuous Integration

This project uses GitHub Actions for continuous integration. The workflow automatically runs on push to main/master branches and on pull requests:

- Linting with Prettier to ensure code formatting standards
- Type checking with Svelte Check
- Building the project to catch any build errors

You can view the workflow configuration in `.github/workflows/ci.yml`.

## Project Structure

- `src/routes`: Page components and routes
- `src/lib`: Shared components and utilities
  - `src/lib/header`: Header component
  - `src/lib/services`: API services (e.g., Codeforces API, database)
- `static`: Static assets
- `scripts`: Utility scripts (e.g., database migration)

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
- [Supabase](https://supabase.com/) for the database
- All the competitive programmers who inspire this project
