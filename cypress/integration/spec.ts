it('Loads homepage', () => {
  // Navigate to the home page
  cy.visit('/');

  // Test to see if the name of the application appears on home page
  cy.contains('Grading Assistant');
});

it('Input Assignment Name', () => {
  // Type assignment name
  cy.get('[data-testid="nameInput"]').type('Vaccine Clinic');
});

it('Add Feedback', () => {
  // Type feedback
  cy.get('[data-testid=feedbackInput]').type('Show your work!');

  // Type deduction score
  cy.get('[data-testid=deductionInput]').type('5');

  // Press 'Add Feedback' button for new input line
  cy.get('[data-testid=addFeedbackBtn]').click();
});

it('Delete Feedback', () => {
  // Press delete buttoms from the bottom up
  cy.get('[data-testid="trashBtn"]').spread((first, second) => {
    first.click();
  })
});

it('Add Feedback', () => {
  // Enter new feedback and deduction score in the bottom input box
  cy.get('[data-testid=feedbackInput]').last().type('Add comments!');
  cy.get('[data-testid=deductionInput]').last().type('3');

  // Press 'Add Feedback' button for new input line
  cy.get('[data-testid=addFeedbackBtn]').click();

  // Enter new feedback and deduction in the bottom input box
  cy.get('[data-testid=feedbackInput]').last().type('Code does not compile :(');
  cy.get('[data-testid=deductionInput]').last().type('20');

  // Press 'Add Feedback' button for new input line
  cy.get('[data-testid=addFeedbackBtn]').click();
});

// Resource: https://www.npmjs.com/package/cypress-file-upload
it('Upload Bad CSV file', () => {
  const yourFixturePath = 'Bad.csv';
  cy.get('[data-testid=importCSV]').attachFile(yourFixturePath);
});

// Check for Bad CSV error message
it('Bad File Error Message', () => {
  // Test to see if the name of the application appears on home page
  cy.contains('*Invalid CSV File');
});

it('Upload empty CSV file', () => {
  const yourFixturePath = 'Empty.csv';
  cy.get('[data-testid=importCSV]').attachFile(yourFixturePath);
});

it('Upload CSV file with only white spaces', () => {
  const yourFixturePath = 'WhiteSpaces.csv';
  cy.get('[data-testid=importCSV]').attachFile(yourFixturePath);
});

it('Upload Good CSV file', () => {
  const yourFixturePath = 'Grades.csv';
  cy.get('[data-testid=importCSV]').attachFile(yourFixturePath);
});

it('Parse Next and Previous Student', () => {
  // upload csv file
  const yourFixturePath = 'Grades.csv';
  cy.get('[data-testid=importCSV]').attachFile(yourFixturePath);
  // click next student button
  cy.get('[data-testid=nextStudentBtn]').click()
  cy.get('[data-testid=nextStudentBtn]').click()
  cy.get('[data-testid=nextStudentBtn]').click()
  // click previous student button
  cy.get('[data-testid=prevStudentBtn]').click()
  cy.get('[data-testid=prevStudentBtn]').click()
});

it('Apply Feedback', () => {
  // Add feedback and apply to a particular student
  cy.get('[data-testid=feedbackInput]').last().type('Late 1 day...');
  cy.get('[data-testid=deductionInput]').last().type('10');
  cy.get('[data-testid=applyBtn]').last().check();

  // Apply feedback to next student in list
  cy.get('[data-testid=nextStudentBtn]').click();
  cy.get('[data-testid=applyBtn]').first().check();

  // Remove feedback from previous student in list
  cy.get('[data-testid=prevStudentBtn]').click();
  cy.get('[data-testid=applyBtn]').last().uncheck();
  cy.get('[data-testid=addFeedbackBtn]').click()
  cy.get('[data-testid=feedbackInput]').last().type('Looks good!');
  cy.get('[data-testid=deductionInput]').last().type('0');
  cy.get('[data-testid=applyBtn]').last().check();
});

// Check that max scrore is automatically loaded
it('Max Score Auto Fills', () => {
  // Test to see if the name of the application appears on home page
  cy.contains('100');
});
