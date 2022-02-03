const random = () => Math.random() * 1000000000000

const createCustomer = () => {
  return cy.request({
    method: 'POST',
    headers: {
      authorization: 'Bearer ' + Cypress.env('api_token'),
      accept: 'application/json',
    },
    url: '/api/v1/customers',
    body: {
      name: 'Test Customer',
      email: 'test-email@tratta.io'
    }
  }).its('body.data')
}

const createDebtAccount = (customer) => {
  return cy.request({
    method: 'POST',
    headers: {
      authorization: 'Bearer ' + Cypress.env('api_token'),
      accept: 'application/json',
    },
    url: '/api/v1/debt-accounts',
    body: {
      external_id: String(random()),
      customer_id: customer.id,
      location_id: String(random()),
      location_name: 'Test Location ' + String(random()),
      balance: 2000,
      current_balance: 2000
    }
  }).its('body.data')
}

const createCustomerSession = (debtAccount) => {
  return cy.request({
    method: 'POST',
    headers: {
      authorization: 'Bearer ' + Cypress.env('api_token'),
      accept: 'application/json',
    },
    url: '/api/v1/customer-sessions',
    body: {
      customer_id: debtAccount.customer.id
    }
  }).its('body.data')
}

describe('Payment Plan', () => {
  before(() => {
    createCustomer().then(customer => {
      createDebtAccount(customer).then(debtAccount => {
        createCustomerSession(debtAccount).then(session => {
          cy.visit(session.portal_url)
        })
      })
    })
  })
  it('confirms payment plan', async () => {

    cy.contains('button', 'Pay').click()
    cy.contains('button', 'Create a payment plan').click()
    cy.contains('button', 'Weekly').click()
    cy.contains('button', 'Monday').should('exist').click({ force: true })
    cy.get('[data-qa=currency_input]').type('5')

    cy.contains('Next').click()
    


    cy.get('[data-qa=card-holder]').type('Test Holder')
    cy.get('[data-qa="card-number"]').type('4242 4242 4242 4242')
    cy.get('[data-qa="card-expiration"] [type="text"]').type("12 / 22")
    cy.get('[data-qa="card-cvv"] [type="text"]').type('132')
    cy.contains('Confirm Plan').click()
    
    cy.contains('Thank you for enrolling in a payment plan', { timeout: 10000 })
  })
})
