# Vouch or Out Bot

A bot to vouch or out people in a Discord server.

It is designed to be serverless and run on Cloudflare Workers.

Vouches are stored in Cloudflare D1.

After every vouch or de-vouch, the bot will update the user's roles to match the vouches.

Vouches can only come from other people in the server.

People cannot self-vouch.

If someone has been on the server for a week and has not been vouched, they will be kicked. They can join back and try again, but this helps to keep the list of users manageable.

Administrators are exempt from vouches.

Some people can be pre-vouched, so they don't need to be vouched by anyone else.

Users join a Discord server The only channel they can see is the "vouching" channel as all other channels are hidden from them.

They cannot see anything at all.

Users who are vouched are given the "Vouched" role. This role allows them to see the rest of the server.

Keep it simple; 2 is the waterline.

## Database Table Design

The database table is called `vouches`.

The table has the following schema:

```sql
CREATE TABLE vouches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  vouched_by_user_id TEXT NOT NULL,
  vouch_reason TEXT,
  vouch_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, vouched_by_user_id)
);
```

## Command Outputs

### /vouch

To only

* If the user is already vouched, then the bot will respond with:
	* `User has already vouched by you.`
* If the user is not vouched, then the bot will respond with:
  * `User has been vouched by you.`
* If the user has met the vouch threshold, then the bot will respond with:
  * `User has been vouched by you.`
	* `User has met requirements has been given the Vouched role.`

### Bot Invite Command

https://discord.com/api/oauth2/authorize?client_id=1135397438207828070&permissions=2415921152&scope=bot%20applications.commands
