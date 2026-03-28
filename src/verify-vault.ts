import dotenv from 'dotenv';
import path from 'path';

// Load .env from the root of the server folder
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { getSecret, setSecret } from './config/vault.config';

async function verifyVault() {
    console.log('--- HashiCorp Vault Verification ---');
    console.log(`Vault Address: ${process.env.VAULT_ADDR || 'http://127.0.0.1:8200'}`);
    
    const testPath = 'secret/data/test-connection';
    const testData = {
        message: 'Hello from Dishcovery!',
        timestamp: new Date().toISOString(),
        secret_key: 'top-secret-value-123'
    };

    try {
        console.log('\n1. Attempting to WRITE a test secret...');
        await setSecret(testPath, testData);

        console.log('\n2. Attempting to READ the test secret...');
        const retrievedData = await getSecret(testPath);
        
        console.log('Retrieved Data:', retrievedData);

        if (retrievedData.secret_key === testData.secret_key) {
            console.log('\n✅ SUCCESS: Vault connection is working correctly!');
        } else {
            console.log('\n❌ FAILURE: Data mismatch!');
        }

    } catch (error: any) {
        console.error('\n❌ ERROR: Could not connect to Vault.');
        console.error('Make sure Vault is running (docker compose up -d vault) and the token is correct.');
        if (error.response) {
            console.error('Response Status:', error.response.statusCode);
            console.error('Response Body:', error.response.body);
        }
    }
}

verifyVault();
