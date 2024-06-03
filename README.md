parkinGait
Steps to install project
git clone project using a terminal
Install node modules using npm i in the same folder as you've cloned this project
a. For help installing npm please visit this link
Start expo project using npx expo start
NOTE: Once 'npm' is installed on the computer, there is no need to reinstall it everytime. One can simply navigate to the folder that the project is cloned in and type 'npx expo start' to launch the project.
Once the project is started, one can scan the QR code displayed to have access to the app assuming the ExpoGo app is already installed on the device.
To deploy website, cd into website folder and run firebase deploy hosting
a. The website itself can be found at this link
Understanding File Strucutre
React Native App Files
Calibration.js: page where user sets goal step length and calibrates step length constants
Dashboard.js: page where users can track step length and asymmetry data
Login.js: First page that a user opens up to where they can log in
MainPage.js: Main page where user can start step length tracking and control cuing
Register.js: Page where user can create a profile
ForgotPassword.js: Page where user can reset the password
EditProfile.js: Page where user can edit the personal information stored
For all files please see the documentation therein for what each part does
Website Files
index.html: main landing page where user can log in
dashboard.html: page where physical therapist can track patient data
newPatient.html: page where physical therapist can add new patients to a dashboard
Current Method to Allow Therapist/Patient Access to App
Note that because this app has not been deployed yet, the environment must be manually started
How do I run the app continuously?
Due to the fact that this app has not been launched via the Apple Developer environment, the only way to ensure this app is accessible all hours of the day for all types of phones without having to let a physical computer run 24/7 is to make use of a Virtual Machine (VM). Using this method, one only needs to set up the environment once and (assuming the Virtual Machine used does not turn off daily) then the app will always be available for users.
Many universities allow students to reserve VMs and these can be started and closed without canceling the code one is running. As of May 2023, this method is being used to ensure access to the app remains open until the app is published (see below for more details). To learn more about VMs generally, please visit this link.
Once a VM is deployed, one should follow the installation steps listed above (reproduced below) on the machine to ensure the project begins correctly.

Steps to start up the app in a Virtual Machine

git clone this project using a terminal
Install node modules using npm i in the same folder as you've cloned this project
a. For help installing npm please visit this link
Start expo project using npx expo start
NOTE: Once 'npm' is installed on the computer, there is no need to reinstall it everytime. One can simply navigate to the folder that the project is cloned in and type 'npx expo start' to launch the project.
Once the project is started, one can scan the QR code displayed to have access to the app assuming the ExpoGo app is already installed on the device.
Again, it is important to note that unless updates are made on the backend to this app, the app will always be accessible after the first instance of 'npx expo start' is created. If updates are made, one should first push these updates to the cloned version of this project and then re-run 'npx expo start'.
Steps to proceed forward:
To make this app deployable, these are the steps that should be followed
Set up Apple developer account: https://developer.apple.com
Set up provisioning profile, certificates, and devices
Run eas build -p ios to build app
Follow steps in cli to import the files created in step 2
Import new .ipa file that you can find in https://expo.dev/ to your phone using xCode

Any questions about this project should be directed to dominicschottland@yahoo.com

# ParkinGait
This is the Mobile App used to track the progress of the Parkinson's patient.

# Firebase
Tutorial:https://www.youtube.com/watch?v=N8p7IJiwSLA
1. Register for the Firebase database in the Firebase Web page.
2. Create a project and add your App into the project. (The Android Package name should be in the Kotlin MainActivity.kt file)
-------------------------------------------------------------------------------------------------------------------------------
# In the Android Studio
3. Download the config JSON file and copy and paste it into the App folder.
4. Add dependencies to the build. gradle.kts (Project level and App level individually).
5. Go to tools and click the Firebase
6. Click tools and find the Firebase, click it and connect our app to the Firebase real-time database and authentication. (Add the SDK dependencies)
7. Successfully add the app to the Firebase.
