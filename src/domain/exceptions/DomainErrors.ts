
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class InsufficientStockError extends DomainError {
  constructor(productId: string) {
    super(`Product with ID ${productId} has insufficient stock.`);
  }
}

export class ProductNotFoundError extends DomainError {
  constructor(productId: string) {
    super(`Product with ID ${productId} not found.`);
  }
}

export class InvalidOperationError extends DomainError {
    constructor(message: string) {
        super(message);
    }
}
