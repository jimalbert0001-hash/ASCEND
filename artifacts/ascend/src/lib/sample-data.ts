export const sampleData = {
  dailyScore: 847,
  weeklyScores: [720, 680, 890, 750, 847, 0, 0],
  streak: {
    current: 23,
    longest: 31
  },
  goals: [
    { id: '1', title: 'Score 95%+ in Physics', domain: 'academics', progress: 68 },
    { id: '2', title: 'Launch MVP by July', domain: 'startup', progress: 40 },
    { id: '3', title: 'Reach 1800 Chess Rating', domain: 'chess', progress: 72, label: '1450/1800' },
    { id: '4', title: 'Master Fingerpicking', domain: 'guitar', progress: 55 }
  ],
  tasks: [
    { id: '1', title: 'Chapter 12: Thermodynamics revision', domain: 'academics', due: 'Tomorrow', priority: 'high', completed: false },
    { id: '2', title: 'Write landing page copy', domain: 'startup', due: 'In 2 days', priority: 'medium', completed: false },
    { id: '3', title: 'Solve 30 tactics puzzles', domain: 'chess', due: 'Today', priority: 'high', completed: false },
    { id: '4', title: 'Practice F major chord', domain: 'guitar', due: 'Today', priority: 'low', completed: false },
    { id: '5', title: 'Daily review', domain: 'life', due: 'Today', priority: 'medium', completed: false }
  ],
  achievements: [
    { id: '1', title: 'First Steps', description: 'Complete your first task', type: 'milestone', date: '2024-01-15', earned: true },
    { id: '2', title: 'On Fire', description: 'Reach a 7-day streak', type: 'streak', date: '2024-02-01', earned: true },
    { id: '3', title: 'Scholar', description: 'Log 50 hours of study', type: 'skill', date: '2024-03-10', earned: true },
    { id: '4', title: 'Founder', description: 'Launch a project', type: 'milestone', date: '2024-04-05', earned: true },
    { id: '5', title: 'Tactician', description: 'Solve 500 chess puzzles', type: 'skill', date: '2024-05-20', earned: true },
    { id: '6', title: 'Consistency', description: 'Log activity in all domains in one day', type: 'meta', date: '2024-06-12', earned: true },
    { id: '7', title: 'Unstoppable', description: 'Reach a 30-day streak', type: 'streak', earned: false },
    { id: '8', title: 'Mastermind', description: 'Reach 2000 Chess Rating', type: 'skill', earned: false },
    { id: '9', title: 'Virtuoso', description: 'Learn 10 full songs', type: 'skill', earned: false },
    { id: '10', title: 'Unicorn', description: 'Reach $1k MRR', type: 'milestone', earned: false },
    { id: '11', title: 'Polymath', description: 'Reach level 10 in all domains', type: 'meta', earned: false },
    { id: '12', title: 'Ascended', description: 'Complete Phase 1', type: 'meta', earned: false }
  ],
  quotes: [
    { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
    { text: "The first principle is that you must not fool yourself and you are the easiest person to fool.", author: "Richard Feynman" },
    { text: "Play iterated games. All the returns in life, whether in wealth, relationships, or knowledge, come from compound interest.", author: "Naval Ravikant" },
    { text: "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.", author: "Stephen King" },
    { text: "Discipline equals freedom.", author: "Jocko Willink" },
    { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
    { text: "Focus is a matter of deciding what things you're not going to do.", author: "John Carmack" },
    { text: "The impediment to action advances action. What stands in the way becomes the way.", author: "Marcus Aurelius" }
  ],
  user: {
    name: 'Alex Mercer',
    email: 'alex@example.com',
    initials: 'AM',
    stats: {
      studyHours: 142,
      chessRating: 1450,
      habitStreak: 23
    },
    joinedDate: 'January 2024',
    activeDomains: ['academics', 'startup', 'chess', 'guitar']
  }
};
