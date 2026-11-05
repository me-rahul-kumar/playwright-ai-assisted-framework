export class Helper {
  static convertPriceToNumber(price: string): number {
    return parseFloat(price.replace(/[^0-9.]/g, ''));
  }

  static getProductDetails() {
    return {
      productName: 'MacBook Air',
      productQuantity: '1',
      productPrice: '$1,202.00',
      totalPrice: '$1,202.00',
    };
  }

  static getLoginDetails() {
    return {
      email: 'pavanol@xyz.com',
      password: 'test@123',
    };
  }
}