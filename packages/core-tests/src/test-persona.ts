import { Client, Config, Defaults } from '@dxos/client';
import { Persona } from 'has-needs-schemas';

const runTest = async () => {
  console.log('Starting DXOS client initialization test...');
  const client = new Client({
    config: new Config(Defaults()),
  });

  try {
    await client.initialize();
    console.log('DXOS Client initialized successfully.');
  } catch (error) {
    console.error('Error initializing DXOS Client:', error);
  }

  await client.destroy();
  console.log('DXOS Client destroyed.');
};

runTest().catch(console.error);
