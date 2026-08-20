# Reddit Topic Evolution App

Live application: https://trendsanalyzer.netlify.app/

Project planning: [Reddit Client App GitHub Project](https://github.com/users/nico-figueroa/projects/12/views/2)

## About the App
This application will enable the user to choose between two dates to perform an analysis of the keywords that have trended between the same in Reddit.

## Objective of the project
Practice all Frontend development tools taught by Codecademy as part of the third module of the Full Stack Engineer program.

## Technologies Used

- React 19 and React Router
- Redux Toolkit and React Redux
- Vite
- Recharts for visualizations
- Jest and React Testing Library for unit/component tests
- Selenium WebDriver with Microsoft Edge for end-to-end tests
- jsPDF and html2canvas for PDF export
- CSS custom properties and responsive media queries

React Testing Library is used instead of Enzyme because Enzyme does not provide a maintained React 19 adapter. The tests still provide Jest-based component coverage using user-facing behavior.

## Features

- Analyze Reddit posts across a selected subreddit and date range
- Derive trend keywords, topic counts, descriptive statistics, and Pareto distributions
- Search results by term and filter them by predefined category
- Open detailed analysis views through `/details/:id`
- Add notes and export analysis views to PDF
- Import real Reddit JSON manually when Reddit blocks browser API requests
- Fall back to bundled demo data when live Reddit data is unavailable
- Responsive desktop and mobile layouts with loading, error, and recovery states

## Future Work

- Add an authenticated server-side Reddit API integration to avoid client-side CORS and bot-detection limitations
- Add saved analyses and persistent notes
- Add broader browser/device testing and automated Lighthouse checks
- Improve direct deployment support for additional shareable analysis URLs

## Project Requirements:

1. Build the application using React and Redux
2. Version control your application with Git and host the repository on GitHub
3. Use a project management tool (GitHub Projects, Trello, etc.) to plan your work
4. Write a README (using Markdown) that documents your project including:
  - Wireframes
  - Technologies used
  - Features
  - Future work
5. Write unit tests for your components using Jest and React Testing Library
6. Write end-to-end tests for your application
7. Users can use the application on any device (desktop to mobile)
8. Users can use the application on any modern browser
9. Users can access your application at a URL
10. Users see an initial view of the data when first visiting the app
11. Users can search the data using terms
12. Users can filter the data based on categories that are predefined
13. Users are shown a detailed view (modal or new page/route) when they select an item
14. Users are delighted with a cohesive design system
15. Users are delighted with animations and transitions
16. Users are able to leave an error state
17. Get 90+ scores on [Lighthouse](https://web.dev/measure/)
  - We understand you cannot control how media assets like videos and images are sent to the client. It is okay to have a score below 90 for Performance if they are related to the media from Reddit.
18. OPTIONAL: [Get a custom domain name and use it for your application](https://www.codecademy.com/courses/make-a-website/lessons/setting-up-your-domain/)
19. OPTIONAL: Set up a CI/CD workflow to automatically deploy your application when the master branch in the repository changes
20. OPTIONAL: Make your application a progressive web app

## Prerequisites:

- HTML
- CSS
- JavaScript
- React
- Redux
- Jest and Selenium
- Git and GitHub
- Command line and file navigation
- Wireframing

## Wireframes
[Wireframes](./documentation/Wireframes.pdf)

## Deployment and Quality Evidence

- The application is deployed at https://trendsanalyzer.netlify.app/.
- The repository is hosted on GitHub and planned through the GitHub Project linked above.
- The PageSpeed Insights mobile report recorded Performance `100`, Accessibility `96`, and Best Practices `96`. SEO was `80`, so SEO remains below the 90+ target and is future work.
- Run `npm run dev` before the Selenium suite, then run `npm test -- --selectProjects e2e --runInBand`.

## Component Hierarchy

<pre>
App
 ├── Layout
 │     ├── Header
 │     └── Footer (optional)
 │
 ├── AnalysisForm
 │     ├── DateRangePicker
 │     ├── AnalysisOptions
 │     └── AnalyzeButton
 │
 ├── AnalysisResults
 │     ├── ResultsHeader
 │     ├── TopicParetoChart
 │     ├── TopicCountChart
 │     ├── DescriptiveStatisticsList
 │     ├── InsightsList
 │     ├── ResultsActions
 │     │     ├── NewAnalysisButton
 │     │     └── SaveToPDFButton
 │
 ├── DetailedAnalysisView
 │     ├── DetailedChart
 │     ├── AdditionalInformation
 │     ├── AddNote
 │     ├── BackToFullAnalysisButton
 │     └── SaveToPDFButton
 │
 └── SharedComponents
       ├── LoadingSpinner
       ├── ErrorMessage
       ├── Modal
       └── ChartContainer
</pre>

## Redux Slice Structure

1) Analysis Slice
  - Date range
  - Selected analysis options
  - Loading state
  - Error state
  - Results
2) UI Slice
  - Which view is active
  - Modal visibility
  - PDF export state
3) Notes Slice
  - Capture user notes from detailed view
4) API Slice
  - Connection to Reddit API
  - Retrieval of data for analysis

## State Flow Diagram

<pre>
[User selects date range]
        ↓
analysisSlice.startDate / endDate updated

[User selects analysis options]
        ↓
analysisSlice.options updated

[User clicks "Analyze!"]
        ↓
uiSlice.currentView = "loading"
analysisSlice.loading = true

[Thunk fetchAnalysisResults runs]
        ↓
Call Reddit API → process data → categorize topics

[If success]
        ↓
analysisSlice.results = { ... }
analysisSlice.loading = false
uiSlice.currentView = "results"

[User clicks an item in Descriptive Statistics or Insights]
        ↓
analysisSlice.selectedDetailItem = itemId
uiSlice.currentView = "detail"

[User clicks "Back to full analysis"]
        ↓
uiSlice.currentView = "results"

[User clicks "New analysis"]
        ↓
analysisSlice reset to initialState
uiSlice.currentView = "form"
</pre>