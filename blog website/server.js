const express = require('express');
const path = require('path');
const fileupload = require('express-fileupload');
const firebase = require('firebase/app');
const firestore = require('firebase/firestore');

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(fileupload());

// Initialize Firebase
const firebaseConfig = {
  // Your Firebase configuration
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home.html"));
});

app.get('/editor', (req, res) => {
  res.sendFile(path.join(__dirname, "public", "editor.html"));
});

app.post('/upload', (req, res) => {
  const { file, type } = req.files;
  const storageRef = firebase.storage().ref();
  const uploadTask = storageRef.child(`${type}/${file.name}`).put(file);

  uploadTask.on('state_changed', (snapshot) => {
    // You can add progress indicators here
  }, (error) => {
    console.error(error);
    res.status(500).send('Error uploading image');
  }, () => {
    uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
      db.collection(type).add({
        image: downloadURL,
        created_at: new Date(),
      }).then(() => {
        res.send({ success: true, url: downloadURL });
      }).catch((error) => {
        console.error(error);
        res.status(500).send('Error saving image to Firestore');
      });
    });
  });
});

app.listen("3000", () => {
  console.log('listening......');
});