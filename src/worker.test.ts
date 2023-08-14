import { unstable_dev } from "wrangler"
import type { UnstableDevWorker } from "wrangler"
import { describe, expect, it, beforeAll, afterAll } from "vitest"
import {
	InteractionResponseType,
	InteractionType,
	verifyKey,
} from 'discord-interactions';

describe("Worker", () => {
	let worker: UnstableDevWorker

	beforeAll(async () => {
		worker = await unstable_dev("src/worker.ts", {
			experimental: { disableExperimentalWarning: true },
			vars: {
				SKIP_DISCORD_VALIDATION: "true",
			},
		});
	});

	afterAll(async () => {
		await worker.stop()
	})

	it("should respond to a ping", async () => {
		const response = await worker.fetch("/", {
			method: "POST",
			body: JSON.stringify({
				type: InteractionType.PING,
			}),
		})
		expect(response.status).toEqual(200)
		const json = await response.json()
		expect(json).toEqual({
			type: InteractionResponseType.PONG,
		})
	})
})
