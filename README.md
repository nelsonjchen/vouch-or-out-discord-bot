# Vouch or Out Bot

*This is a one-off hack/hardcoded of a bot for a specific Discord server.*

A bot to vouch or out people in a Discord server on the `dummy` Discord server

It is designed to be serverless and run on Cloudflare Workers.

Vouches per user to be vouched are stored in Durable Objects.

Vouches can only come from other pre-vouched users.

People cannot self-vouch.

Users join a Discord server and can only see the rules and the general channel but cannot send messages.

Users who are vouched are given the "Vouched" role. This role allows them to interact with the rest of the server.

Keep it simple; 2 is the waterline.

