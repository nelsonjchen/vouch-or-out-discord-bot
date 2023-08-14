/**
 * Share command metadata from a common spot to be used for both runtime
 * and registration.
 */
import {
	MessageComponentTypes
} from 'discord-interactions';

export const VOUCH_COMMAND = {
	name: 'vouch',
	description: 'Vouch for a user',
	"options": [
		{
			name: 'user',
			description: 'User to vouch for',
			type: MessageComponentTypes.USER_SELECT,
			required: 'true'
		},
		{
			name: 'reason',
			description: 'Reason for vouching',
			type: MessageComponentTypes.INPUT_TEXT,
			required: 'true'
		}
	]
};
