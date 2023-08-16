import mongoose from "mongoose";
import Questions from "../models/Questions.js";
import users from "../models/auth.js";

export const postAnswer = async (req, res) => {
  const { id: _id } = req.params;
  const { noOfAnswers, answerBody, userAnswered } = req.body;
  const userId = req.userId;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("question unavailable...");
  }

  updateNoOfQuestions(_id, noOfAnswers);
  try {
    const updatedQuestion = await Questions.findByIdAndUpdate(_id, {
      $addToSet: { answer: [{ answerBody, userAnswered, userId }] },
    });
    await updateUserNoOfAnswer(userId);
    res.status(200).json(updatedQuestion);
  } catch (error) {
    res.status(400).json("error in updating");
  }
};
// export const postAnswer = async (req, res) => {
//   const { id: _id } = req.params;
//   const { noOfAnswers, answerBody, userAnswered } = req.body;
//   const userId = req.userId;
//   if (!mongoose.Types.ObjectId.isValid(_id)) {
//     return res.status(404).send("question unavailable...");
//   }

//   updateNoOfQuestions(_id, noOfAnswers);
//   const updatedQuestion= await Questions.findByIdAndUpdate(_id, {
//     $addToSet: { answer: [{ answerBody, userAnswered, userId }] },
//   });
//   await updateUserNoOfAnswer(userId);
//   res.status(200).json(updatedQuestion);
// };

const updateNoOfQuestions = async (_id, noOfAnswers) => {
  try {
    await Questions.findByIdAndUpdate(_id, {
      $set: { noOfAnswers: noOfAnswers },
    });
  } catch (error) {
    console.log(error);
  }
};

export const deleteAnswer = async (req, res) => {
  const { id: _id } = req.params;
  const { answerId, noOfAnswers } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("Question unavailable...");
  }
  if (!mongoose.Types.ObjectId.isValid(answerId)) {
    return res.status(404).send("Answer unavailable...");
  }
  updateNoOfQuestions(_id, noOfAnswers);
  try {
    await Questions.updateOne(
      { _id },
      { $pull: { answer: { _id: answerId } } }
    );
    res.status(200).json({ message: "Successfully deleted..." });
  } catch (error) {
    res.status(405).json(error);
  }
};


const updateUserNoOfAnswer = async (userId) => {
  try {
    const user = await users.findById(userId);
    let userAnswers = user?.noOfAnswers + 1;
    let userBadges = user.badges;
    if (userAnswers >= 5 && userAnswers <= 30 && !user.badge5to30) {
      userBadges += 1;
      await users.findByIdAndUpdate(userId, {
        $set: {
          noOfAnswers: userAnswers,
          badges: userBadges,
          badge5to30: true, 
        },
      },{ new: true });
    } else if (userAnswers > 31 && userAnswers <= 100 && !user.badge31to100) {
      userBadges += 1;
      await users.findByIdAndUpdate(userId, {
        $set: {
          noOfAnswers: userAnswers,
          badges: userBadges,
          badge31to100: true, 
        },
      },{ new: true });
    } else if (userAnswers > 100 && !user.badge100Plus) {
      userBadges += 1;
      await users.findByIdAndUpdate(userId, {
        $set: {
          noOfAnswers: userAnswers,
          badges: userBadges,
          badge100Plus: true, 
        },
      },{ new: true });
    }else {
      await users.findByIdAndUpdate(userId, {
        $set: {
          noOfAnswers: userAnswers,
          
        },
      },{ new: true });
    }
    console.log(user.noOfAnswers);
  } catch (error) {
    console.log(error + " uploading answer reward data");
  }
};
