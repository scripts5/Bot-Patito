export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function percentage(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

/**
 * Avaliador de expressões matemáticas seguro (sem eval).
 * Suporta + - * / % ( ) e números decimais.
 */
export function safeCalculate(expression: string): number {
  const sanitized = expression.replace(/\s+/g, '');
  if (!/^[0-9+\-*/%().]+$/.test(sanitized)) {
    throw new Error('Expressão contém caracteres não permitidos.');
  }

  const tokens = sanitized.match(/(\d+\.?\d*|[+\-*/%()])/g);
  if (!tokens) throw new Error('Expressão inválida.');

  let pos = 0;

  function parseExpression(): number {
    let value = parseTerm();
    while (tokens![pos] === '+' || tokens![pos] === '-') {
      const op = tokens![pos++];
      const rhs = parseTerm();
      value = op === '+' ? value + rhs : value - rhs;
    }
    return value;
  }

  function parseTerm(): number {
    let value = parseFactor();
    while (tokens![pos] === '*' || tokens![pos] === '/' || tokens![pos] === '%') {
      const op = tokens![pos++];
      const rhs = parseFactor();
      if (op === '*') value *= rhs;
      else if (op === '/') {
        if (rhs === 0) throw new Error('Divisão por zero.');
        value /= rhs;
      } else value %= rhs;
    }
    return value;
  }

  function parseFactor(): number {
    if (tokens![pos] === '(') {
      pos++;
      const value = parseExpression();
      if (tokens![pos] !== ')') throw new Error('Parênteses não fechados.');
      pos++;
      return value;
    }
    if (tokens![pos] === '-') {
      pos++;
      return -parseFactor();
    }
    const num = Number(tokens![pos]);
    if (Number.isNaN(num)) throw new Error('Número inválido.');
    pos++;
    return num;
  }

  const result = parseExpression();
  if (pos !== tokens.length) throw new Error('Expressão malformada.');
  return result;
}
