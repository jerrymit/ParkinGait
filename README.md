# parkinGait
Steps to install project
1. git clone project
2. install node modules using `npm i`
3. Start expo project using `npx expo start`
4. To deploy website, cd into website folder and run `firebase deploy hosting`

Understanding File Strucutre
1. React Native App Files
    1. Calibration.js: page where user sets goal step length and calibrates step length constants
    2. Dashboard.js: page where users can track step length and asymmetry data
    3. Login.js: First page that a user opens up to where they can log in
    4. MainPage.js: Main page where user can start step length tracking and control cuing
    5. Register.js: Page where user can create a profile
2. Website Files
    1. index.html: main landing page where user can log in
    2. dashboard.html: page where physical therapist can track patient data
    3. newPatient.html: page where physical therapist can add new patients to a dashboard
    
Steps to proceed forward: To make this app deployable, these are the steps that should be followed
1. Set up Apple developer account: https://developer.apple.com
2. Set up provisioning profile, certificates, and devices
3. Run eas build -p ios to build app
4. Follow steps in cli to import the files created in step 2
5. Import new .ipa file that you can find in https://expo.dev/ to your phone using xCode
  
