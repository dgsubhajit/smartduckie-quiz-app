import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

interface CheckAnswerData {
  questionId: string;
  selectedOption: number;
}

export const checkAnswer = functions.https.onCall((data: CheckAnswerData, context) => {
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: process.env.GCLOUD_PROJECT,
    });
  }
  const db = admin.firestore();

  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const {questionId, selectedOption} = data;

  return db
    .collection("questions")
    .doc(questionId)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        throw new functions.https.HttpsError("not-found", "Question not found.");
      }

      const questionData = doc.data();

      if (!questionData) {
        throw new functions.https.HttpsError(
          "not-found",
          "Question data not found."
        );
      }

      const correctAnswerIndex = questionData.answerIndex;

      const isCorrect = selectedOption === correctAnswerIndex;

      return {isCorrect};
    });
});