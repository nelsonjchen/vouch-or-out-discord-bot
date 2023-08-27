/**
 * The core server that runs on a Cloudflare worker.
 */

import { Router } from 'itty-router';
import {
	InteractionResponseType,
	InteractionType,
	verifyKey,
} from 'discord-interactions';
import { VOUCH_COMMAND } from './commands.js';
import { InteractionResponseFlags } from 'discord-interactions';
import { Env, UserVouch, VouchCommandInteraction, VouchesDto } from './types.js';
export { Vouches } from './durable.js';

const VOUCHED_ROLE_ID = '1137973458672820224'

class JsonResponse extends Response {
	constructor(body: object, init?: ResponseInit) {
		const jsonBody = JSON.stringify(body);
		init = init || {
			headers: {
				'content-type': 'application/json;charset=UTF-8',
			},
		};
		super(jsonBody, init);
	}
}

const router = Router();

/**
 * A simple :wave: hello page to verify the worker is working.
 */
router.get('/', (request: Request, env: Env) => {
	return new Response(`👋 Hi, I'm ${env.DISCORD_APPLICATION_ID}`);
});

/**
 * Main route for all requests sent from Discord.  All incoming messages will
 * include a JSON payload described here:
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 */
router.post('/', async (request: Request, env: Env) => {
	const { isValid, interaction } = (await server.verifyDiscordRequest(
		request,
		env,
	)) as { isValid: boolean, interaction?: VouchCommandInteraction };

	if (!isValid || !interaction) {
		return new Response('Bad request signature.', { status: 401 });
	}

	if (interaction.type === InteractionType.PING) {
		// The `PING` message is used during the initial webhook handshake, and is
		// required to configure the webhook in the developer portal.
		return new JsonResponse({
			type: InteractionResponseType.PONG,
		});
	}

	if (interaction.type === InteractionType.APPLICATION_COMMAND) {
		// Most user commands will come as `APPLICATION_COMMAND`.
		switch (interaction.data.name.toLowerCase()) {
			case VOUCH_COMMAND.name.toLowerCase(): {
				// Check if the "member"/user who sent the interaction is in the right role
				const correctRole = interaction.member.roles.find(
					(role: any) => role === VOUCHED_ROLE_ID,
				);

				// If the user doesn't have the role, return an error
				if (!correctRole) {
					return new JsonResponse({
						type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
						data: {
							content: "I'm sorry, you must be vouched for to use this command.",
							flags: InteractionResponseFlags.EPHEMERAL,
						},
					});
				}
				// You can't vouch for yourself
				if (interaction.member.user.id === interaction.data.options[0].value) {
					return new JsonResponse({
						type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
						data: {
							content: "I'm sorry, you can't vouch for yourself.",
							flags: InteractionResponseFlags.EPHEMERAL,
						},
					});
				}

				const userVoucher = interaction.member.user.id

				// Retrieve the vouch'd for durableobject
				const userVouch = {
					userId: interaction.data.options[0].value,
					reason: interaction.data.options[1].value,
				}

				// Send the vouch to the durable object

				const doId = env.VOUCHES.idFromName(userVouch.userId)
				const doStub = env.VOUCHES.get(doId)

				const doResp = await doStub.fetch(
					new Request("http://dummy", {
						method: "POST", body: JSON.stringify(
							userVouch
						)
					})
				)

				// Try to parse the response as JSON
				const vouchesResp = await doResp.json() as VouchesDto

				// Check if the vouch was successful
				if (vouchesResp.error) {
					return new JsonResponse({
						type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
						data: {
							content: `I'm sorry, I couldn't vouch that user for you. Please try again later.`,
							flags: InteractionResponseFlags.EPHEMERAL,
						},
					});
				}


				if (vouchesResp.vouches.length < 2) {
					return new JsonResponse({
						type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
						data: {
							// Username has vouch
							content: `<@${userVouch.userId}> has been vouched for by <@${userVoucher}>. They need one more vouch to be added to the vouched role.`,
						},
					});
				}

				// If the vouch is beyond the limit, add the role
				// Adding vouch role to target user
				// Post to Discord API
				const discordResponse = await fetch(
					`https://discord.com/api/v8/guilds/${interaction.guild_id}/members/${userVouch.userId}/roles/${VOUCHED_ROLE_ID}`,
					{
						method: 'PUT',
						headers: {
							Authorization: `Bot ${env.DISCORD_TOKEN}`,
						},
					},
				);

				// Check if the role was added successfully
				if (discordResponse.status != 204) {
					return new JsonResponse({
						type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
						data: {
							content: "I'm sorry, I couldn't vouch that user for you. Please try again later.",
							flags: InteractionResponseFlags.EPHEMERAL,
						},
					});
				}

				// If the role was added successfully, return a success message

				return new JsonResponse({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						content: `<@${userVouch.userId}> has been vouched for by <@${userVoucher}>. They have been added to the vouched role.`,
					},
				});
			}

			default:
				return new JsonResponse({ error: 'Unknown Type' }, { status: 400 });
		}
	}

	console.error('Unknown Type');
	return new JsonResponse({ error: 'Unknown Type' }, { status: 400 });
});

router.all('*', () => new Response('Not Found.', { status: 404 }));

async function verifyDiscordRequest(request: Request, env: Env): Promise<
	{ interaction?: any, isValid: boolean }> {
	const signature = request.headers.get('x-signature-ed25519');
	const timestamp = request.headers.get('x-signature-timestamp');
	const body = await request.text();
	const isValidRequest =
		signature &&
		timestamp &&
		verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY);

	if (!(env.SKIP_DISCORD_VALIDATION == "true") && !isValidRequest) {
		return { isValid: false };
	}

	return { interaction: JSON.parse(body), isValid: true };
}

const server = {
	verifyDiscordRequest: verifyDiscordRequest,
	fetch: async function (request: Request, env: Env, ctx: ExecutionContext) {
		return router.handle(request, env);
	},
};

export default server;
