import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { saveRecording, getUserRecordings, deleteRecording } from '../services/recordingsService';
import { createOrUpdateUserProfile, getUserProfile } from '../services/userService';

function DatabaseTest() {
  const { currentUser } = useAuth();
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recordings, setRecordings] = useState([]);

  const addResult = (message, success = true) => {
    const result = {
      message,
      success,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [...prev, result]);
    console.log(success ? '✅' : '❌', message);
  };

  const runTests = async () => {
    if (!currentUser) {
      addResult('Error: No user logged in', false);
      return;
    }

    setLoading(true);
    setTestResults([]);

    try {
      // Test 1: User Profile
      addResult('Test 1: Creating/Updating User Profile...');
      await createOrUpdateUserProfile(currentUser.uid, {
        email: currentUser.email,
        displayName: currentUser.displayName || 'Test User',
      });
      addResult('✓ User profile created/updated');

      // Test 2: Get User Profile
      addResult('Test 2: Fetching User Profile...');
      const profile = await getUserProfile(currentUser.uid);
      addResult(`✓ User profile fetched: ${profile?.email}`);

      // Test 3: Save Test Recording
      addResult('Test 3: Saving Test Recording...');
      const testRecording = {
        goal: 'Database Test Recording',
        transcript: 'This is a test transcript to verify database write operations.',
        transcriptPreview: 'This is a test transcript...',
        duration: 30,
        wordCount: 12,
        wpm: 24,
        score: 8.5,
        sessionId: `test-${Date.now()}`,
        feedback: {
          overall_score: 8.5,
          clarityScore: 85,
          confidenceScore: 80,
          engagementScore: 90,
          structureScore: 88,
          pace: 24,
          fillerWords: { um: 2, uh: 1 },
          aiSummary: 'Test recording performed well.',
          constructiveTip: 'Keep practicing!',
          strengths: ['Clear speech', 'Good pace'],
          improvements: ['Reduce filler words']
        }
      };

      const recordingId = await saveRecording(currentUser.uid, testRecording);
      addResult(`✓ Recording saved with ID: ${recordingId}`);

      // Test 4: Retrieve Recordings
      addResult('Test 4: Fetching User Recordings...');
      const userRecordings = await getUserRecordings(currentUser.uid, 10);
      setRecordings(userRecordings);
      addResult(`✓ Retrieved ${userRecordings.length} recordings`);

      // Test 5: Delete Test Recording (cleanup)
      addResult('Test 5: Deleting Test Recording (cleanup)...');
      if (recordingId) {
        await deleteRecording(currentUser.uid, recordingId);
        addResult('✓ Test recording deleted successfully');
      }

      addResult('🎉 All tests passed!', true);

    } catch (error) {
      addResult(`❌ Test failed: ${error.message}`, false);
      console.error('Test error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecordings = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      addResult('Fetching all recordings...');
      const userRecordings = await getUserRecordings(currentUser.uid, 50);
      setRecordings(userRecordings);
      addResult(`✓ Found ${userRecordings.length} recordings`);
    } catch (error) {
      addResult(`❌ Failed to fetch recordings: ${error.message}`, false);
    } finally {
      setLoading(false);
    }
  };

  const addSampleRecordings = async () => {
    if (!currentUser) {
      addResult('Error: No user logged in', false);
      return;
    }

    setLoading(true);
    setTestResults([]);

    const sampleRecordings = [
      {
        goal: 'Team Presentation on Q4 Goals',
        transcript: 'Good morning everyone. Today I want to discuss our quarterly objectives and key results for Q4. We have three main focus areas: customer acquisition, product development, and team growth. Let me walk you through each of these in detail. First, customer acquisition - we aim to increase our user base by 25% through targeted marketing campaigns and strategic partnerships. Second, product development will focus on releasing two major features that our customers have been requesting. Finally, team growth involves hiring five new team members across engineering and sales departments. I believe with focused effort and collaboration, we can achieve all these goals.',
        transcriptPreview: 'Good morning everyone. Today I want to discuss our quarterly objectives and key results for Q4...',
        duration: 85,
        wordCount: 120,
        wpm: 84,
        score: 8.7,
        sessionId: `sample-${Date.now()}-1`,
        feedback: {
          overall_score: 8.7,
          clarityScore: 90,
          confidenceScore: 88,
          engagementScore: 85,
          structureScore: 92,
          pace: 84,
          fillerWords: { um: 1, uh: 2, like: 1 },
          aiSummary: 'Excellent presentation with clear structure and strong delivery. You effectively communicated the three main objectives with specific, measurable goals.',
          constructiveTip: 'Consider adding more pauses between sections to let the audience digest each objective before moving to the next.',
          strengths: ['Clear structure', 'Specific goals', 'Confident delivery', 'Good pacing'],
          improvements: ['Add more pauses', 'Reduce filler words', 'Include audience questions']
        }
      },
      {
        goal: 'Product Demo for Investors',
        transcript: 'Thank you for joining today. I am excited to show you our innovative solution that solves a major problem in the industry. Our platform uses AI to automate repetitive tasks, saving companies an average of 20 hours per week. Let me demonstrate the key features. As you can see, the interface is intuitive and user-friendly. Users can get started in just minutes without any training. We currently have 500 active users and our revenue has grown 300% in the last quarter. Our competitive advantage lies in our proprietary algorithm and first-mover advantage in this niche market.',
        transcriptPreview: 'Thank you for joining today. I am excited to show you our innovative solution that solves...',
        duration: 72,
        wordCount: 105,
        wpm: 87,
        score: 9.1,
        sessionId: `sample-${Date.now()}-2`,
        feedback: {
          overall_score: 9.1,
          clarityScore: 95,
          confidenceScore: 92,
          engagementScore: 88,
          structureScore: 90,
          pace: 87,
          fillerWords: { um: 0, uh: 1 },
          aiSummary: 'Outstanding pitch with compelling data points and clear value proposition. Your confidence and enthusiasm were evident throughout.',
          constructiveTip: 'Include more specific customer success stories to make the impact more tangible for investors.',
          strengths: ['Strong data points', 'Clear value prop', 'Minimal filler words', 'Confident tone'],
          improvements: ['Add customer stories', 'Include market size', 'Address competition more directly']
        }
      },
      {
        goal: 'Training Session on New Software',
        transcript: 'Welcome to the training session. Today we will learn how to use the new project management software. Uh, first, let me show you how to create a new project. So, um, you click on this button here, and then, like, you fill in the project details. The interface is pretty straightforward, um, but there are some features that are a bit confusing at first. Let me, uh, demonstrate each feature one by one. So first we have the dashboard, then the task management section, and finally the reporting module. Any questions so far?',
        transcriptPreview: 'Welcome to the training session. Today we will learn how to use the new project management...',
        duration: 55,
        wordCount: 102,
        wpm: 111,
        score: 6.8,
        sessionId: `sample-${Date.now()}-3`,
        feedback: {
          overall_score: 6.8,
          clarityScore: 70,
          confidenceScore: 65,
          engagementScore: 72,
          structureScore: 75,
          pace: 111,
          fillerWords: { um: 5, uh: 3, like: 2, so: 3 },
          aiSummary: 'The training content was good, but delivery could be more polished. Too many filler words reduced clarity and confidence.',
          constructiveTip: 'Practice the demonstration beforehand to reduce filler words and speak more smoothly. Consider slowing down slightly.',
          strengths: ['Good structure', 'Asked for questions', 'Covered all features'],
          improvements: ['Reduce filler words significantly', 'Slow down pace', 'Practice more', 'Be more confident']
        }
      },
      {
        goal: 'Conference Keynote Speech',
        transcript: 'Good afternoon distinguished guests and fellow innovators. It is an honor to be here today to discuss the future of artificial intelligence and its transformative impact on our society. We stand at a pivotal moment in history. The decisions we make today will shape the next century of human progress. AI has the potential to solve our greatest challenges - from climate change to healthcare accessibility. But we must approach this technology with wisdom, ethics, and responsibility. Throughout my talk today, I will explore three critical questions: How can we harness AI for good? What safeguards must we implement? And how do we ensure equitable access to these powerful tools? Let us begin this important conversation.',
        transcriptPreview: 'Good afternoon distinguished guests and fellow innovators. It is an honor to be here today...',
        duration: 95,
        wordCount: 128,
        wpm: 81,
        score: 9.5,
        sessionId: `sample-${Date.now()}-4`,
        feedback: {
          overall_score: 9.5,
          clarityScore: 98,
          confidenceScore: 96,
          engagementScore: 95,
          structureScore: 97,
          pace: 81,
          fillerWords: {},
          aiSummary: 'Masterful keynote delivery with powerful rhetoric and clear vision. Your speech was inspiring, well-structured, and delivered with exceptional confidence.',
          constructiveTip: 'This was already excellent. Perhaps incorporate one personal anecdote to make the abstract concepts more relatable.',
          strengths: ['Zero filler words', 'Inspiring tone', 'Clear structure', 'Perfect pacing', 'Engaging opening'],
          improvements: ['Add personal story', 'Include visual examples']
        }
      },
      {
        goal: 'Weekly Team Standup',
        transcript: 'Hey team, good morning. So, um, I wanted to give you a quick update on my progress this week. I finished the user authentication feature and, like, it is now in testing. I also, uh, started working on the payment integration but ran into some issues with the API documentation. Um, I think I will need maybe another day or two to figure it out. For next week, my plan is to complete the payment integration and then move on to the notification system. Does anyone have any questions or need help with anything?',
        transcriptPreview: 'Hey team, good morning. So, um, I wanted to give you a quick update on my progress this week...',
        duration: 48,
        wordCount: 98,
        wpm: 122,
        score: 7.2,
        sessionId: `sample-${Date.now()}-5`,
        feedback: {
          overall_score: 7.2,
          clarityScore: 75,
          confidenceScore: 70,
          engagementScore: 78,
          structureScore: 80,
          pace: 122,
          fillerWords: { um: 3, uh: 2, like: 2, so: 1 },
          aiSummary: 'Solid standup update with all key information covered. The casual tone fits the context, but could be more concise.',
          constructiveTip: 'Reduce filler words and slow down slightly. Practice summarizing your updates more succinctly.',
          strengths: ['Covered all points', 'Acknowledged blockers', 'Offered help', 'Good structure'],
          improvements: ['Speak slower', 'Reduce filler words', 'Be more concise', 'Project more confidence']
        }
      }
    ];

    try {
      addResult('Adding sample recordings to database...');
      
      for (let i = 0; i < sampleRecordings.length; i++) {
        const recording = sampleRecordings[i];
        addResult(`Saving recording ${i + 1}/5: ${recording.goal}`);
        await saveRecording(currentUser.uid, recording);
        // Small delay to avoid overwhelming Firestore
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      addResult(`✅ Successfully added ${sampleRecordings.length} sample recordings!`);
      
      // Refresh the recordings list
      await fetchRecordings();

    } catch (error) {
      addResult(`❌ Failed to add sample recordings: ${error.message}`, false);
      console.error('Error adding samples:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Database Test Page</h1>
        <p style={{ color: '#ff6b6b' }}>⚠️ Please log in to test database operations</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto', fontFamily: 'system-ui' }}>
      <h1 style={{ marginBottom: '10px' }}>🧪 Database Test Suite</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Testing Firestore read/write operations for user: <strong>{currentUser.email}</strong>
      </p>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <button
          onClick={runTests}
          disabled={loading}
          style={{
            padding: '12px 24px',
            background: loading ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '600'
          }}
        >
          {loading ? 'Running Tests...' : 'Run All Tests'}
        </button>

        <button
          onClick={fetchRecordings}
          disabled={loading}
          style={{
            padding: '12px 24px',
            background: loading ? '#ccc' : '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '600'
          }}
        >
          Fetch All Recordings
        </button>

        <button
          onClick={addSampleRecordings}
          disabled={loading}
          style={{
            padding: '12px 24px',
            background: loading ? '#ccc' : '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '600'
          }}
        >
          Add 5 Sample Recordings
        </button>
      </div>

      {testResults.length > 0 && (
        <div style={{
          background: '#f5f5f5',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <h2 style={{ marginTop: 0 }}>Test Results:</h2>
          <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>
            {testResults.map((result, idx) => (
              <div
                key={idx}
                style={{
                  padding: '8px',
                  marginBottom: '5px',
                  background: result.success ? '#e8f5e9' : '#ffebee',
                  borderLeft: `4px solid ${result.success ? '#4CAF50' : '#f44336'}`,
                  borderRadius: '4px'
                }}
              >
                <span style={{ color: '#666', fontSize: '12px' }}>[{result.timestamp}]</span>{' '}
                {result.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {recordings.length > 0 && (
        <div>
          <h2>Recordings in Database ({recordings.length}):</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {recordings.map((recording, idx) => (
              <div
                key={recording.id}
                style={{
                  background: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '15px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <strong style={{ fontSize: '16px' }}>
                    {idx + 1}. {recording.goal || recording.speech_goal || 'Untitled'}
                  </strong>
                  <span style={{ color: '#666', fontSize: '14px' }}>
                    Score: {recording.score?.toFixed(1) || recording.overall_score?.toFixed(1) || 'N/A'}/10
                  </span>
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                  📝 {recording.wordCount || recording.word_count || 0} words • ⏱️ {recording.duration || recording.duration_seconds || 0}s • 🎯 {recording.wpm || recording.words_per_minute || 0} WPM
                </div>
                <div style={{ fontSize: '13px', color: '#999' }}>
                  {recording.transcriptPreview || recording.transcript_preview || 'No preview'}
                </div>
                <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                  ID: {recording.id} • Created: {recording.timestamp ? new Date(recording.timestamp).toLocaleString() : (recording.created_at?.seconds ? new Date(recording.created_at.seconds * 1000).toLocaleString() : 'Unknown')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DatabaseTest;
