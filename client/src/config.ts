// Configuration for different environments

interface Config {
  apiBaseUrl: string;
}

// Local development configuration
const devConfig: Config = {
  apiBaseUrl: 'http://localhost:5000/api',
};

// Production configuration - update this with your deployed backend URL
const prodConfig: Config = {
  apiBaseUrl: 'https://medikey.vercel.app/api', // Vercel deployment URL
};

// GitHub Pages configuration - update this with your deployed backend URL
const githubPagesConfig: Config = {
  apiBaseUrl: 'https://medikey.vercel.app/api', // Vercel deployment URL
};

// Vercel configuration
const vercelConfig: Config = {
  apiBaseUrl: '/api', // When frontend and backend are on the same domain
};

// Determine which configuration to use based on the environment
const isGitHubPages = window.location.hostname.includes('github.io');
const isVercel = window.location.hostname.includes('vercel.app');
const isProd = process.env.NODE_ENV === 'production';

let config: Config;

if (isGitHubPages) {
  config = githubPagesConfig;
} else if (isVercel) {
  config = vercelConfig;
} else if (isProd) {
  config = prodConfig;
} else {
  config = devConfig;
}

export default config;
