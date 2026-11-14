// Every fact here comes from Praveen's resume. Edit this one file to update the site.

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
  summary:
    'Data Analyst with hands-on experience in data analysis, business intelligence, dashboard development and reporting using Python, SQL, Excel and Power BI. Currently an MIS Executive, building automated reports and interactive dashboards that help the business decide faster.',
}

export const stats = [
  { value: '9,000+', label: 'Apps analysed' },
  { value: '4B+', label: 'Reviews mined' },
  { value: '4', label: 'BI dashboards shipped' },
  { value: '1.5+', label: 'Years in data roles' },
]

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
    text: 'Cleaning, EDA, trend and statistical analysis in Python and SQL, turned into Power BI stories with DAX and Power Query.',
    tags: ['Python', 'SQL', 'Power BI'],
    icon: 'analytics',
  },
]

export const coreSkills = [
  { name: 'Python', detail: 'Pandas · NumPy · Matplotlib' },
  { name: 'SQL', detail: 'MySQL · JOINs · Subqueries · GROUP BY / HAVING' },
  { name: 'Power BI', detail: 'DAX · Power Query · Data modeling' },
  { name: 'Advanced Excel', detail: 'VLOOKUP · INDEX-MATCH · Pivot tables' },
]

export const extraSkills = [
  'Tableau', 'Looker Studio', 'Google Sheets', 'EDA', 'Data Cleaning',
  'Statistical Analysis', 'KPI Reporting', 'Pandas', 'NumPy', 'DAX', 'Power Query', 'Gemini', 'Claude',
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
    ],
  },
]

export const education = [
  { title: 'Bachelor of Computer Applications (BCA)', org: 'IGNOU', period: '2021 – 2025' },
  { title: 'Class XII (CBSE)', org: 'Govt. Co-Ed Sr. Sec. School, Rohini', period: '2021' },
]

export const certifications = [
  { title: 'Data Science & Analytics Training', org: 'Ducat Education', period: '2024 – 2025' },
  { title: 'Python (Basic)', org: 'HackerRank', period: 'Jul 2025' },
  { title: 'SQL (Basic)', org: 'HackerRank', period: 'Jul 2025' },
]

export const projects = [
  {
    no: '01',
    title: 'Google Play Store Analysis',
    tagline: 'What makes an app win?',
    text: 'Cleaned and explored 9,000+ apps and 4B+ reviews to surface what drives installs and ratings across categories. KPIs and interactive visuals for market trends.',
    metric: [{ v: '9K+', l: 'Apps' }, { v: '4B+', l: 'Reviews' }],
    stack: ['Python', 'Excel', 'Power BI', 'EDA'],
    link: 'https://github.com/praveenk20104/Google-Playstore',
    chart: 'bars',
  },
  {
    no: '02',
    title: 'IPL Data Analysis Dashboard',
    tagline: 'Team and player form, decoded',
    text: 'Interactive dashboard on IPL team and player performance. DAX measures and Power Query transformations power the stats, comparisons and tournament trends.',
    metric: [{ v: 'DAX', l: 'Measures' }, { v: 'IPL', l: 'Seasons' }],
    stack: ['Power BI', 'DAX', 'Power Query'],
    link: 'https://github.com/praveenk20104/IPL-Analysis-Data-Analytics',
    chart: 'line',
  },
  {
    no: '03',
    title: 'Smart Store Sales Analysis',
    tagline: 'Revenue, sales and margin at a glance',
    text: 'A sales dashboard with KPIs for revenue, sales performance and profit margins, built so the business can make data-driven decisions quickly.',
    metric: [{ v: 'KPI', l: 'Revenue' }, { v: '%', l: 'Margins' }],
    stack: ['Power BI', 'DAX', 'Excel'],
    link: 'https://github.com/praveenk20104/Smart-Store-Power-Bi',
    chart: 'donut',
  },
  {
    no: '04',
    title: 'T20 World Cup 2022 Analysis',
    tagline: 'Cricket analytics, ball by ball',
    text: 'Top run-scorers, strike rates, wickets and player stats in one interactive cricket analytics dashboard, transformed with Power Query and DAX.',
    metric: [{ v: 'SR', l: 'Strike rates' }, { v: 'W', l: 'Wickets' }],
    stack: ['Power BI', 'Power Query', 'DAX'],
    link: 'https://github.com/praveenk20104/T20-World-Cup-2022-Power-Bi',
    chart: 'scatter',
  },
]

export const sections = [
  { id: 'hero', label: 'Toss' },
  { id: 'about', label: 'Pitch Report' },
  { id: 'skills', label: 'Skills' },
  { id: 'career', label: 'Scorecard' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Next Innings' },
]
