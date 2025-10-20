import * as admin from 'firebase-admin';

admin.initializeApp({
  projectId: 'smartduckie-00',
});

const db = admin.firestore();

db.collection('questions').get()
  .then((snapshot) => {
    if (snapshot.empty) {
      console.log('No documents found in the questions collection.');
      return;
    }

    console.log(`Found ${snapshot.size} documents in the questions collection.`);
    snapshot.forEach((doc) => {
      console.log(doc.id, '=>', doc.data());
    });
  })
  .catch((err) => {
    console.log('Error getting documents', err);
  });
