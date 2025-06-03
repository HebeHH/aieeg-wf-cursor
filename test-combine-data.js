const fs = require('fs');
const path = require('path');

console.log('🧪 Testing data combination logic...');

try {
  // Load data files
  const singleListPath = path.join(process.cwd(), 'public', 'aiengdata', 'singleList.json');
  const websitePath = path.join(process.cwd(), 'public', 'aiengdata', 'website.json');

  console.log('📁 Loading data files...');
  const singleListData = JSON.parse(fs.readFileSync(singleListPath, 'utf8'));
  const websiteData = JSON.parse(fs.readFileSync(websitePath, 'utf8'));

  console.log(`✅ Loaded ${singleListData.length} sessions from singleList.json`);
  console.log(`✅ Loaded ${websiteData.sessions.length} sessions from website.json`);
  console.log(`✅ Loaded ${websiteData.speakers.length} speakers from website.json`);
  console.log(`✅ Loaded ${websiteData.rooms.length} rooms from website.json`);

  // Test session matching
  console.log('\n🔍 Testing session matching...');
  let matchedSessions = 0;
  let unmatchedSessions = [];

  for (const singleSession of singleListData) {
    const websiteSession = websiteData.sessions.find(ws => ws.id === singleSession["Session ID"]);
    if (websiteSession) {
      matchedSessions++;
    } else {
      unmatchedSessions.push(singleSession["Session ID"]);
    }
  }

  console.log(`✅ Matched ${matchedSessions} sessions`);
  console.log(`⚠️  Unmatched sessions: ${unmatchedSessions.length}`);
  
  if (unmatchedSessions.length > 0) {
    console.log('First 5 unmatched session IDs:', unmatchedSessions.slice(0, 5));
  }

  // Test data structure
  console.log('\n🔍 Testing data structures...');
  
  // Check first singleList item
  const firstSingle = singleListData[0];
  console.log('First singleList item keys:', Object.keys(firstSingle));
  
  // Check first website session
  const firstWebsite = websiteData.sessions[0];
  console.log('First website session keys:', Object.keys(firstWebsite));
  
  // Check first speaker
  const firstSpeaker = websiteData.speakers[0];
  console.log('First speaker keys:', Object.keys(firstSpeaker));

  console.log('\n✅ Data combination test completed successfully!');
  console.log('📝 The script should be able to combine this data correctly.');

} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
} 