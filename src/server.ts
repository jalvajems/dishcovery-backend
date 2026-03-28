import { loadVaultSecrets } from "./config/env.config";

(async () => {
    try {
        // 1. Wait for Vault to finish injecting into process.env & the env object
        await loadVaultSecrets();

        // 2. NOW we dynamically import the rest of the application!
        // This ensures synchronous imports in dependencies (like Stripe, AWS SDK) 
        // will receive the completed 'env' payload rather than crashing as 'undefined'.
        await import('./bootstrap');

    } catch (error) {
        console.error("Fatal Application Startup Error:", error);
        process.exit(1);
    }
})();
