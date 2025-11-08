# Firebase Setup Instructions

## Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Name it "podium-pal" or your preferred name
4. Follow the setup wizard (disable Google Analytics if not needed)

## Step 2: Enable Authentication

1. In Firebase Console, go to **Build > Authentication**
2. Click "Get Started"
3. Enable these sign-in methods:
   - **Email/Password** - Toggle ON
   - **Google** - Toggle ON (you'll need to provide a support email)

## Step 3: Enable Firestore Database

1. In Firebase Console, go to **Build > Firestore Database**
2. Click "Create database"
3. Start in **test mode** (we'll secure it later)
4. Choose a location closest to your users

## Step 4: Get Firebase Config

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click the **Web** icon (`</>`)
4. Register app with nickname "podium-pal-web"
5. Copy the Firebase configuration object
6. Create `.env.local` in the `frontend` directory with these values:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Step 5: Update Firestore Rules (After Testing)

Once everything works, update Firestore Security Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /recordings/{recordingId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

## Step 6: Install Dependencies

Run in the `frontend` directory:
```bash
npm install firebase
```

## Step 7: Backend Firebase Admin Setup

1. In Firebase Console, go to **Project Settings > Service Accounts**
2. Click "Generate new private key"
3. Save the JSON file as `backend/firebase-admin-key.json`
4. Add to `backend/.env`:
```env
FIREBASE_ADMIN_KEY_PATH=firebase-admin-key.json
```

5. Install Firebase Admin SDK:
```bash
pip install firebase-admin
```

## Security Notes

- Never commit `firebase-admin-key.json` to git
- Add it to `.gitignore`
- Never commit `.env` or `.env.local` files
- Use environment variables in production

## Firestore Data Structure

```
users/{userId}/
  - email: string
  - displayName: string
  - createdAt: timestamp
  - totalRecordings: number
  - averageScore: number
  
  recordings/{recordingId}/
    - transcript: string
    - userGoal: string
    - duration: number
    - pace: number
    - fillerWords: map
    - clarityScore: number
    - confidenceScore: number
    - engagementScore: number
    - structureScore: number
    - overall_score: number
    - aiSummary: string
    - constructiveTip: string
    - strengths: array
    - improvements: array
    - timestamp: timestamp
    - improvementFromPrevious: number (calculated)
```
