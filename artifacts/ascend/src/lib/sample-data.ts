export const sampleData = {
  dailyScore: 0,
  weeklyScores: [0, 0, 0, 0, 0, 0, 0],
  streak: {
    current: 0,
    longest: 0
  },
  goals: [],
  tasks: [],
  achievements: [
    { id: '1', title: 'First Steps', description: 'Complete your first task', type: 'milestone', earned: false },
    { id: '2', title: 'On Fire', description: 'Reach a 7-day streak', type: 'streak', earned: false },
    { id: '3', title: 'Scholar', description: 'Log 50 hours of study', type: 'skill', earned: false },
    { id: '4', title: 'Founder', description: 'Launch a project', type: 'milestone', earned: false },
    { id: '5', title: 'Tactician', description: 'Solve 500 chess puzzles', type: 'skill', earned: false },
    { id: '6', title: 'Consistency', description: 'Log activity in all domains in one day', type: 'meta', earned: false },
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
    name: '',
    email: '',
    initials: '',
    stats: {
      studyHours: 0,
      chessRating: 0,
      habitStreak: 0
    },
    joinedDate: '',
    activeDomains: []
  }
};
