import { P } from "vitest/dist/reporters-2ff87305";
import { Env, UserVouch } from "./types";

// Durable Object to track User Vouches for a user

export class Vouches {
	state: DurableObjectState
	constructor(state: DurableObjectState, env: Env) {
		this.state = state
	}

	async fetch(request: Request): Promise<Response> {
		// Get the list of vouches for this user
		if (request.method === "GET") {
			const vouches = await this.state.storage.get<UserVouch[]>("vouches")
			return new Response(
				JSON.stringify({
					vouches,
					message: "Vouches retrieved successfully",
				})
				, { status: 200 })
			// Add a vouch, making sure it doesn't already exist
		} else if (request.method === "POST") {
			// Add a vouch, making sure it doesn't already exist
			const body: UserVouch = await request.json()
			const vouches = await this.state.storage.get<UserVouch[]>("vouches") || []
			if (vouches.find(v => v.userId === body.userId)) {
				return new Response(
					JSON.stringify(
						{
							vouches,
							message: "Vouch not added",
							error: "User already vouched"
						}
					)
					, { status: 400 })
			}
			vouches.push(body)
			await this.state.storage.put("vouches", vouches)
			// Return the list of vouches
			return new Response(JSON.stringify(
				{
					vouches,
					message: "Vouch added successfully",
				}
			), { status: 200 })
		} else if (request.method === "DELETE") {
			// Delete a vouch
			const body: UserVouch = await request.json()
			const vouches = await this.state.storage.get<UserVouch[]>("vouches") || []
			const newVouches = vouches.filter(v => v.userId !== body.userId)
			await this.state.storage.put("vouches", newVouches)
			// Return the list of vouches
			return new Response(
				JSON.stringify(
					{
						vouches: newVouches,
						message: "Vouch deleted successfully",
					}
				),
				{ status: 200 })
		}
		return new Response(
			JSON.stringify(
				{
					vouches: [],
					message: "Method not allowed",
				}),
			{ status: 405 })
	}
}
