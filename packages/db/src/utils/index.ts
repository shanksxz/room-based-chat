import "dotenv/config";

console.log(process.env.DATABASE_URL);

export const getEnvVar = (name: string): string => {
	const value = process.env[name];
	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`);
	}
	return value;
};
