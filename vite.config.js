import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    define: {
      'import.meta.env.NFT_WALLET_ADDRESS': JSON.stringify(env.NFT_WALLET_ADDRESS),
      'import.meta.env.NFT_OPENSEA_API_KEY': JSON.stringify(env.NFT_OPENSEA_API_KEY),
      'import.meta.env.NFT_FILTER_KEYWORDS': JSON.stringify(env.NFT_FILTER_KEYWORDS),
    }
  }
})
