import { PrismaClient } from '@prisma/client';
import { randomBytes, scryptSync } from 'node:crypto';

const prisma = new PrismaClient();

function hashPassword(pw: string): string {
  const s = randomBytes(16);
  return `${s.toString('hex')}:${scryptSync(pw, s, 32).toString('hex')}`;
}

const DEMO_PASSWORD = hashPassword('FPSDemo123!');

async function main() {
  console.log('🌱 Seeding FPS Hub database...');

  // School settings
  await prisma.schoolSettings.upsert({
    where: { id: 'school' },
    update: {},
    create: { id: 'school', name: 'FPS' },
  });

  // Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@fps.edu' },
    update: {},
    create: {
      email: 'admin@fps.edu',
      username: 'admin',
      passwordHash: DEMO_PASSWORD,
      role: 'ADMIN',
      displayName: 'Admin',
      bio: 'School administrator',
      grade: '',
      interests: 'Administration, Technology',
    },
  });

  // Teacher users
  const teacher1 = await prisma.user.upsert({
    where: { email: 'sarah.johnson@fps.edu' },
    update: {},
    create: {
      email: 'sarah.johnson@fps.edu',
      username: 'sarah_johnson',
      passwordHash: DEMO_PASSWORD,
      role: 'TEACHER',
      displayName: 'Sarah Johnson',
      bio: 'Computer Science teacher passionate about coding and robotics.',
      grade: '',
      interests: 'Programming, Robotics, AI',
    },
  });
  await prisma.teacherProfile.upsert({
    where: { userId: teacher1.id },
    update: {},
    create: { userId: teacher1.id },
  });

  const teacher2 = await prisma.user.upsert({
    where: { email: 'mike.chen@fps.edu' },
    update: {},
    create: {
      email: 'mike.chen@fps.edu',
      username: 'mike_chen',
      passwordHash: DEMO_PASSWORD,
      role: 'TEACHER',
      displayName: 'Mike Chen',
      bio: 'Math and Physics teacher. Science Olympiad coach.',
      grade: '',
      interests: 'Mathematics, Physics, Science competitions',
    },
  });
  await prisma.teacherProfile.upsert({
    where: { userId: teacher2.id },
    update: {},
    create: { userId: teacher2.id },
  });

  // Student users
  const students = [
    { email: 'alex.kim@fps.edu', username: 'alex_kim', name: 'Alex Kim', grade: 'Grade 11', bio: 'Full-stack developer in the making. Robotics club captain.', interests: 'Programming, Robotics, Mathematics' },
    { email: 'priya.sharma@fps.edu', username: 'priya_sharma', name: 'Priya Sharma', grade: 'Grade 12', bio: 'Debate champion and aspiring lawyer. Love writing and public speaking.', interests: 'Debate, Writing, Law, History' },
    { email: 'omar.hassan@fps.edu', username: 'omar_hassan', name: 'Omar Hassan', grade: 'Grade 10', bio: 'Passionate about chemistry and environmental science.', interests: 'Chemistry, Biology, Environment' },
    { email: 'zara.lee@fps.edu', username: 'zara_lee', name: 'Zara Lee', grade: 'Grade 11', bio: 'Artist and chess player. Thinking outside the box.', interests: 'Art, Chess, Design, Photography' },
    { email: 'david.park@fps.edu', username: 'david_park', name: 'David Park', grade: 'Grade 12', bio: 'Math olympiad finalist. Chess club member. Future engineer.', interests: 'Mathematics, Chess, Engineering, Physics' },
    { email: 'sofia.rivera@fps.edu', username: 'sofia_rivera', name: 'Sofia Rivera', grade: 'Grade 10', bio: 'Science fair winner two years running. Biology enthusiast.', interests: 'Biology, Research, Environmental science' },
    { email: 'james.wilson@fps.edu', username: 'james_wilson', name: 'James Wilson', grade: 'Grade 11', bio: 'Programming and game dev. Building my first indie game.', interests: 'Game development, Programming, Music' },
    { email: 'aisha.patel@fps.edu', username: 'aisha_patel', name: 'Aisha Patel', grade: 'Grade 12', bio: 'Robotics engineer and startup founder in progress.', interests: 'Robotics, Entrepreneurship, AI, Design' },
    { email: 'lucas.brown@fps.edu', username: 'lucas_brown', name: 'Lucas Brown', grade: 'Grade 9', bio: 'New to FPS but already making waves in debate.', interests: 'Debate, Literature, Photography' },
    { email: 'maya.nguyen@fps.edu', username: 'maya_nguyen', name: 'Maya Nguyen', grade: 'Grade 11', bio: 'Chemistry Olympiad. Aspiring materials scientist.', interests: 'Chemistry, Physics, Research, Tennis' },
    { email: 'ethan.moore@fps.edu', username: 'ethan_moore', name: 'Ethan Moore', grade: 'Grade 12', bio: 'Built 3 web apps, won 2 hackathons. Code is my canvas.', interests: 'Web development, Hackathons, Open source' },
    { email: 'lila.garcia@fps.edu', username: 'lila_garcia', name: 'Lila Garcia', grade: 'Grade 10', bio: 'Creative writer and drama club lead. Stage is life.', interests: 'Drama, Creative writing, Literature, Music' },
  ];

  const createdStudents: { id: string; displayName: string }[] = [];
  for (const s of students) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email,
        username: s.username,
        passwordHash: DEMO_PASSWORD,
        role: 'STUDENT',
        displayName: s.name,
        bio: s.bio,
        grade: s.grade,
        interests: s.interests,
      },
    });
    await prisma.studentProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });
    createdStudents.push(user);
  }

  const [alex, priya, omar, zara, david, sofia, james, aisha, lucas, maya, ethan, lila] = createdStudents as [
    typeof createdStudents[0], typeof createdStudents[0], typeof createdStudents[0],
    typeof createdStudents[0], typeof createdStudents[0], typeof createdStudents[0],
    typeof createdStudents[0], typeof createdStudents[0], typeof createdStudents[0],
    typeof createdStudents[0], typeof createdStudents[0], typeof createdStudents[0],
  ];

  // Clubs
  const clubDefs = [
    { slug: 'robotics', name: 'Robotics Club', emoji: '🤖', desc: 'Building the future, one robot at a time. We compete in international robotics competitions.', leaderId: alex.id },
    { slug: 'debate', name: 'Debate Society', emoji: '🎤', desc: 'Sharpening critical thinking through structured argumentation. Regional champions 3 years running.', leaderId: priya.id },
    { slug: 'programming', name: 'Programming Club', emoji: '💻', desc: 'Code, build, ship. From web apps to game dev, we cover it all.', leaderId: ethan.id },
    { slug: 'chess', name: 'Chess Club', emoji: '♟️', desc: 'Strategy, patience, and creativity. All levels welcome.', leaderId: david.id },
    { slug: 'science', name: 'Science Society', emoji: '🔬', desc: 'Exploring the boundaries of knowledge through experiments and research.', leaderId: sofia.id },
    { slug: 'drama', name: 'Drama Club', emoji: '🎭', desc: 'Where stories come alive. We perform two full productions per year.', leaderId: lila.id },
    { slug: 'math-olympiad', name: 'Math Olympiad', emoji: '📐', desc: 'Problem solving at the highest level. Preparing for national and international competitions.', leaderId: david.id },
  ];

  const createdClubs: Record<string, { id: string }> = {};
  for (const c of clubDefs) {
    const club = await prisma.club.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        slug: c.slug,
        name: c.name,
        description: c.desc,
        iconEmoji: c.emoji,
        leaderId: c.leaderId,
        joinOpen: true,
      },
    });
    createdClubs[c.slug] = club;
  }

  // Club memberships
  const memberships = [
    { clubSlug: 'robotics', members: [alex.id, aisha.id, james.id, teacher1.id] },
    { clubSlug: 'debate', members: [priya.id, lucas.id, lila.id, teacher2.id] },
    { clubSlug: 'programming', members: [ethan.id, alex.id, james.id, omar.id] },
    { clubSlug: 'chess', members: [david.id, zara.id, maya.id] },
    { clubSlug: 'science', members: [sofia.id, omar.id, maya.id, teacher2.id] },
    { clubSlug: 'drama', members: [lila.id, priya.id, zara.id] },
    { clubSlug: 'math-olympiad', members: [david.id, maya.id, ethan.id, teacher2.id] },
  ];

  for (const m of memberships) {
    const clubId = createdClubs[m.clubSlug]!.id;
    for (const userId of m.members) {
      await prisma.clubMember.upsert({
        where: { clubId_userId: { clubId, userId } },
        update: {},
        create: { clubId, userId, role: 'MEMBER' },
      });
    }
  }

  // Follows
  const followPairs = [
    [alex.id, priya.id], [alex.id, ethan.id], [alex.id, aisha.id],
    [priya.id, alex.id], [priya.id, david.id], [priya.id, lila.id],
    [omar.id, sofia.id], [omar.id, maya.id],
    [ethan.id, alex.id], [ethan.id, james.id], [ethan.id, aisha.id],
    [david.id, maya.id], [david.id, ethan.id],
    [sofia.id, omar.id], [sofia.id, maya.id],
    [james.id, ethan.id], [james.id, alex.id],
    [aisha.id, alex.id], [aisha.id, ethan.id], [aisha.id, teacher1.id],
    [lucas.id, priya.id], [lucas.id, lila.id],
    [maya.id, sofia.id], [maya.id, david.id], [maya.id, omar.id],
    [lila.id, priya.id], [lila.id, zara.id],
    [zara.id, lila.id], [zara.id, david.id],
  ];

  for (const [followerId, followingId] of followPairs) {
    await prisma.follow.upsert({
      where: { followerId_followingId: { followerId: followerId!, followingId: followingId! } },
      update: {},
      create: { followerId: followerId!, followingId: followingId! },
    });
  }

  // Posts
  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400_000);

  const postsData = [
    { authorId: alex.id, body: '🤖 Just finished our robot\'s autonomous navigation module! After 3 weeks of debugging, it can now map a room and avoid obstacles in real time. The key was implementing a better sensor fusion algorithm.\n\n#robotics #programming #autonomoussystems', category: 'PROJECT' as const, clubId: createdClubs['robotics']!.id, createdAt: daysAgo(1) },
    { authorId: priya.id, body: 'Competed at the Regional Debate Championship this weekend. We placed 2nd overall! The motion was "This house believes that social media does more harm than good" — I was on proposition.\n\nSo proud of our team! Next stop: nationals 🏆\n\n#debate #championship #proud', category: 'ACHIEVEMENT' as const, createdAt: daysAgo(2) },
    { authorId: ethan.id, body: 'Just deployed my first full-stack app to production! Built with Next.js + PostgreSQL, it tracks study sessions and shows productivity analytics.\n\nLinks in bio. Would love feedback from fellow devs 💻\n\n#webdev #nextjs #programming #buildinpublic', category: 'PROJECT' as const, clubId: createdClubs['programming']!.id, createdAt: daysAgo(3) },
    { authorId: sofia.id, body: 'Won 1st place at the Regional Science Fair! My project on microplastic filtration using biopolymers was selected for the national competition 🎉\n\nThank you to everyone who supported my research. Special shoutout to Mr. Chen for all the guidance!\n\n#sciencefair #research #biology #winning', category: 'ACHIEVEMENT' as const, clubId: createdClubs['science']!.id, createdAt: daysAgo(4) },
    { authorId: david.id, body: 'Qualified for the National Math Olympiad! 🏅\n\nHonestly didn\'t expect this — the qualifying exam had some brutal combinatorics problems. Spent 3 months doing daily problem sets. Hard work pays off.\n\n#math #olympiad #mathcomp #achievement', category: 'ACHIEVEMENT' as const, clubId: createdClubs['math-olympiad']!.id, createdAt: daysAgo(5) },
    { authorId: maya.id, body: 'Anyone else finding organic chemistry simultaneously fascinating and terrifying? 😅\n\nI\'ve been building a visual reaction map to help me study. Drop your best studying strategies for chem below!\n\n#chemistry #studytips #question', category: 'QUESTION' as const, createdAt: daysAgo(6) },
    { authorId: james.id, body: 'Game dev progress update: my 2D platformer now has a full level editor!\n\nBuilt it entirely in vanilla JavaScript + Canvas API. No game engine, just raw code. It\'s taught me so much about algorithms and data structures.\n\n#gamedev #javascript #buildinpublic #programming', category: 'PROJECT' as const, clubId: createdClubs['programming']!.id, createdAt: daysAgo(7) },
    { authorId: aisha.id, body: 'Just submitted our robotics team\'s proposal for the Innovation Challenge! We\'re building a robot that assists students with physical disabilities to navigate the school.\n\nProof that technology can make a real difference 🦾\n\n#robotics #inclusion #innovation #impact', category: 'PROJECT' as const, clubId: createdClubs['robotics']!.id, createdAt: daysAgo(8) },
    { authorId: omar.id, body: 'Excited to share my extended essay topic: "The thermodynamic feasibility of carbon capture using metal-organic frameworks"\n\nIf anyone is doing research in chemistry/environmental science, I\'d love to connect and exchange ideas!\n\n#chemistry #research #environmentalscience', category: 'GENERAL' as const, clubId: createdClubs['science']!.id, createdAt: daysAgo(9) },
    { authorId: lila.id, body: 'Drama Club\'s production of "The Crucible" is coming together beautifully 🎭\n\nWe open in 3 weeks. Tickets are free for students! Come support your classmates.\n\n#drama #theatre #thecrucible', category: 'EVENT' as const, clubId: createdClubs['drama']!.id, createdAt: daysAgo(10) },
    { authorId: teacher1.id, body: 'Proud of our Programming Club members who participated in the FPS Hackathon last weekend!\n\n12 projects submitted in 24 hours. The creativity and technical skill on display was incredible. Full results posted on the club page 🏆', category: 'ACHIEVEMENT' as const, clubId: createdClubs['programming']!.id, createdAt: daysAgo(11) },
    { authorId: zara.id, body: 'Finished my art portfolio for university applications! 18 pieces, 2 years of work.\n\nArt is the only language that speaks without words. Chess and art are surprisingly similar — both are about seeing patterns others miss.\n\n#art #portfolio #chess #creativity', category: 'ACHIEVEMENT' as const, createdAt: daysAgo(12) },
    { authorId: lucas.id, body: 'First week at FPS complete! The debate team is incredible — I\'ve already learned more in one week than in a semester at my old school.\n\nShoutout to Priya for showing me the ropes 🙏\n\n#newkid #debate #fps #community', category: 'GENERAL' as const, createdAt: daysAgo(13) },
    { authorId: teacher2.id, body: 'Congratulations to our Science Olympiad team! 🥇\n\nWe placed 3rd nationally in the chemistry lab event. These students worked incredibly hard for months. FPS is proud of you all!\n\n#scienceolympiad #chemistry #nationals #proud', category: 'ACHIEVEMENT' as const, createdAt: daysAgo(14) },
    { authorId: alex.id, body: 'Open question for the community: what programming language should you learn first?\n\nMy take: Python for beginners (easy syntax, massive ecosystem), then JavaScript (web is everywhere), then whatever your interest points to.\n\nWhat do you think? 👇\n\n#programming #question #beginners #coding', category: 'QUESTION' as const, clubId: createdClubs['programming']!.id, createdAt: daysAgo(15) },
  ];

  const createdPosts: { id: string }[] = [];
  for (const p of postsData) {
    const post = await prisma.post.create({
      data: {
        authorId: p.authorId,
        body: p.body,
        category: p.category,
        clubId: p.clubId ?? null,
        hashtags: '[]',
        createdAt: p.createdAt,
      },
    });
    createdPosts.push(post);
  }

  const [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15] = createdPosts as [
    typeof createdPosts[0], typeof createdPosts[0], typeof createdPosts[0],
    typeof createdPosts[0], typeof createdPosts[0], typeof createdPosts[0],
    typeof createdPosts[0], typeof createdPosts[0], typeof createdPosts[0],
    typeof createdPosts[0], typeof createdPosts[0], typeof createdPosts[0],
    typeof createdPosts[0], typeof createdPosts[0], typeof createdPosts[0],
  ];

  // Likes
  const likePairs = [
    [priya.id, p1.id], [ethan.id, p1.id], [aisha.id, p1.id], [teacher1.id, p1.id],
    [alex.id, p2.id], [david.id, p2.id], [lila.id, p2.id], [lucas.id, p2.id],
    [alex.id, p3.id], [james.id, p3.id], [aisha.id, p3.id], [priya.id, p3.id],
    [omar.id, p4.id], [maya.id, p4.id], [teacher2.id, p4.id], [alex.id, p4.id],
    [maya.id, p5.id], [ethan.id, p5.id], [teacher2.id, p5.id],
    [sofia.id, p6.id], [omar.id, p6.id], [maya.id, p6.id],
    [ethan.id, p7.id], [alex.id, p7.id], [aisha.id, p7.id],
    [alex.id, p8.id], [teacher1.id, p8.id], [priya.id, p8.id],
    [sofia.id, p9.id], [maya.id, p9.id],
    [priya.id, p10.id], [zara.id, p10.id],
    [alex.id, p11.id], [ethan.id, p11.id], [james.id, p11.id],
    [priya.id, p12.id], [david.id, p12.id],
    [priya.id, p13.id], [lila.id, p13.id],
    [sofia.id, p14.id], [omar.id, p14.id], [maya.id, p14.id], [alex.id, p14.id],
    [priya.id, p15.id], [ethan.id, p15.id], [james.id, p15.id], [aisha.id, p15.id],
  ];

  for (const [userId, postId] of likePairs) {
    await prisma.like.upsert({
      where: { userId_postId: { userId: userId!, postId: postId! } },
      update: {},
      create: { userId: userId!, postId: postId! },
    });
  }

  // Bookmarks
  const bookmarkPairs = [
    [alex.id, p3.id], [alex.id, p4.id], [alex.id, p5.id],
    [priya.id, p1.id], [priya.id, p8.id],
    [ethan.id, p1.id], [ethan.id, p7.id],
    [david.id, p5.id], [david.id, p15.id],
    [omar.id, p6.id], [omar.id, p9.id],
  ];

  for (const [userId, postId] of bookmarkPairs) {
    await prisma.bookmark.upsert({
      where: { userId_postId: { userId: userId!, postId: postId! } },
      update: {},
      create: { userId: userId!, postId: postId! },
    });
  }

  // Comments
  const commentsData = [
    { postId: p1.id, authorId: priya.id, body: 'This is incredible! The autonomous navigation is something our debate society could actually use to understand AI policy better. Can you give a talk sometime?' },
    { postId: p1.id, authorId: ethan.id, body: 'Sensor fusion is genuinely hard. Did you use a Kalman filter or a more modern approach? Would love to see the code!' },
    { postId: p1.id, authorId: aisha.id, body: 'YES! This is exactly what we need for the inclusion robot project. We should collaborate 🤝' },
    { postId: p2.id, authorId: alex.id, body: 'Congratulations Priya!! You absolutely crushed it at the championship. So proud of you 🎉' },
    { postId: p2.id, authorId: lila.id, body: "REGIONAL CHAMPIONS!! Can't believe I missed it. Next one I'm coming to cheer you all on 📣" },
    { postId: p3.id, authorId: james.id, body: 'Just tried it — the analytics graphs are really clean. How did you handle the session persistence?' },
    { postId: p3.id, authorId: alex.id, body: 'Ship it! The dark mode looks especially good. Are you open-sourcing it?' },
    { postId: p4.id, authorId: teacher2.id, body: 'Sofia, your methodology was outstanding. I knew from the beginning this project had national potential. So well deserved!' },
    { postId: p4.id, authorId: omar.id, body: 'This is so inspiring! We should write a joint paper on biopolymer applications.' },
    { postId: p5.id, authorId: maya.id, body: 'The qualifying exam was brutal — I remember seeing you stare at problem 4 for 20 minutes then suddenly smile. You had it 😂 Congrats!!' },
    { postId: p6.id, authorId: sofia.id, body: 'For ochem, I draw every mechanism by hand multiple times. Repetition builds intuition.' },
    { postId: p6.id, authorId: omar.id, body: 'The reaction map idea is genius. Mind sharing a photo of yours?' },
    { postId: p7.id, authorId: ethan.id, body: "Canvas API level editor is no joke. This is real engineering. Would love to playtest when it's ready!" },
    { postId: p8.id, authorId: teacher1.id, body: 'Aisha, this proposal made me genuinely emotional. This is exactly why I became a CS teacher. Proud of you.' },
    { postId: p15.id, authorId: ethan.id, body: "Strongly agree on Python first. I wasted 6 months on Java before switching. Python's simplicity lets you focus on problem-solving." },
    { postId: p15.id, authorId: james.id, body: 'JavaScript from day 1 here — immediately seeing results in the browser was so motivating. But I get the Python argument.' },
  ];

  for (const c of commentsData) {
    await prisma.comment.create({ data: c });
  }

  // Achievements
  const achievementsData = [
    { userId: priya.id, title: 'Regional Debate Championship — 2nd Place', description: 'Competed against 24 schools in the regional debate championship.', category: 'Competition', date: daysAgo(2), status: 'VERIFIED' as const, issuer: 'FPS Debate Society', verifierId: teacher2.id },
    { userId: sofia.id, title: 'Regional Science Fair — 1st Place', description: 'Won first place for research on microplastic filtration using biopolymers.', category: 'Research', date: daysAgo(4), status: 'VERIFIED' as const, issuer: 'Regional Science Fair Committee', verifierId: teacher2.id, clubId: createdClubs['science']!.id },
    { userId: david.id, title: 'National Math Olympiad Qualifier', description: 'Qualified for the National Mathematics Olympiad by placing in the top 50.', category: 'Academic', date: daysAgo(5), status: 'VERIFIED' as const, issuer: 'National Math Competition Board', verifierId: teacher2.id, clubId: createdClubs['math-olympiad']!.id },
    { userId: ethan.id, title: 'FPS Hackathon — Best Technical Project', description: 'Won Best Technical Project award at the school hackathon.', category: 'Technology', date: daysAgo(11), status: 'VERIFIED' as const, issuer: 'FPS Programming Club', verifierId: teacher1.id, clubId: createdClubs['programming']!.id },
    { userId: alex.id, title: 'Robotics Regional Championship — Semi-finalist', description: 'Led the FPS robotics team to the semi-finals of the Regional Robotics Championship.', category: 'Technology', date: daysAgo(20), status: 'VERIFIED' as const, issuer: 'Regional Robotics League', verifierId: teacher1.id, clubId: createdClubs['robotics']!.id },
    { userId: aisha.id, title: 'Innovation Challenge Proposal — Selected', description: 'Proposal for an accessibility-focused robot selected for the Innovation Challenge final.', category: 'Technology', date: daysAgo(8), status: 'VERIFIED' as const, issuer: 'FPS Innovation Committee', verifierId: teacher1.id },
    { userId: maya.id, title: 'Chemistry Olympiad — Bronze Medal', description: 'Earned a bronze medal in the national Chemistry Olympiad.', category: 'Academic', date: daysAgo(30), status: 'VERIFIED' as const, issuer: 'National Chemistry Olympiad', verifierId: teacher2.id },
    { userId: omar.id, title: 'Extended Essay — Outstanding Achievement', description: 'Received the highest grade for extended essay on carbon capture chemistry.', category: 'Academic', date: daysAgo(45), status: 'VERIFIED' as const, issuer: 'FPS Academic Department' },
    { userId: zara.id, title: 'National Youth Art Competition — Finalist', description: 'Selected as a finalist in the National Youth Art Competition.', category: 'Arts', date: daysAgo(60), status: 'VERIFIED' as const, issuer: 'National Youth Arts Foundation' },
    { userId: james.id, title: 'Game Jam — 1st Place Solo Developer', description: 'Won first place in the 48-hour online game jam with a puzzle platformer.', category: 'Technology', date: daysAgo(25), status: 'VERIFIED' as const, issuer: 'itch.io Global Game Jam', verifierId: teacher1.id },
    { userId: lucas.id, title: 'Debate Club — Most Improved Speaker', description: 'Awarded Most Improved Speaker in first term at FPS debate society.', category: 'Leadership', date: daysAgo(3), status: 'VERIFIED' as const, issuer: 'FPS Debate Society', verifierId: teacher1.id },
    { userId: lila.id, title: 'Drama Lead — The Crucible', description: 'Cast as Abigail Williams in the school production of The Crucible.', category: 'Arts', date: daysAgo(15), status: 'PENDING' as const, issuer: 'FPS Drama Club' },
  ];

  for (const a of achievementsData) {
    await prisma.achievement.create({ data: a });
  }

  // Events
  const eventsData = [
    { title: 'Annual Robotics Showcase', description: 'See what our robotics team has been building all year! Live demos, Q&A, and prizes.', location: 'Main Hall', startsAt: new Date(now.getTime() + 7 * 86400_000), endsAt: new Date(now.getTime() + 7 * 86400_000 + 3 * 3600_000), clubId: createdClubs['robotics']!.id, organizer: teacher1.displayName },
    { title: 'Programming Club Hackathon', description: '24-hour hackathon open to all students. Form teams of 1-4, build something amazing.', location: 'CS Lab', startsAt: new Date(now.getTime() + 14 * 86400_000), endsAt: new Date(now.getTime() + 15 * 86400_000), clubId: createdClubs['programming']!.id, organizer: teacher1.displayName },
    { title: 'The Crucible — School Play', description: "Drama Club presents Arthur Miller's The Crucible. Free admission for all students.", location: 'School Auditorium', startsAt: new Date(now.getTime() + 21 * 86400_000), endsAt: new Date(now.getTime() + 21 * 86400_000 + 2 * 3600_000), clubId: createdClubs['drama']!.id, organizer: 'Drama Club' },
    { title: 'Science Fair Kick-off', description: 'Annual science fair project submission deadline and kick-off event. All students welcome.', location: 'Science Wing', startsAt: new Date(now.getTime() + 3 * 86400_000), endsAt: new Date(now.getTime() + 3 * 86400_000 + 2 * 3600_000), clubId: createdClubs['science']!.id, organizer: teacher2.displayName },
    { title: 'Chess Tournament', description: 'Inter-school chess tournament. Open to all skill levels. Prizes for top 3.', location: 'Library', startsAt: new Date(now.getTime() + 10 * 86400_000), endsAt: new Date(now.getTime() + 10 * 86400_000 + 4 * 3600_000), clubId: createdClubs['chess']!.id, organizer: david.displayName },
  ];

  const createdEvents: { id: string }[] = [];
  for (const e of eventsData) {
    const ev = await prisma.event.create({ data: e });
    createdEvents.push(ev);
  }

  // RSVPs — sort events by startsAt to match the original ordering
  const sortedEvents = await prisma.event.findMany({ orderBy: { startsAt: 'asc' } });
  if (sortedEvents[0]) {
    for (const userId of [alex.id, aisha.id, priya.id, ethan.id]) {
      await prisma.eventAttendee.upsert({
        where: { eventId_userId: { eventId: sortedEvents[0].id, userId } },
        update: {},
        create: { eventId: sortedEvents[0].id, userId, status: 'GOING' },
      });
    }
  }
  if (sortedEvents[1]) {
    for (const userId of [sofia.id, omar.id, maya.id, teacher2.id]) {
      await prisma.eventAttendee.upsert({
        where: { eventId_userId: { eventId: sortedEvents[1].id, userId } },
        update: {},
        create: { eventId: sortedEvents[1].id, userId, status: 'GOING' },
      });
    }
  }

  // Announcements
  const announcementsData = [
    { title: 'Mid-term Exam Schedule Published', content: 'The mid-term examination schedule is now available on the student portal. Please review your schedule carefully and contact your class teacher if you have any conflicts.\n\nExams run from October 14-18. Good luck to all students!', authorId: admin.id, schoolWide: true, important: true },
    { title: 'Science Fair Registration Open', content: 'Registration for the Annual Science Fair is now open! All students in Grades 9-12 are encouraged to participate.\n\nDeadline: 2 weeks from today. Submit your project proposal via the Events page.', authorId: teacher2.id, schoolWide: true, important: false },
    { title: 'New Robotics Equipment Arrived', content: 'We are excited to announce that the new LEGO Mindstorms EV3 sets and Raspberry Pi kits have arrived! Club members can book time in the lab starting this week.', authorId: teacher1.id, schoolWide: false, important: false },
    { title: 'Cafeteria Menu Update', content: 'Starting next week, the school cafeteria will offer expanded vegetarian and vegan options. Full menu will be posted at the cafeteria entrance.', authorId: admin.id, schoolWide: true, important: false },
    { title: 'Programming Club Hackathon — Teams Open', content: 'Registration for the 24-hour Programming Hackathon is now open. Form your team of 1-4 and register by Friday. Theme will be revealed at the event!', authorId: teacher1.id, schoolWide: false, important: false },
    { title: 'Library Extended Hours — Exam Season', content: 'The school library will have extended opening hours during exam season. Open until 8pm on weekdays. Please be respectful of other students studying.', authorId: admin.id, schoolWide: true, important: false },
  ];

  for (const a of announcementsData) {
    await prisma.announcement.create({ data: a });
  }

  // Notifications
  const notificationsData = [
    { userId: alex.id, type: 'LIKE' as const, title: 'Priya liked your post', body: 'Priya Sharma liked your robotics post', href: `/posts/${p1.id}`, actorId: priya.id },
    { userId: alex.id, type: 'COMMENT' as const, title: 'New comment on your post', body: 'Priya commented: "This is incredible!"', href: `/posts/${p1.id}`, actorId: priya.id },
    { userId: alex.id, type: 'FOLLOW' as const, title: 'Aisha is now following you', body: 'Aisha Patel started following you', href: `/profile/aisha_patel`, actorId: aisha.id },
    { userId: priya.id, type: 'LIKE' as const, title: 'Alex liked your post', body: 'Alex Kim liked your debate post', href: `/posts/${p2.id}`, actorId: alex.id },
    { userId: priya.id, type: 'ACHIEVEMENT' as const, title: 'Achievement verified!', body: 'Regional Debate Championship achievement was verified', href: `/profile/priya_sharma` },
    { userId: sofia.id, type: 'ACHIEVEMENT' as const, title: 'Achievement verified!', body: 'Regional Science Fair 1st Place was verified by Mr. Chen', href: `/profile/sofia_rivera` },
    { userId: ethan.id, type: 'FOLLOW' as const, title: 'Alex is now following you', body: 'Alex Kim started following you', href: `/profile/alex_kim`, actorId: alex.id },
    { userId: david.id, type: 'ACHIEVEMENT' as const, title: 'Achievement verified!', body: 'National Math Olympiad Qualifier was verified', href: `/profile/david_park` },
    { userId: omar.id, type: 'ANNOUNCEMENT' as const, title: 'Science Fair Registration Open', body: 'New announcement from the school', href: `/announcements` },
    { userId: james.id, type: 'CLUB_ACTIVITY' as const, title: 'New post in Programming Club', body: 'Ethan posted in Programming Club', href: `/clubs/programming`, actorId: ethan.id },
  ];

  for (const n of notificationsData) {
    await prisma.notification.create({ data: n });
  }

  // Moderation reports
  await prisma.moderationReport.create({
    data: {
      reporterId: lucas.id,
      targetType: 'post',
      targetId: p13.id,
      reason: 'Spam',
      details: 'This appears to be promotional content',
      status: 'OPEN',
    },
  });

  console.log('✅ Seed complete!');
  console.log('');
  console.log('Demo credentials (all use password: FPSDemo123!)');
  console.log('  Admin:   admin@fps.edu');
  console.log('  Teacher: sarah.johnson@fps.edu');
  console.log('  Student: alex.kim@fps.edu');
  console.log('  Student: priya.sharma@fps.edu');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
