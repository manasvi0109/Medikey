# MediKey - Healthcare Management System

MediKey is a comprehensive healthcare management system that allows users to store and manage their medical records, track health metrics, schedule appointments, and communicate with healthcare providers.

## Features

- **User Authentication**: Secure login and registration system
- **Medical Records Management**: Upload and manage medical documents
- **Health Metrics Tracking**: Monitor vital signs and health indicators
- **Appointment Scheduling**: Book and manage healthcare appointments
- **Family Member Management**: Add and manage family members' health information
- **AI-Powered Health Assistant**: Get insights and answers to health questions
- **Smartwatch Integration**: Connect with Bluetooth smartwatches for health data

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (configurable)
- **Authentication**: Session-based authentication
- **AI Integration**: OpenAI API

## Deployment

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database (optional, can use in-memory storage for testing)
- OpenAI API key (for AI features)

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL=postgres://username:password@localhost:5432/medivault
SESSION_SECRET=your-session-secret
OPENAI_API_KEY=your-openai-api-key
```

### Deployment Options

#### Local Deployment

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the application: `npm run build`
4. Start the server: `npm start`

#### Render Deployment

1. Fork this repository to your GitHub account
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Use the following settings:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. Add the required environment variables
6. Deploy the application

#### Heroku Deployment

1. Create a Heroku account and install the Heroku CLI
2. Login to Heroku: `heroku login`
3. Create a new Heroku app: `heroku create medivault-app`
4. Add PostgreSQL addon: `heroku addons:create heroku-postgresql:hobby-dev`
5. Set environment variables:
   ```
   heroku config:set SESSION_SECRET=your-session-secret
   heroku config:set OPENAI_API_KEY=your-openai-api-key
   ```
6. Deploy the application: `git push heroku main`

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open [http://localhost:5000](http://localhost:5000) in your browser

## License

MIT
