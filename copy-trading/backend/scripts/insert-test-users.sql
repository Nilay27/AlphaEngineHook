-- Insert test freelancer if not exists
INSERT INTO freelancer ("walletAddress", "walletEns", "freelancerName", "skills", "profilePicUrl")
SELECT 
  '0xf73b452fa361f3403b20a35c4650f69916c3271a', 
  'consentsam',
  'Test Freelancer',
  'JavaScript,React,Next.js',
  'https://ui-avatars.com/api/?name=Test+Freelancer'
WHERE NOT EXISTS (
  SELECT 1 FROM freelancer WHERE "walletAddress" = '0xf73b452fa361f3403b20a35c4650f69916c3271a'
);

-- Insert test company if not exists
INSERT INTO company ("walletAddress", "walletEns", "companyName", "shortDescription", "logoUrl")
SELECT
  '0xf73b452fa361f3403b20a35c4650f69916c3275a',
  'consentsam',
  'Test Company',
  'A test company for API testing',
  'https://ui-avatars.com/api/?name=Test+Company'
WHERE NOT EXISTS (
  SELECT 1 FROM company WHERE "walletAddress" = '0xf73b452fa361f3403b20a35c4650f69916c3275a'
); 