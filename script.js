// Global variables to store user data, questions, and quiz state
let userName = "";
let currentQuestionIndex = 0;
let correctAnswersCount = 0;
let quizData = [
  {
    question: "What is the length of the following array? [[1, 2], [3, 4], [5, 6], [7, 8]]",
    answers: ["3", "4", "5", "6"],
    correctAnswer: "4",
  },
  {
    question: "What is the sum of all elements in the following 2D array? [[1, 2, 3], [4, 5, 6], [7, 8, 9]]",
    answers: ["30", "32", "34", "36"],
    correctAnswer: "32",
  },
  {
    question: "What is the element at row 1, column 2 in the following 2D array? [[1, 2], [3, 4], [5, 6]]",
    answers: ["3", "4", "5", "6"],
    correctAnswer: "5",
  },
  {
    question: "Which of the following is the second sub-array of the 2D array? [[1, 2], [3, 4], [5, 6], [7, 8]]",
    answers: ["[1, 2]", "[3, 4]", "[5, 6]", "[7, 8]"],
    correctAnswer: "[3, 4]",
  },
  {
    question: "What is the product of all elements in the following 2D array? [[1, 2], [3, 4], [5, 6]]",
    answers: ["120", "132", "144", "156"],
    correctAnswer: "120",
  },
  {
    question: "How many rows are there in the following 2D array?  [[1, 2, 3], [4, 5, 6], [7, 8, 9]]",
    answers: ["2", "3", "4", "5"],
    correctAnswer: "3",
  },
  {
    question: "What is the sum of the first elements (column 1) in the following 2D array? [[1, 2], [3, 4], [5, 6]]",
    answers: ["6", "9", "12", "15"],
    correctAnswer: "12",
  },
  {
    question: "Which of the following is the first element in the 2nd row of the 2D array? [[1, 2], [3, 4], [5, 6]]",
    answers: ["1", "3", "4", "5"],
    correctAnswer: "3",
  },
  {
    question: "What is the total number of elements in the following 2D array? [[1, 2], [3, 4], [5, 6]]",
    answers: ["6", "8", "9", "12"],
    correctAnswer: "6",
  },
  {
    question: "Which of the following is the third row of the 2D array? [[1, 2], [3, 4], [5, 6]]",
    answers: ["[5, 6]", "[7, 8]", "[9, 10]", "[1, 2]"],
    correctAnswer: "[5, 6]",
  }
];

let previousScores = JSON.parse(localStorage.getItem("scores")) || [];
let timer;
let timeLeft = 30;
let quizFinished = false;

// Wait for the DOM to be ready
document.addEventListener("DOMContentLoaded", () => {
  // Initialize AOS
  AOS.init();

  // Show start quiz button
  document.getElementById("start-quiz-btn").addEventListener("click", startQuiz);
});

// Function to start the quiz
function startQuiz() {
  // Show the spinner and quiz container
  document.getElementById("spinner").style.display = "block";
  document.getElementById("start-quiz-btn-container").style.display = "none";

  setTimeout(() => {
    document.getElementById("spinner").style.display = "none";
    document.getElementById("quiz-container").style.display = "block";

    // Shuffle the questions and answers
    shuffleArray(quizData);
    quizData.forEach(q => shuffleArray(q.answers));

    // Ask for user name using SweetAlert
    askForName();
  }, 2000);
}

// Fisher-Yates shuffle function
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
}

// Add event listener for the restart button
document.getElementById("restart-btn").addEventListener("click", restartQuiz);

// Show previous scores
document.getElementById("show-scores").addEventListener("click", showScores);

// Function to ask for the user's name
function askForName() {
  Swal.fire({
    title: "Enter your name",
    input: "text",
    inputPlaceholder: "Your name",
    showCancelButton: false,
    confirmButtonText: "Start Quiz",
  }).then((result) => {
    if (result.isConfirmed) {
      const enteredName = result.value.trim(); // Trim spaces

      if (enteredName === "") {
        Swal.fire({
          icon: "error",
          title: "Name cannot be blank",
          text: "Please enter a valid name.",
        }).then(() => {
          askForName();
        });
      } else if (!isNaN(enteredName)) {
        Swal.fire({
          icon: "error",
          title: "Name cannot be a number",
          text: "Please enter a valid name. Name cannot be only numeric.",
        }).then(() => {
          askForName();
        });
      } else {
        userName = enteredName;
        Swal.fire({
          icon: "success",
          title: `Welcome, ${userName}!`,
          text: "Good luck with the quiz!",
          confirmButtonText: "Start Quiz",
        }).then(() => {
          displayQuestion();
        });
      }
    }
  });
}

// Display a question
function displayQuestion() {
  if (quizFinished) return; // Prevent new questions if quiz is finished

  const quizContainer = document.getElementById("quiz-questions");
  quizContainer.innerHTML = ""; // Clear any existing content

  const question = quizData[currentQuestionIndex];

  // Create and display question number and question text
  const questionDiv = document.createElement("div");
  questionDiv.classList.add("question");

  // Add question number before the question text
  const questionNumber = document.createElement("h3");
  questionNumber.textContent = `Question ${currentQuestionIndex + 1}: ${question.question}`;
  questionDiv.appendChild(questionNumber);

  // Create and display answers
  question.answers.forEach((answer) => {
    const answerDiv = document.createElement("div");
    answerDiv.classList.add("answer");
    answerDiv.textContent = answer;
    answerDiv.addEventListener("click", () => handleAnswerClick(answer));
    questionDiv.appendChild(answerDiv);
  });

  // Create and display timer
  const timerDiv = document.createElement("div");
  timerDiv.classList.add("timer");
  timerDiv.textContent = `Time Left: ${timeLeft} seconds`;
  questionDiv.appendChild(timerDiv);

  quizContainer.appendChild(questionDiv);

  // Start the timer for the current question
  startTimer(timerDiv);

  // Show the Next button
  document.getElementById("next-btn").style.display = "none"; // Hide Next button initially
  document.getElementById("next-btn").addEventListener("click", moveToNextQuestion);
}

// Start the timer for a question
function startTimer(timerDiv) {
  timeLeft = 30; // Reset time to 30 seconds for each question
  timerDiv.textContent = `Time Left: ${timeLeft} seconds`;

  if (timer) clearInterval(timer); // Clear previous timer if any

  timer = setInterval(() => {
    timeLeft--;
    timerDiv.textContent = `Time Left: ${timeLeft} seconds`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      // Don't move to next question automatically anymore
      // Just highlight the answers
      highlightAnswers(); 
    }
  }, 1000);
}

// Handle answer click
function handleAnswerClick(selectedAnswer) {
  const question = quizData[currentQuestionIndex];
  const questionDiv = document.getElementsByClassName("question")[0];
  const answers = questionDiv.getElementsByClassName("answer");

  // Disable answers when an answer is selected
  Array.from(answers).forEach((answerDiv) => {
    answerDiv.removeEventListener("click", handleAnswerClick);

    // Check if the clicked answer is correct or incorrect
    if (answerDiv.textContent === question.correctAnswer) {
      // Apply green background for the correct answer
      answerDiv.classList.add("correct");
    } else if (answerDiv.textContent === selectedAnswer && selectedAnswer !== question.correctAnswer) {
      // Apply red transparent background for the wrong answer
      answerDiv.classList.add("incorrect");
    }
  });

  // Increment correct answers count if the selected answer is correct
  if (selectedAnswer === question.correctAnswer) {
    correctAnswersCount++;
  }

  // Show the "Next" button after an answer is selected
  document.getElementById("next-btn").style.display = "block";

  // Stop the timer after an answer is selected
  clearInterval(timer);
}

// Highlight the correct and incorrect answers when time is up
function highlightAnswers() {
  const question = quizData[currentQuestionIndex];
  const questionDiv = document.getElementsByClassName("question")[0];
  const answers = questionDiv.getElementsByClassName("answer");

  // Highlight all answers
  Array.from(answers).forEach((answerDiv) => {
    if (answerDiv.textContent === question.correctAnswer) {
      // Correct answer: green background
      answerDiv.classList.add("correct");
    } else {
      // Incorrect answers: red transparent background
      answerDiv.classList.add("incorrect");
    }
  });

  // Show the "Next" button
  document.getElementById("next-btn").style.display = "block";
  // Stop the timer after time is up
  clearInterval(timer);
}


// Save score to localStorage
function saveScore(isCorrect) {
  const score = {
    userName: userName,
    question: quizData[currentQuestionIndex].question,
    isCorrect: isCorrect,
    date: new Date().toLocaleString()
  };
  previousScores.push(score);
  localStorage.setItem("scores", JSON.stringify(previousScores));
}

// Move to the next question
function moveToNextQuestion() {
  if (currentQuestionIndex < quizData.length - 1) {
    currentQuestionIndex++;
    displayQuestion();
  } else {
    quizFinished = true; // Set quizFinished to true when quiz ends
    clearInterval(timer); // Stop the timer once the quiz is completed

    // Calculate the percentage score
    const percentage = (correctAnswersCount / quizData.length) * 100;

    let percentageColor;
    if (percentage < 60) {
      percentageColor = "red"; // Below 60% is red
    } else if (percentage >= 60 && percentage <= 70) {
      percentageColor = "yellow"; // Between 60-70% is yellow
    } else {
      percentageColor = "green"; // 71% and above is green
    }

    // Show the score with percentage text color
    Swal.fire({
      icon: "success",
      title: "Congratulations👑",
      html: `<p>Your got: ${correctAnswersCount} out of ${quizData.length}</p><p><span style="color: ${percentageColor}; font-weight: bold;">Percentage: ${percentage.toFixed(2)}%</span></p>`,
      confirmButtonText: "Close",
    });
  }
}

// Show previous scores using SweetAlert
function showScores() {
  let scoresMessage = "";
  if (previousScores.length > 0) {
    previousScores.forEach(score => {
      scoresMessage += `${score.userName} - ${score.question}: ${score.isCorrect ? "Correct" : "Incorrect"} (${score.date})\n`;
    });
  } else {
    scoresMessage = "No previous scores available.";
  }

  Swal.fire({
    title: "Previous Scores",
    text: scoresMessage,
    confirmButtonText: "Close",
  });
}

// Function to restart the quiz
function restartQuiz() {
  // Show the preloader animation
  document.getElementById("spinner").style.display = "block";
  document.getElementById("quiz-container").style.display = "none";

  // Simulate a delay to show preloader
  setTimeout(() => {
    // Reset quiz state
    currentQuestionIndex = 0;
    correctAnswersCount = 0;
    quizFinished = false;

    // Shuffle the questions and their answers again
    shuffleArray(quizData); // Shuffle questions
    quizData.forEach(q => shuffleArray(q.answers)); // Shuffle answers for each question

    // Hide the spinner and show the quiz container again
    document.getElementById("spinner").style.display = "none";
    document.getElementById("quiz-container").style.display = "block";

    // Start the quiz over
    displayQuestion();
  }, 2000); // Wait for 2 seconds before starting the quiz again
}

// Fisher-Yates shuffle function
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
}