module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("Pdfs", [
      {
        user_id: 1, // Replace with a valid user_id
        pdf_name: "InterviewPrep.pdf",
        extracted_json: JSON.stringify({
          DocumentTitle: "Interview Prep Document",
          Company: "thoughtworks",
          CompanyDescription: "Strategy. Design. Engineering.",
          OpeningStatement: "Are you a passionate techie with a collaborative problem-solving spirit? We're looking for you!",
          MissionStatement: "Joining our team means becoming part of an organization with a clear purpose, strong values, and an exciting culture. We want you to be well-informed about who we are and what drives us.",
          InterviewJourneyOverview: "Here's a quick overview of your Graduate Developer interview journey:",
          InterviewStage1Title: "HackerRank Test",
          InterviewStage1Time: "(60 minutes):",
          InterviewStage1Description: "This online test features 4 coding challenges in your preferred language. It assesses your coding fluency and logical problem-solving skills.",
          InterviewStage2Title: "Code Pairing",
          InterviewStage2Time: "(75-90 minutes):",
          InterviewStage2Description: "Get ready to collaborate! Discuss and code a solution together with a Thoughtworker who will guide and evaluate you.",
          InterviewStage3Title: "Technical presentation",
          InterviewStage3Time: "(60-75 minutes):",
          InterviewStage3Description: "This one-on-one session delves into your project experience, OOPs knowledge, data structures, and problem-solving abilities.",
          InterviewStage4Title: "Leadership & Cultural Alignment Interview",
          InterviewStage4Time: "(60 minutes):",
          InterviewStage4Description: "This final round is beyond resumes and websites. We want to know your perspective, aspirations, and what motivates you to join our team.",
          InterviewChecklistTitle: "Interview checklist:",
          ChecklistItem1: "Browsers: Keep Mozilla Firefox or Google Chrome updated for optimal Zoom compatibility.",
          HandyReadingMaterialTitle: "Handy reading material",
          ReadingMaterial1Question: "What is Extreme programming?",
          ReadingMaterial1URL: "https://martinfowler.com/bliki/ExtremeProgramming.html"
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Pdfs", null, {});
  }
};
