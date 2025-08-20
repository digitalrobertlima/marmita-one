/// <reference types="cypress" />

describe('Marmita.One Navegação e Funcionalidades', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.wait(1000)
  })

  it('Navega para montagem personalizada', () => {
    cy.contains('Montar Meu Prato').click()
    cy.url().should('include', '/pages/custom.html')
    cy.contains('Tamanho')
    cy.contains('Proteína')
    cy.contains('Acompanhamentos')
    cy.contains('Adicionar ao carrinho')
  })

  it('Navega para opções prontas', () => {
    cy.contains('Opções Prontas').click()
    cy.url().should('include', '/pages/presets.html')
    cy.contains('Opção 1')
    cy.contains('Opção 2')
    cy.contains('Adicionar ao carrinho')
  })

  it('Monta marmita personalizada e adiciona ao carrinho', () => {
    cy.contains('Montar Meu Prato').click()
    cy.get('#sec-tamanho input').first().check({force:true})
    cy.get('#sec-proteina input').first().check({force:true})
    cy.get('#sec-acc input').first().check({force:true})
    cy.on('window:alert', (str) => {
      expect(str).to.equal('Marmita adicionada ao carrinho!');
    });
    cy.get('#btn-add').click()
    cy.get('#cart-list').should('contain', 'Marmita')
  })

  it('Usa opção pronta e adiciona ao carrinho', () => {
    cy.contains('Opções Prontas').click()
    cy.get('#btn-op1').click()
    cy.on('window:alert', (str) => {
      expect(str).to.equal('Marmita adicionada ao carrinho!');
    });
    cy.get('#btn-add-ios').click()
    cy.get('#cart-list').should('contain', 'Marmita')
  })

  it('Remove item do carrinho', () => {
    cy.contains('Montar Meu Prato').click()
    cy.get('#sec-tamanho input').first().check({force:true})
    cy.get('#sec-proteina input').first().check({force:true})
    cy.get('#btn-add').click()
    cy.get('.btn-danger').contains('Remover').click()
    cy.get('#cart-list').should('not.contain', 'Marmita')
  })

  it('Finaliza pedido', () => {
    cy.contains('Montar Meu Prato').click()
    cy.get('#sec-tamanho input').first().check({force:true})
    cy.get('#sec-proteina input').first().check({force:true})
    cy.get('#btn-add').click()
    cy.get('a').contains('Finalizar pedido').click()
    cy.url().should('include', 'checkout.html')
  })
})
