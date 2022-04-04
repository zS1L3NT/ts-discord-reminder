declare module NodeJS {
	interface ProcessEnv {
		readonly FIREBASE__SERVICE_ACCOUNT__PROJECT_ID: string
		readonly FIREBASE__SERVICE_ACCOUNT__PRIVATE_KEY: string
		readonly FIREBASE__SERVICE_ACCOUNT__CLIENT_EMAIL: string
		readonly FIREBASE__COLLECTION: string

		readonly DISCORD__TOKEN: string
		readonly DISCORD__BOT_ID: string
		readonly DISCORD__DEV_ID: string
	}
}