// Test script to diagnose JSON parsing issues

// First, let's try to parse the JSON manually
const testJson = `{
  "walletEns": "sattu",
  "walletAddress" : "0xf73b452fa361f3403b20a35c4650f69916c3271b",
  "projectId" : "024bb8ee-5729-40bf-9876-df4a15dd9024"
}`;

console.log("Test 1: Basic JSON parsing");
try {
  const parsed = JSON.parse(testJson);
  console.log("JSON parsed successfully:", parsed);
} catch (e) {
  console.error("JSON parse error:", e.message);
}

// Test with exactly the JSON from the failed request
console.log("\nTest 2: Check for common formatting issues");
const jsonVariations = [
  // Original without issues
  {
    name: "Clean JSON",
    json: `{
  "walletEns": "sattu",
  "walletAddress": "0xf73b452fa361f3403b20a35c4650f69916c3271b", 
  "projectId": "024bb8ee-5729-40bf-9876-df4a15dd9024"
}`
  },
  // With trailing comma
  {
    name: "Trailing comma",
    json: `{
  "walletEns": "sattu",
  "walletAddress": "0xf73b452fa361f3403b20a35c4650f69916c3271b",
  "projectId": "024bb8ee-5729-40bf-9876-df4a15dd9024",
}`
  },
  // With BOM
  {
    name: "With BOM",
    json: "\uFEFF" + `{
  "walletEns": "sattu",
  "walletAddress": "0xf73b452fa361f3403b20a35c4650f69916c3271b",
  "projectId": "024bb8ee-5729-40bf-9876-df4a15dd9024"
}`
  },
  // With extra characters at the end
  {
    name: "Extra character at end",
    json: `{
  "walletEns": "sattu",
  "walletAddress": "0xf73b452fa361f3403b20a35c4650f69916c3271b",
  "projectId": "024bb8ee-5729-40bf-9876-df4a15dd9024"
}ㅤ` // Invisible character
  },
  // With extra data
  {
    name: "Extra data",
    json: `{
  "walletEns": "sattu",
  "walletAddress": "0xf73b452fa361f3403b20a35c4650f69916c3271b",
  "projectId": "024bb8ee-5729-40bf-9876-df4a15dd9024"
}{"some":"extra"}`
  }
];

// Process each variation
jsonVariations.forEach(variation => {
  console.log(`\nTesting: ${variation.name} (length: ${variation.json.length})`);
  console.log("JSON (escaped):", JSON.stringify(variation.json));
  
  try {
    const parsed = JSON.parse(variation.json);
    console.log("✅ Parsed successfully");
  } catch (e) {
    console.log("❌ Parse error:", e.message);
    
    // If it's a position error, show context
    if (e.message.includes("position")) {
      const positionMatch = e.message.match(/position (\d+)/);
      if (positionMatch) {
        const position = parseInt(positionMatch[1]);
        const start = Math.max(0, position - 10);
        const end = Math.min(variation.json.length, position + 10);
        
        console.log("Context around error:");
        console.log(variation.json.substring(start, end));
        console.log(" ".repeat(position - start) + "^");
        
        // Show character code
        if (position < variation.json.length) {
          const charCode = variation.json.charCodeAt(position);
          console.log(`Character at position ${position}: Code ${charCode}, Hex 0x${charCode.toString(16)}`);
        }
      }
    }
  }
});

// Test 3: Attempt API call with known good JSON
console.log("\nTest 3: Making an API call with correct JSON");
const fetch = require('node-fetch');

async function testApiCall() {
  try {
    // Clean, well-formatted JSON with no trailing issues
    const payload = {
      walletEns: "sattu",
      walletAddress: "0xf73b452fa361f3403b20a35c4650f69916c3271b",
      projectId: "024bb8ee-5729-40bf-9876-df4a15dd9024"
    };
    
    // Make the API call
    const response = await fetch('http://localhost:3001/api/freelancer/bookmarks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    console.log("API response:", result);
  } catch (error) {
    console.error("API call error:", error);
  }
}

testApiCall(); 