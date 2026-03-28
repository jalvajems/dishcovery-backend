import vault from 'node-vault';

const vaultClient = vault({
    apiVersion: 'v1',
    endpoint: process.env.VAULT_ADDR || 'http://127.0.0.1:8200',
    token: process.env.VAULT_TOKEN || 'root',
});

/**
 * Fetches a secret from a specific path in Vault KV store (v2)
 * @param path The path to the secret (e.g., 'secret/data/dishcovery')
 */
export const getSecret = async (path: string) => {
    try {
        const result = await vaultClient.read(path);
        return result.data.data; // KV v2 stores data inside 'data.data'
    } catch (error) {
        console.error(`Error fetching secret from Vault path ${path}:`, error);
        throw error;
    }
};

/**
 * Writes a secret to a specific path in Vault KV store (v2)
 * @param path The path to the secret (e.g., 'secret/data/dishcovery')
 * @param data The secret data object
 */
export const setSecret = async (path: string, data: any) => {
    try {
        await vaultClient.write(path, { data });
        console.log(`Secret successfully written to Vault path: ${path}`);
    } catch (error) {
        console.error(`Error writing secret to Vault path ${path}:`, error);
        throw error;
    }
};

export default vaultClient;
