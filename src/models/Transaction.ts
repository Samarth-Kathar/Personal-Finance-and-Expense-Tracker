import { TransactionDTO, TransactionType, PaymentMethod } from '../types';

/**
 * =====================================================================
 * BASE CLASS & ABSTRACTION
 * =====================================================================
 * The Transaction class acts as the foundational model for all financial
 * entries in SmartSpend. It encapsulates common attributes such as id,
 * amount, date, category, source/payee, and payment method.
 */
export class Transaction {
  // Public readonly identifier
  public readonly id: string;
  
  // Encapsulated / protected fields
  protected _type: TransactionType;
  protected _amount: number;
  protected _date: string;
  protected _category: string;
  protected _source: string;
  protected _description: string;
  protected _paymentMethod: PaymentMethod;
  protected _createdAt: string;

  constructor(data: TransactionDTO) {
    this.id = data.id || `txn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this._type = data.type;
    this._amount = Math.max(0, Number(data.amount) || 0);
    this._date = data.date || new Date().toISOString().split('T')[0];
    this._category = data.category.trim();
    this._source = data.source.trim();
    this._description = data.description?.trim() || '';
    this._paymentMethod = data.paymentMethod || 'UPI';
    this._createdAt = data.createdAt || new Date().toISOString();
  }

  // Getters for encapsulated properties
  get type(): TransactionType {
    return this._type;
  }

  get amount(): number {
    return this._amount;
  }

  get date(): string {
    return this._date;
  }

  get category(): string {
    return this._category;
  }

  get source(): string {
    return this._source;
  }

  get description(): string {
    return this._description;
  }

  get paymentMethod(): PaymentMethod {
    return this._paymentMethod;
  }

  get createdAt(): string {
    return this._createdAt;
  }

  /**
   * METHODS & ENCAPSULATION
   * Updates transaction attributes in a controlled manner.
   */
  public editTransaction(data: Partial<Omit<TransactionDTO, 'id' | 'type'>>): void {
    if (data.amount !== undefined) {
      this._amount = Math.max(0, Number(data.amount));
    }
    if (data.date !== undefined) {
      this._date = data.date;
    }
    if (data.category !== undefined) {
      this._category = data.category.trim();
    }
    if (data.source !== undefined) {
      this._source = data.source.trim();
    }
    if (data.description !== undefined) {
      this._description = data.description.trim();
    }
    if (data.paymentMethod !== undefined) {
      this._paymentMethod = data.paymentMethod;
    }
  }

  /**
   * POLYMORPHISM
   * Base implementation of display formatting. Overridden in derived classes.
   */
  public displayTransaction(): string {
    return `[${this._type.toUpperCase()}] ${this._date}: ${this._category} - ₹${this._amount.toLocaleString('en-IN')}`;
  }

  /**
   * Formats transaction amount with sign and currency symbol
   */
  public getFormattedAmount(currencySymbol: string = '₹'): string {
    return `${currencySymbol}${this._amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  /**
   * Converts the object to plain JSON DTO for localStorage serialization.
   */
  public toJSON(): TransactionDTO {
    return {
      id: this.id,
      type: this._type,
      amount: this._amount,
      date: this._date,
      category: this._category,
      source: this._source,
      description: this._description,
      paymentMethod: this._paymentMethod,
      createdAt: this._createdAt,
    };
  }

  /**
   * Factory method to deserialize JSON data into the appropriate subclass.
   */
  public static fromJSON(data: TransactionDTO): Transaction {
    if (data.type === 'income') {
      return new IncomeTransaction(data);
    } else {
      return new ExpenseTransaction(data);
    }
  }
}

/**
 * =====================================================================
 * INHERITANCE & POLYMORPHISM
 * IncomeTransaction inherits from Transaction and specializes behavior
 * for credit/inflow transactions.
 * =====================================================================
 */
export class IncomeTransaction extends Transaction {
  constructor(data: TransactionDTO | (Omit<TransactionDTO, 'type'> & { type?: 'income' })) {
    super({
      ...data,
      type: 'income',
    });
  }

  /**
   * Polymorphic override of displayTransaction()
   */
  public override displayTransaction(): string {
    return `💰 Income from ${this._source} [${this._category}]: +₹${this._amount.toLocaleString('en-IN')}`;
  }

  /**
   * Polymorphic override of getFormattedAmount()
   * Prepends a positive '+' sign
   */
  public override getFormattedAmount(currencySymbol: string = '₹'): string {
    return `+${currencySymbol}${this._amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  /**
   * Special income-specific method
   */
  public getSourceBadge(): string {
    return `Received from ${this._source}`;
  }
}

/**
 * =====================================================================
 * INHERITANCE & POLYMORPHISM
 * ExpenseTransaction inherits from Transaction and specializes behavior
 * for debit/outflow transactions.
 * =====================================================================
 */
export class ExpenseTransaction extends Transaction {
  constructor(data: TransactionDTO | (Omit<TransactionDTO, 'type'> & { type?: 'expense' })) {
    super({
      ...data,
      type: 'expense',
    });
  }

  /**
   * Polymorphic override of displayTransaction()
   */
  public override displayTransaction(): string {
    return `💸 Expense at ${this._source} [${this._category}]: -₹${this._amount.toLocaleString('en-IN')}`;
  }

  /**
   * Polymorphic override of getFormattedAmount()
   * Prepends a negative '-' sign
   */
  public override getFormattedAmount(currencySymbol: string = '₹'): string {
    return `-${currencySymbol}${this._amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  /**
   * Checks if this individual expense is abnormally high compared to a threshold
   */
  public isUnusuallyHigh(averageExpense: number, multiplier: number = 2.0): boolean {
    if (averageExpense <= 0) return false;
    return this._amount > averageExpense * multiplier;
  }

  /**
   * Special expense-specific method
   */
  public getPayeeBadge(): string {
    return `Paid to ${this._source}`;
  }
}
