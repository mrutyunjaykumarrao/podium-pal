# Team Workflow & Task Division Guide

## 🔀 Branch Strategy

### Three-Tier Branch System
1. **`main`** - Production-ready code only (final integration)
2. **`develop`** - Testing/integration branch (everyone works from here) ✅
3. **Personal branches** - Individual development branches

### Branch Hierarchy:
```
main (production)
  ↑
develop (testing/integration) ← Everyone clones from here
  ↑
├── mrutyunjay (personal branch)
├── reddi7 (personal branch)
├── hamees (personal branch)
└── nischay (personal branch)
```

### Personal Branches (Created from develop)
- `mrutyunjay` - Your working branch ✅
- Team members should create:
  - `reddi7` - For reddi7's work
  - `hamees` - For HameesMuhammed's work
  - `nischay` - For Nischay23's work

### How Team Members Should Start:
```bash
# 1. Clone the repository
git clone https://github.com/mrutyunjaykumarrao/podium-pal.git
cd podium-pal

# 2. Switch to develop branch (this is your base!)
git checkout develop

# 3. Create their personal branch from develop
git checkout -b their-name

# 4. Push their branch
git push -u origin their-name

# 5. Start working!
```

---

## 🎯 Recommended Task Division (No Conflicts!)

### Option 1: **Feature-Based Division** (RECOMMENDED)

#### **Person 1: Frontend UI/UX Developer**
**Files to own:**
- `frontend/src/App.css`
- `frontend/src/index.css`
- `frontend/src/components/TranscriptDisplay.css`
- `frontend/src/components/FeedbackReport.css`

**Tasks:**
- Polish the UI design and styling
- Add animations and transitions
- Improve responsive design
- Add loading states and error messages
- Create better visual feedback for recording states

**Won't touch:** Backend files, main logic files

---

#### **Person 2: Frontend Logic & Speech API**
**Files to own:**
- `frontend/src/App.jsx` (speech recognition logic)
- `frontend/src/components/TranscriptDisplay.jsx`

**Tasks:**
- Enhance Web Speech API integration
- Add error handling for speech recognition
- Implement pause/resume functionality
- Add speech timing/duration tracking
- Improve interim vs final transcript handling
- Add microphone permission checks

**Won't touch:** Backend files, CSS styling files, FeedbackReport component

---

#### **Person 3: Backend Analysis & Metrics**
**Files to own:**
- `backend/main.py` (calculate_metrics function)

**Tasks:**
- Implement accurate WPM calculation
- Enhance filler word detection (add more filler words)
- Add speech pattern analysis
- Calculate actual speaking time vs pauses
- Detect speaking pace variations
- Add confidence scoring for speech recognition

**Won't touch:** Frontend files, LLM integration code

---

#### **Person 4: Backend AI/LLM Integration**
**Files to own:**
- `backend/main.py` (get_llm_feedback function)
- `backend/.env` (API key management)

**Tasks:**
- Integrate Google Gemini API
- Craft effective prompts for clarity scoring
- Implement AI summary generation
- Generate constructive feedback tips
- Add fallback for API failures
- Optimize API calls for speed

**Won't touch:** Frontend files, metrics calculation code

---

### Option 2: **Component-Based Division**

#### **Person 1: Transcript & Recording Component**
- `frontend/src/components/TranscriptDisplay.jsx`
- `frontend/src/components/TranscriptDisplay.css`
- Recording logic in `App.jsx` (coordinate with Person 2)

#### **Person 2: Feedback & Results Component**
- `frontend/src/components/FeedbackReport.jsx`
- `frontend/src/components/FeedbackReport.css`
- Display logic in `App.jsx`

#### **Person 3: Backend Core Logic**
- `backend/main.py` - Metrics calculation
- API endpoint optimization

#### **Person 4: Backend AI Integration**
- `backend/main.py` - LLM integration
- Prompt engineering and AI logic

---

### Option 3: **Full-Stack Mini-Features**

#### **Person 1: Pace Analysis Feature**
- Frontend: Display pace meter/gauge
- Backend: Calculate and categorize pace (too slow/perfect/too fast)
- Add visual indicators for pace

#### **Person 2: Filler Words Feature**
- Frontend: Highlight filler words in transcript
- Backend: Enhanced filler word detection
- Add filler word frequency chart

#### **Person 3: Clarity Score Feature**
- Frontend: Beautiful clarity score display with progress animation
- Backend: LLM-based clarity scoring
- Add clarity improvement suggestions

#### **Person 4: Polish & Integration**
- Connect all features
- Error handling across the app
- Testing and bug fixes
- Documentation and demo prep

---

## 🛡️ Conflict Prevention Rules

### 1. **File Ownership**
- Each person "owns" specific files
- Don't edit someone else's owned files without discussion
- Use comments like `// TODO: @username - integrate with your component`

### 2. **Communication Protocol**
```bash
# Before starting work on a new day:
git checkout develop
git pull origin develop
git checkout your-name
git merge develop  # Get latest changes from integration branch

# After finishing work:
git add .
git commit -m "Clear description of what you did"
git push origin your-name

# When feature is ready:
# Create PR: your-name → develop (NOT to main!)
```

### 3. **Pull Request Guidelines**
- Create PR: `your-name` → `develop` (NOT to main!)
- PR title: `[Your-Name] Feature: Description`
- Tag team members for review
- Merge `develop` into your branch before creating PR
- At least one person reviews before merging
- **Final step:** When `develop` is stable → create PR: `develop` → `main`

### 4. **Daily Sync**
- Quick 5-min standup: What I did, what I'm doing, any blockers
- Share which files you'll be working on
- Pull latest `develop` and merge into personal branches daily
- Test on `develop` branch before final merge to `main`

### 5. **Integration Points**
For places where code needs to connect:

**Frontend ↔ Backend API:**
- Stick to the API contract in `PLAN.md`
- Backend person: Don't change endpoint structure without notice
- Frontend person: Don't change request/response format

**Component Integration:**
- Use props clearly documented with comments
- Define interfaces before implementing

---

## 📋 Quick Decision Checklist

**Which division should you choose?**

✅ **Choose Option 1 (Feature-Based)** if:
- Team has mixed frontend/backend skills
- Want clear separation of concerns
- 4 people on team

✅ **Choose Option 2 (Component-Based)** if:
- Everyone is comfortable with full stack
- Want to own entire components
- 3-4 people on team

✅ **Choose Option 3 (Full-Stack Features)** if:
- Want everyone to experience both frontend and backend
- Have 4 people who want end-to-end ownership
- Time is limited and need parallel work

---

## 🚀 Recommended Workflow for 36-Hour Hackathon

### Hours 1-12: Individual Development
- Everyone works on their assigned files
- Minimal coordination needed
- Focus on implementation

### Hours 13-24: Integration Phase
- Start merging branches
- Resolve any conflicts together
- Test integrated features

### Hours 25-32: Polish & Testing
- UI/UX improvements
- Bug fixes
- Performance optimization

### Hours 33-36: Demo Preparation
- Create demo script
- Practice presentation
- Final bug fixes
- Deploy if needed

---

## 🤔 Questions for Your Team

1. **What are each person's strengths?**
   - Who's best at frontend styling?
   - Who's experienced with React?
   - Who knows Python/FastAPI well?
   - Who's worked with LLMs before?

2. **What division feels most comfortable?**
   - Feature-based (Option 1)?
   - Component-based (Option 2)?
   - Full-stack features (Option 3)?

3. **Who wants to work on what?**
   - UI/Styling?
   - Speech API?
   - Backend metrics?
   - AI integration?

4. **Communication preference?**
   - Slack/Discord for quick questions?
   - GitHub issues for feature tracking?
   - Daily sync calls?

---

## 💡 Pro Tips

1. **Commit Often** - Small, frequent commits are better than large ones
2. **Clear Commit Messages** - "Added filler word detection" not "updated code"
3. **Test Before Pushing** - Run the app to make sure it works
4. **Document As You Go** - Add comments explaining your code
5. **Ask Early** - If stuck, ask the team immediately, don't wait

---

**Your branch `mrutyunjay` is ready! Time to divide and conquer! 🎯**
