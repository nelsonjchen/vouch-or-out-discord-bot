export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace
  Vouch: DurableObjectNamespace
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket
	//
	// Discord public key for verifying interactions
	DISCORD_PUBLIC_KEY: string;
	//
	DISCORD_APPLICATION_ID: string;
	//
	SKIP_DISCORD_VALIDATION: string;
}


export interface UserVouch {
	userId: string
	reason: string
}
