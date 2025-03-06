**[Link to CueSportsPro]() to be implemented**

Made by the Dijkstra's Disciples - Chris Smith, Daniel Zhang, Devin Mihaichuk, Emre Sunar

---
**Description:**
-

   CueSportsPro is a sophisticated tournament management system with role-based access control for players and 
tournament officials. The platform enables tournament officials to create customizable tournaments 
with different rule sets (8-Ball, 9-Ball, or 10-Ball), scoring configurations, and skill-level brackets. Players 
can register for upcoming tournaments, view past tournaments, view ongoing bracket, and track their performance history. When 
tournaments are in session, the system provides real-time bracket visualization with automatic progression 
as officials record match results, creating an engaging and transparent tournament experience for all participants
and spectators.

   Beyond tournament management, CueSportsPro delivers comprehensive player profiles with detailed match histories, 
win/loss statistics, and performance analytics across different rule sets. The platform maintains an archive of past 
tournaments with complete results and winner information for historical reference. Users can customize notification 
preferences to stay informed about tournament registrations, and upcoming matches. The elegant user interface, 
featuring subtle animations, textured backgrounds, and carefully crafted typography, ensures an intuitive and visually 
appealing experience across all devices.

**Additional instructions for CueSportsPro:**
-
   1. To login, click the sign-in button in the upper right corner and then click on Sign In With Google when redirected
2. Make sure you have a Google account when testing player and tournament official functionality or you cannot login
3. Only tournament-officials have access to functions like creating tournaments which is not given by default. We can elevate your account to tournament official status for your testing if you ask prior.
4. Only tournament-officials that are officiating a given tournament are able to enter results for that given tournament so make sure that you are set to officiate a tournament if you want to set scores.

**Technology Stack [Need to finish]**
-
- Framework: React.js
- Server: Node.js
- Programming Language: Javascript
- Styles Framework: Tailwind CSS
- Database: MongoDB
- Authentication: OAuth
- Deployment: Glitch
- Team Management: Jira
- Styling Languages: HTML & CSS
- Version Control: GitHub

**Challenges [Need to finish]**
-
- Deployment: Deploying on Glitch was a long and painful process
- 

**Contributions [Need to finish]**
-
**Christopher Smith:**
- Notification feature
  - Emailing for when a tournament is created
  - Emailing for when a tournament is started
- Tournament Creation
  - Updating Schema
  - Adding additional fields

**Devin Mihaichuk:**
- Jira Management
  - Scrum Master
  - Sprint Management
- Updated ongoing tournament management
  - Added a bye system
  - Added a scoring system
- Registration for upcoming tournaments
  - Tournament Officials being able to register or officiate (but not both)
  - Players able to Register
  - Viewers only able to view participants
- Managing player and tournament official access
- Updated meta data
- QA Testing

**Emre Sunar:**
- Tournament Bracket
  - Created schema
  - Created styling
  - Bracket generation
  - Limiting access to bracket management
- Tournament Creation
  - Updating the database
  - Schema

**Danial Zhang:**
- Authentication through Google
  - Automatically registering new people into the database as players
  - Creating method to retrieve user information
- Profile
  - Customization of username, bio, country, and profile picture
  - Player statistics
    - Diagrams and tables
    - Including a filter feature
  - Updating and Displaying player match history
- Settings
  - Allowing users to enable/disable emails
- Bug Fixes
  - Created Dev Tool for debugging and testing (now deleted)