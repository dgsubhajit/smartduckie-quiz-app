// smart-duckie-quiz_backend/src/seedData.ts

import * as admin from 'firebase-admin';
import { CollectionReference } from 'firebase-admin/firestore';
import * as path from 'path'; // <-- 1. IMPORT THE PATH MODULE
import * as fs from 'fs'; // <-- IMPORT THE FILE SYSTEM MODULE




// Define your Project ID directly
const PROJECT_ID = "smartduckie-00"; 
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080'; // <--- ADD THIS LINE


const JSON_FILE_PATH = path.join(process.cwd(), 'src', 'math_g7_data.json'); 
const rawData = JSON.parse(fs.readFileSync(JSON_FILE_PATH, 'utf-8')); // <-- USE THE VARIABLE HERE


// NOTE: Use a unique variable name for each JSON file you import
// 1. Initialize the Admin SDK with the explicit Project ID
admin.initializeApp({
    // Tells the Admin SDK which project to connect to
    projectId: PROJECT_ID, 
});
const db = admin.firestore();

async function seedQuestions(data: any) {
    const batch = db.batch();
    const questionsRef: CollectionReference = db.collection('questions');
    let batchSize = 0;

    for (const rawQuestion of data.questions) {
        // Find the correct index to store securely
        const answerIndex = rawQuestion.options.indexOf(rawQuestion.answer);

        if (answerIndex === -1) {
            console.warn(`Skipping question: '${rawQuestion.question}' - Answer not found in options.`);
            continue; // Skip invalid data
        }

        const transformedQuestion = {
            subject: data.metadata.subject,
            grade: data.metadata.grade,
            level: data.metadata.level,
            type: data.metadata.type,
            questionText: rawQuestion.question,
            options: rawQuestion.options,
            answerIndex: answerIndex // Secure numeric index
        };

        const newDocRef = questionsRef.doc();
        batch.set(newDocRef, transformedQuestion);
        batchSize++;

        if (batchSize >= 499) { // Commit before the 500 limit
            await batch.commit();
            console.log('Committed batch of 500 documents.');
            batchSize = 0;
        }
    }
    if (batchSize > 0) {
        await batch.commit();
	console.log(`Committed final batch of ${batchSize} documents.`);
    }
    console.log(`Successfully seeded ${data.questions.length} questions for ${data.metadata.subject} Grade ${data.metadata.grade}.`);
}

seedQuestions(rawData)
    .then(() => {
	console.log('Script finished successfully. Exiting Node.js process.');
	process.exit(0);
	})
    .catch((error) => {
        console.error('Seeding failed:', error);
        process.exit(1);
    });
