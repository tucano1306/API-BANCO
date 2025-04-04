export function generateAccountNumber(): string {
    // Últimos 8 dígitos del timestamp
    const timestamp = Date.now().toString().slice(-8);
    
    // 6 dígitos aleatorios
    const randomDigits = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Número de cuenta de 14 dígitos
    return timestamp + randomDigits;
  }