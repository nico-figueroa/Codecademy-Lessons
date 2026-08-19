# Reddit Topic Evolution App

## About the App
This application will enable the user to choose between two dates to perform an analysis of the keywords that have trended between the same in Reddit.

## Objective of the project
Practice all Frontend development tools taught by Codecademy as part of the third module of the Full Stack Engineer program.

## Project Requirements:

1. Build the application using React and Redux
2. Version control your application with Git and host the repository on GitHub
3. Use a project management tool (GitHub Projects, Trello, etc.) to plan your work
4. Write a README (using Markdown) that documents your project including:
  - Wireframes
  - Technologies used
  - Features
  - Future work
5. Write unit tests for your components using Jest and Enzyme
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