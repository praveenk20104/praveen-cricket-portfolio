// Every fact here comes from Praveen's resume and his own dashboards.
// Edit this one file to update the text on the site.

export const profile = {
  name: 'Praveen Kumar',
  first: 'PRAVEEN',
  last: 'KUMAR',
  role: 'Data Analyst & MIS Executive',
  location: 'New Delhi, India',
  email: 'praveenk20104@gmail.com',
  phone: '+91 9310472252',
  linkedin: 'https://www.linkedin.com/in/praveen-kumar-590517277/',
  github: 'https://github.com/praveenk20104',
  resume: './Praveen_Kumar_Resume.pdf',
  // Your photo: upload a file named profile.jpg into the "public" folder. Until then a "PK" badge is shown.
  photo: './profile.jpg',
  summary:
    'Data Analyst with hands-on experience in data analysis, business intelligence, dashboard development and reporting using Python, SQL, Excel and Power BI. Currently an MIS Executive, building automated reports and interactive dashboards that help the business decide faster.',
}

// Player-profile card shown after the walk-in (like the TV graphic for a new batter)
export const playerCard = [
  { k: 'Role', v: 'Data Analyst · Power BI Developer · MIS Analyst' },
  { k: 'Current team', v: 'Rahul Trivedi & Associates' },
  { k: 'Based in', v: 'New Delhi, India' },
  { k: 'Experience', v: '2+ years in data & MIS' },
  { k: 'Degree', v: 'BCA · IGNOU' },
  { k: 'Go-to shots', v: 'Python · SQL · Power BI · Excel' },
]

// "The new ball" section: what I do, in plain words (no project figures here)
export const newBall = {
  plain: 'In simple words: I turn a company’s raw data into clear reports and dashboards, so people can make better decisions, faster.',
  experience: '2+',
  balls: [
    { title: 'Collect & clean', text: 'I gather data from Excel, Google Sheets and databases, and fix the errors and gaps.' },
    { title: 'Find the story', text: 'I study the numbers to spot trends, problems and chances to grow.' },
    { title: 'Show it clearly', text: 'I build dashboards and automatic reports that anyone in the team can read.' },
  ],
}

export const strengths = ['Analytical thinking', 'Problem-solving', 'Critical thinking', 'Communication', 'Attention to detail']

export const services = [
  {
    no: '01',
    title: 'Google Sheet Automation',
    text: 'Self-updating Google Sheets and Excel reports, task-management portals and AI-assisted workflows (Gemini, Claude) that remove repetitive manual work.',
    tags: ['Google Sheets', 'Excel', 'Workflow automation'],
    icon: 'sheet',
  },
  {
    no: '02',
    title: 'MIS Reporting',
    text: 'Weekly MIS packs, KPI trackers and Looker Studio dashboards that give management a clear read on team, operations and financial performance.',
    tags: ['Weekly MIS', 'KPI tracking', 'Looker Studio'],
    icon: 'report',
  },
  {
    no: '03',
    title: 'Data Analytics',
    text: 'Cleaning, EDA, trend and statistical analysis in Python and SQL that turns raw business data into clear, actionable insights.',
    tags: ['Python', 'SQL', 'EDA'],
    icon: 'analytics',
  },
  {
    no: '04',
    title: 'Dashboard Development',
    text: 'Interactive Power BI dashboards with DAX measures, Power Query transformations and clean data models, built for quick decisions.',
    tags: ['Power BI', 'DAX', 'Power Query'],
    icon: 'dashboard',
  },
]

// How a piece of work moves from raw data to a decision
export const gamePlan = [
  { over: '1', title: 'Read the conditions', text: 'Understand the question, pull the right data.', tools: 'SQL · Excel' },
  { over: '2', title: 'Prepare the pitch', text: 'Clean and check the data so it can be trusted.', tools: 'Pandas · Power Query' },
  { over: '3', title: 'Build the innings', text: 'Find the trends and KPIs that matter.', tools: 'Python · EDA' },
  { over: '4', title: 'Big shots', text: 'Dashboards that tell the story at a glance.', tools: 'Power BI · Looker' },
  { over: '5', title: 'Finish the match', text: 'Automated MIS reports for management.', tools: 'Sheets · Gemini' },
]

export const coreSkills = [
  { name: 'Python', detail: 'Pandas · NumPy · Matplotlib' },
  { name: 'SQL', detail: 'MySQL · JOINs · Subqueries · GROUP BY / HAVING' },
  { name: 'Power BI', detail: 'DAX · Power Query · Data modeling' },
  { name: 'Advanced Excel', detail: 'VLOOKUP · INDEX-MATCH · Pivot tables' },
]

export const skillGroups = [
  { title: 'Data Analysis', items: ['EDA', 'Data Cleaning', 'Preprocessing', 'Data Validation', 'Transformation', 'Statistical Analysis', 'Trend Analysis', 'KPI Analysis'] },
  { title: 'SQL & Database', items: ['MySQL', 'Data Extraction', 'INNER / LEFT / RIGHT JOIN', 'Subqueries', 'Aggregate Functions', 'GROUP BY', 'HAVING'] },
  { title: 'Python', items: ['Pandas', 'NumPy', 'Matplotlib', 'Data Visualization'] },
  { title: 'Microsoft Excel', items: ['VLOOKUP', 'INDEX-MATCH', 'IF Functions', 'Pivot Tables', 'Charts', 'Reporting'] },
  { title: 'Visualization & BI', items: ['Power BI', 'DAX', 'Power Query', 'Data Modeling', 'Tableau', 'Looker Studio'] },
  { title: 'Automation', items: ['Reporting Automation', 'Workflow Optimization', 'Google Sheets', 'Gemini', 'Claude'] },
]

// Floating labels around the 3D stumps
export const orbitSkills = {
  core: ['Python', 'SQL', 'Power BI', 'Advanced Excel'],
  extra: ['Pandas', 'DAX', 'Power Query', 'Tableau', 'Looker Studio', 'MySQL', 'NumPy', 'EDA', 'Google Sheets', 'Matplotlib'],
}

export const career = [
  {
    role: 'MIS Executive',
    org: 'Rahul Trivedi & Associates',
    place: 'Rohini, New Delhi',
    period: 'Sep 2025 – Present',
    status: 'NOT OUT*',
    live: true,
    points: [
      'Analyse business and operational datasets to find trends and actionable insights.',
      'Build and maintain automated Excel and Google Sheets reports for faster reporting.',
      'Create Looker Studio dashboards for team performance, operations and financial KPIs.',
      'Use Gemini and Claude to build reporting workflows and task-management portals.',
      'Prepare weekly MIS reports and present insights for management reviews.',
    ],
  },
  {
    role: 'Data Science Intern',
    org: 'Ducat',
    place: 'Pitampura, New Delhi',
    period: 'Jan 2025 – Jul 2025',
    status: 'INNINGS DONE',
    live: false,
    points: [
      'Analysed 9,000+ Google Play Store apps and 4B+ reviews with Python, Excel and Power BI.',
      'Handled data cleaning, preprocessing and EDA to prepare data for visualisation.',
      'Built interactive Power BI dashboards on ratings, installs and category trends.',
      'Worked with senior mentors on practical analytics, BI and reporting.',
    ],
  },
]

export const education = [
  { title: 'Master of Computer Applications (MCA)', org: 'Pursuing', period: '2025 – Present' },
  { title: 'Bachelor of Computer Applications (BCA)', org: 'Indira Gandhi National Open University (IGNOU)', period: '2021 – 2025' },
  { title: 'Class XII (CBSE)', org: 'Govt. Co-Ed Sr. Sec. School, Rohini', period: '2021' },
]

export const certifications = [
  { title: 'Advanced MIS Program', org: 'Rahul Jain · Business Coaching India', period: '' },
  { title: 'Data Science & Analytics Training', org: 'Ducat Education', period: 'Feb 2024 – May 2025' },
  { title: 'Python (Basic)', org: 'HackerRank', period: 'Jul 2025' },
  { title: 'SQL (Basic)', org: 'HackerRank', period: 'Jul 2025' },
]

// Images are real screenshots of the dashboards (public/projects). Numbers are read from the dashboards.
export const projects = [
  {
    no: '01',
    title: 'Google Play Store Analysis',
    tagline: 'What makes an app win?',
    image: './projects/playstore.jpg',
    text: 'Cleaned and explored 9,000+ apps and 4B+ reviews to show what drives installs and ratings across categories.',
    points: [
      'Data cleaning, preprocessing and EDA in Python',
      'Category, sentiment and content-rating views',
      'KPIs for installs, ratings and reviews',
    ],
    metric: [{ v: '9,628', l: 'Apps' }, { v: '4bn', l: 'Reviews' }, { v: '4.19', l: 'Avg rating' }],
    stack: ['Python', 'Excel', 'Power BI', 'EDA'],
    link: 'https://github.com/praveenk20104/Google-Playstore',
  },
  {
    no: '02',
    title: 'IPL Data Analysis Dashboard',
    tagline: 'Team and player form, decoded',
    image: './projects/ipl.jpg',
    text: 'Interactive dashboard on IPL team and player performance across seasons, with separate batting and bowling pages.',
    points: [
      'Title winner, Orange Cap and Purple Cap by season',
      'Wins by venue, toss decision and result type',
      'DAX measures and Power Query transformations',
    ],
    metric: [{ v: '2008–22', l: 'Seasons' }, { v: '3', l: 'Report pages' }],
    stack: ['Power BI', 'DAX', 'Power Query'],
    link: 'https://github.com/praveenk20104/IPL-Analysis-Data-Analytics',
  },
  {
    no: '03',
    title: 'Smart Store Sales Analysis',
    tagline: 'Revenue, sales and margin at a glance',
    image: './projects/store.jpg',
    text: 'Sales dashboard with KPIs for revenue, profit and quantity, sliced by month, region, category and segment.',
    points: [
      'Monthly sales trend with a December peak',
      'Region-wise and category-wise sales',
      'Top sub-category and segment at a glance',
    ],
    metric: [{ v: '₹1.26 Cr', l: 'Total sales' }, { v: '₹14.7 L', l: 'Profit' }, { v: '1.78 L', l: 'Units sold' }],
    stack: ['Power BI', 'DAX', 'Excel'],
    link: 'https://github.com/praveenk20104/Smart-Store-Power-Bi',
  },
  {
    no: '04',
    title: 'T20 World Cup 2022 Analysis',
    tagline: 'Cricket analytics, ball by ball',
    image: './projects/t20.jpg',
    text: 'Cricket analytics dashboard covering match results, top run-scorers, strike rates, wickets and player statistics.',
    points: [
      'Tournament summary with match-by-match results',
      'Batting and bowling performance pages',
      'Wins by stadium and by toss decision',
    ],
    metric: [{ v: '42', l: 'Matches' }, { v: '331', l: 'Sixes' }, { v: '909', l: 'Fours' }],
    stack: ['Power BI', 'Power Query', 'DAX'],
    link: 'https://github.com/praveenk20104/T20-World-Cup-2022-Power-Bi',
  },
]

export const ticker = ['Python', 'SQL', 'Power BI', 'Advanced Excel', 'DAX', 'Power Query', 'Looker Studio', 'Tableau', 'Google Sheets', 'MIS Reporting', 'EDA', 'Automation']

// One entry per section, in page order. The index is the camera "stage".
export const sections = [
  { id: 'hero', label: 'Walk-in' },
  { id: 'matchball', label: 'New ball' },
  { id: 'about', label: 'Pitch report' },
  { id: 'services', label: 'Services' },
  { id: 'gameplan', label: 'Game plan' },
  { id: 'skills', label: 'Skills' },
  { id: 'career', label: 'Scorecard' },
  { id: 'projects', label: 'Projects' },
  { id: 'training', label: 'Training' },
  { id: 'contact', label: 'Next innings' },
]
