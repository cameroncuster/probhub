/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  safelist: [
    'bg-white', 'text-gray-800', 'bg-gray-50', 'bg-gray-100', 'text-gray-500', 'text-gray-600', 'text-gray-700',
    'bg-red-50', 'border-red-200', 'text-red-700', 'hover:text-red-600',
    'text-blue-600', 'hover:text-blue-800', 'hover:underline', 'hover:text-blue-600', 'bg-blue-600',
    'hover:text-green-600', 'border-gray-200', 'divide-gray-200'
  ],
  theme: {
    extend: {
      colors: {
        'newbie': '#cccccc',
        'pupil': '#77ff77',
        'specialist': '#77ddbb',
        'expert': '#aaaaff',
        'candidate-master': '#ff88ff',
        'master': '#ffcc88',
        'international-master': '#ffbb55',
        'grandmaster': '#ff7777',
        'international-grandmaster': '#ff3333',
        'legendary-grandmaster': '#aa0000',
      }
    },
  },
  plugins: [
    // Import plugins dynamically to avoid errors
    (function() { try { return require('@tailwindcss/forms'); } catch (e) { return {}; } })(),
    (function() { try { return require('@tailwindcss/typography'); } catch (e) { return {}; } })()
  ]
} 