/**
 * Share command metadata from a common spot to be used for both runtime
 * and registration.
 */

export const VOUCH_COMMAND = {
	name: 'vouch',
	description: 'Vouch for a user',
	"options": [
		{
			name: 'user',
			description: 'User to vouch for',
			type: 6,
			required: 'true'
		},
		{
			name: 'reason',
			description: 'Reason for vouching',
			type: 3,
			required: 'true'
		}
	]
};
