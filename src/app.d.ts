// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}

	// Add environment variable types
	namespace NodeJS {
		interface ProcessEnv {
			PUBLIC_SUPABASE_URL: string;
			PUBLIC_SUPABASE_ANON_KEY: string;
		}
	}
}

// Add this to make TypeScript treat this file as a module
export {};
