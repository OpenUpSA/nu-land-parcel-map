describe("table view spec", () => {
  it("passes", () => {
    cy.visit("/table-view.html?property=OWNER_TYPE&selected=NONE").contains('Total Rows');
  });
});
