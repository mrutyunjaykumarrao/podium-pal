# 🧪 Testing Your Database Integration

## ✅ Quick Test Checklist

### **Prerequisites**

- [ ] Firebase Firestore enabled
- [ ] Firebase Storage enabled (can skip for now)
- [ ] Security Rules configured
- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:5173

---

## 🔍 **Test 1: Check Firebase Console Setup**

1. Go to https://console.firebase.google.com
2. Select your project
3. Check **Firestore Database**:
   - Should see "Cloud Firestore" enabled
   - Should be in test mode or have security rules
4. Check **Storage**:
   - Can skip for now (audio upload disabled)

---

## 🔍 **Test 2: Check Services Are Imported**

Open browser console (F12) and check for errors. You should see:

```
[App] 🚀 Version: 3.0.0-NAVIGATE-FIX
```

No import errors should appear.

---

## 🔍 **Test 3: Create a Recording**

1. **Start Backend**:

   ```bash
   cd backend
   uvicorn main:app --reload
   ```

2. **Start Frontend**:

   ```bash
   cd frontend
   npm run dev
   ```

3. **Record a Speech**:

   - Login to your app
   - Enter a goal: "Test database integration"
   - Click Record
   - Speak for 10-15 seconds
   - Click Stop

4. **Check Browser Console** for these logs:
   ```
   [App] 📤 sendForAnalysis called
   [App] Goal: Test database integration
   [App] 🌐 Sending request to backend
   [App] ✅ Analysis response received
   [App] 💾 Preparing to save recording with data
   [App] 🔒 Saving recording to Firebase BEFORE navigation...
   [RecordingsService] Saving recording for user: [your-user-id]
   [RecordingsService] ✓ Recording saved with ID: [document-id]
   [App] ✅ Recording saved successfully to Firebase
   ```

---

## 🔍 **Test 4: Verify Data in Firestore**

1. Open **Firebase Console** → **Firestore Database**

2. You should see these collections:

   **Collection: `users`**

   ```
   ✓ Document ID: [your-user-id]
   ✓ Fields:
     - user_id: string
     - email: string
     - display_name: string
     - created_at: timestamp
     - preferred_ai_personality: "supportive"
     - total_recordings: 0
   ```

   **Collection: `recordings`**

   ```
   ✓ Document ID: [auto-generated]
   ✓ Fields:
     - user_id: string (matches your user ID)
     - session_id: string
     - created_at: timestamp
     - transcript_text: string (your speech)
     - speech_goal: string
     - duration_seconds: number
     - word_count: number
     - words_per_minute: number
     - overall_score: number (0-10)
     - clarity_score: number (0-100)
     - confidence_score: number (0-100)
     - engagement_score: number (0-100)
     - structure_score: number (0-100)
     - filler_words: object
     - filler_words_count: number
     - ai_summary: string
     - constructive_tip: string
     - strengths: array
     - improvements: array
     - audio_file_path: null (no audio stored)
     - isPinned: false
   ```

---

## 🔍 **Test 5: Verify Recording History Loads**

1. Refresh the page (F5)
2. Wait for page to load
3. Check browser console:
   ```
   [App] Loading recordings from Firebase for user: [your-user-id]
   [RecordingsService] Fetching recordings for user: [your-user-id]
   [RecordingsService] ✓ Fetched X recordings
   [App] ✓ Loaded X recordings
   ```
4. Your recording should appear in "Recent Recordings" section

---

## 🔍 **Test 6: Test Pin/Unpin**

1. Click the pin button (📍) on a recording
2. Check console:
   ```
   [App] Toggling pin for recording: [id] to true
   [RecordingsService] Updating pin status: [id] true
   [RecordingsService] ✓ Pin status updated
   [App] ✓ Pin status updated
   ```
3. Recording should move to top with 📌 icon
4. Check Firestore → recordings → Your document:
   - `isPinned: true`

---

## 🔍 **Test 7: Test Delete**

1. Click delete button (🗑️) on a recording
2. Check console:
   ```
   [App] Deleting recording: [id]
   [RecordingsService] Deleting recording: [id]
   [RecordingsService] ✓ Recording deleted
   [App] ✓ Recording deleted
   ```
3. Recording disappears from list
4. Check Firestore → recordings:
   - Document should be deleted

---

## 🔍 **Test 8: Test Click to View Feedback**

1. Click on a recording in history
2. Should navigate to `/feedback/[session-id]`
3. Feedback report should display with scores

---

## ✅ **Success Criteria**

Your database integration is working if:

- ✅ No console errors about Firebase
- ✅ User profile created in `users` collection
- ✅ Recording saved to `recordings` collection
- ✅ All fields populated correctly (except `audio_file_path` = null)
- ✅ Recordings load on page refresh
- ✅ Pin/unpin works and updates Firestore
- ✅ Delete removes document from Firestore
- ✅ Click recording navigates to feedback page

---

## 🐛 **Common Issues**

### Issue: "Missing or insufficient permissions"

**Check:**

1. Firestore Security Rules published?
2. User logged in? (`currentUser` exists?)
3. User ID matches document `user_id`?

**Fix:** Go to Firebase Console → Firestore → Rules → Check rules are published

---

### Issue: "RecordingsService is not defined"

**Check:**

1. File exists: `frontend/src/services/recordingsService.js`?
2. Import in App.jsx correct?

**Fix:** Verify import path:

```javascript
import {
  saveRecording,
  getUserRecordings,
} from "./services/recordingsService";
```

---

### Issue: "Cannot read properties of undefined (reading 'uid')"

**Check:**

1. User logged in?
2. `currentUser` available?

**Fix:** Make sure you're logged in before testing

---

### Issue: Recordings not appearing after refresh

**Check:**

1. Browser console for errors
2. Firestore for data
3. `getUserRecordings` being called?

**Fix:** Check `useEffect` dependency array includes `currentUser`

---

## 📊 **What's Being Tested**

| Feature         | What It Tests        | Expected Result                     |
| --------------- | -------------------- | ----------------------------------- |
| User Profile    | User creation/update | Document in `users` collection      |
| Save Recording  | Firestore write      | Document in `recordings` collection |
| Load Recordings | Firestore read       | Data fetched and displayed          |
| Pin/Unpin       | Firestore update     | `isPinned` field updated            |
| Delete          | Firestore delete     | Document removed                    |
| Navigation      | Session linking      | Feedback page loads                 |

---

## 🎯 **Quick Verification Commands**

Open browser console (F12) and run:

```javascript
// Check if services are loaded
console.log("Services loaded:", {
  saveRecording: typeof saveRecording,
  getUserRecordings: typeof getUserRecordings,
  currentUser: !!currentUser,
});

// Check user ID
console.log("Current User ID:", currentUser?.uid);

// Manually fetch recordings
import("./services/recordingsService").then(
  ({ getUserRecordings }) => {
    getUserRecordings("YOUR_USER_ID", 10).then(
      (recordings) => {
        console.log("Recordings:", recordings);
      }
    );
  }
);
```

---

## ✨ **What's NOT Being Tested** (Intentionally Skipped)

- ❌ Audio file upload to Firebase Storage
- ❌ Audio file deletion from Storage
- ❌ Audio playback from Storage URLs

These are disabled for now as requested. Audio is only sent to backend for analysis, not stored in Firebase.

---

## 🚀 **Next Steps After Tests Pass**

1. **Add Progress Dashboard** - Show user statistics over time
2. **Add Search/Filter** - Search recordings by text/date
3. **Enable Audio Storage** - When ready, uncomment audio upload code
4. **Add Export** - Download recordings as CSV
5. **Production Security Rules** - Tighten security before deployment

---

## 💡 **Pro Tips**

1. **Keep Firebase Console Open** - Real-time verification of data
2. **Watch Browser Console** - All services log extensively
3. **Test in Incognito** - Verify with fresh user
4. **Use Firebase Emulator** - Test without affecting production data

---

## 📞 **If Tests Fail**

1. Check browser console for detailed error messages
2. Check Firebase Console → Firestore for data
3. Verify security rules are correct and published
4. Make sure user is logged in (`currentUser` exists)
5. Check backend is running and responding

---

**🎉 If all tests pass, your database integration is working perfectly!**
