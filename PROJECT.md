# 制作工程管理マネージャー

This document outlines the specifications for the Seisaku Manager application.

## 1. Application Overview

An application for managing production tasks and schedules.

## 2. Core Features

### Overall Management Tab
-   **UI**: Displays the count of ongoing projects and a list of projects.
-   **Views**: Projects are separated into "In Progress" and "Completed" sections.
-   **Completed Projects**: Displayed in a compact table format to save space.
-   **Data Fields**: Each project includes "Project Name," "Deadline," "Sales Representative," and "Designer."
-   **Task Management**: Ability to register multiple process tasks for each project, including due dates and notes.

### Monthly Schedule Tab
-   **Calendar View**: Displays all tasks within a monthly calendar.
-   **Interaction**: Tasks can be moved via drag-and-drop.
-   **Task Completion**: Each task has a checkbox to mark it as complete.
-   **Task Details**: Clicking on a date opens a pop-up with detailed information about the tasks for that day (Project Name, Task, etc.).

### Deadline Tab
-   **Calendar View**: Displays project deadlines on a calendar.
-   **Interaction**: Deadlines can be moved via drag-and-drop for easy rescheduling.

### Deployment
-   The application will be deployed to the Firebase project: `seisaku-schedule`.

### Security
-   All API keys and necessary sensitive information will be stored securely.

## 3. User Interface Style

-   **Primary Color**: `#2E9AFE` (Bright, saturated blue)
-   **Background Color**: `#F0F8FF` (Very light, clean blue)
-   **Accent Color**: `#566573` (Medium gray for contrast)
-   **Typography**:
    -   **Body & Headline**: 'Inter'
    -   **Code**: 'Source Code Pro'
-   **Iconography**: Consistent and clear icons will be used for actions and project types.
-   **Animation**: Subtle transitions and animations to improve user experience.
