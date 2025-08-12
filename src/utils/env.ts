import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

const ssmClient = new SSMClient({ region: 'ap-northeast-1' });

async function getParameter(name: string): Promise<string> {
  const command = new GetParameterCommand({
    Name: `/trouble-production/${name}`,
    WithDecryption: true,
  });
  
  try {
    const response = await ssmClient.send(command);
    return response.Parameter?.Value || '';
  } catch (error) {
    console.error(`Error fetching parameter ${name}:`, error);
    throw error;
  }
}

export async function loadEnvironmentVariables() {
  const [
    databaseUrl,
    nextAuthSecret,
    openaiApiKey,
    nodeEnv,
  ] = await Promise.all([
    getParameter('DATABASE_URL'),
    getParameter('NEXTAUTH_SECRET'),
    getParameter('OPENAI_API_KEY'),
    getParameter('NODE_ENV'),
  ]);

  process.env.DATABASE_URL = databaseUrl;
  process.env.NEXTAUTH_SECRET = nextAuthSecret;
  process.env.OPENAI_API_KEY = openaiApiKey;
  process.env.NODE_ENV = nodeEnv;
  process.env.NEXTAUTH_URL = 'https://tppkhd4epb.ap-northeast-1.awsapprunner.com';
}