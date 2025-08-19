# ESSENCES-X Session Generator

A web application that generates session IDs for ESSENCES-X BOT and sends them via WhatsApp.

## Features

- Generates unique session IDs with "EX-" prefix
- WhatsApp integration for sending session IDs
- Web interface similar to pairing.giftedtech.web.id
- 10-minute session validity
- Secure session verification system

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with the following content (optional):
```
PORT=3000
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Usage

1. Open the web application in your browser (default: http://localhost:3000)
2. Enter your WhatsApp number with country code
3. Click "Generate Session ID"
4. Check your WhatsApp for the session ID message

## Security

- Session IDs are valid for 10 minutes only
- All session IDs start with "EX-" prefix
- Secure verification system
- No session data persistence after expiry

## License

ESSENCES-X © 2025
