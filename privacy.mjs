export function redactPiiText(value, counts) {
  let text = String(value);
  const replace = (type, pattern, replacement) => {
    text = text.replace(pattern, match => typeof replacement === 'function' ? replacement(match) : (counts[type] = (counts[type] || 0) + 1, replacement));
  };
  replace('secret', /\b(?:sk-[A-Za-z0-9_-]{12,}|tvly-[A-Za-z0-9_-]{12,}|nvapi-[A-Za-z0-9_-]{12,}|AIza[A-Za-z0-9_-]{30,}|AKIA[A-Z0-9]{16}|gh[pousr]_[A-Za-z0-9]{20,})\b/g, '[REDACTED_SECRET]');
  replace('secret', /\bBearer\s+[A-Za-z0-9._~+/-]{12,}=*/gi, match => { counts.secret = (counts.secret || 0) + 1; return `${match.slice(0, match.search(/\s/))} [REDACTED_SECRET]`; });
  replace('secret', /\b(?:api[_ -]?key|access[_ -]?token|secret[_ -]?key)\s*[:=]\s*[^\s,;]{12,}/gi, '[REDACTED_SECRET]');
  replace('email', /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[REDACTED_EMAIL]');
  replace('phone', /\b(?:phone|mobile|telephone|cell(?:ular)?(?:\s+phone)?)\s*[:=]\s*[^\r\n,;]{5,40}/gi, '[REDACTED_PHONE]');
  replace('phone', /(?<!\d)(?:(?:\+|00)\d{1,3}[ .()-]?)?(?:\(?0?7\d\)?[ .-]?\d{3}[ .-]?\d{4}|\d{3}[ .-]\d{3}[ .-]\d{4})(?!\d)/g, '[REDACTED_PHONE]');
  replace('ip_address', /\b(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}\b/g, '[REDACTED_IP]');
  replace('government_id', /\b(?:national\s+id|government\s+id|passport(?:\s+(?:number|no))?|ssn|social\s+security(?:\s+number)?|resident\s+id|subscriber\s+(?:id|number)|customer\s+account\s+(?:id|number)|account\s+number|member\s+id|contract\s+number)\s*[:#=]?\s*[A-Z0-9-]{5,24}\b/gi, '[REDACTED_ID]');
  replace('payment_card', /\b(?:\d[ -]*?){13,19}\b/g, match => {
    const digits = match.replace(/\D/g, '');
    let sum = 0, doubleDigit = false;
    for (let i = digits.length - 1; i >= 0; i--) { let digit = Number(digits[i]); if (doubleDigit && (digit *= 2) > 9) digit -= 9; sum += digit; doubleDigit = !doubleDigit; }
    if (sum % 10 === 0) { counts.payment_card = (counts.payment_card || 0) + 1; return '[REDACTED_CARD]'; }
    return match;
  });
  replace('coordinates', /\b(?:gps\s+)?(?:coordinates?|lat(?:itude)?\s*[,/; ]\s*lon(?:gitude)?)\s*[:=]\s*-?\d{1,3}(?:\.\d+)?\s*[,;/ ]\s*-?\d{1,3}(?:\.\d+)?|\b(?:lat(?:itude)?)\s*[:=]\s*-?\d{1,3}(?:\.\d+)?\s*[,;/ ]\s*(?:lon(?:gitude)?|lng)\s*[:=]?\s*-?\d{1,3}(?:\.\d+)?/gi, '[REDACTED_COORDINATES]');
  replace('location', /\b(?:city|village|town|residential\s+area|home\s+location|district)\s*[:=]\s*[^\r\n,;]{2,100}/gi, '[REDACTED_LOCATION]');
  replace('address', /\b(?:home\s+address|street\s+address|mailing\s+address|postal\s+address|residential\s+address|address|precise\s+location)\s*[:=]\s*[^\r\n;]{5,160}/gi, '[REDACTED_ADDRESS]');
  replace('person_name', /\b(?:full\s+name|person\s+name|contact\s+name|employee\s+name|customer\s+name|first\s+name|last\s+name|reported\s+by|assigned\s+to|requester)\s*[:=]\s*[A-Z][\p{L}'’-]+(?:\s+[A-Z][\p{L}'’-]+){0,3}/giu, '[REDACTED_PERSON]');
  replace('sensitive_health', /\b(?:disability\s+status|medical\s+condition|diagnosis|health\s+status)\s*[:=]\s*[^\r\n;]{2,120}/gi, '[REDACTED_SENSITIVE_DATA]');
  return text;
}

export function redactPiiData(value, counts, key = '') {
  if (typeof value === 'string') {
    if (/^(?:owner|actor|assignee|reporter|requester|username|userName|createdBy|updatedBy|contactName|personName|employeeName|customerName)$/i.test(key) && value.trim()) {
      counts.person_name = (counts.person_name || 0) + 1;
      return '[REDACTED_PERSON]';
    }
    if (/^(?:email|phone|mobile|telephone|nationalId|passport|ssn|accountNumber|subscriberId|memberId|address|streetAddress|homeAddress|city|village|coordinates|latitude|longitude|gps|disabilityStatus|medicalCondition|diagnosis|healthStatus)$/i.test(key) && value.trim()) {
      const type = /email/i.test(key) ? 'email' : /phone|mobile|telephone/i.test(key) ? 'phone' : /address/i.test(key) ? 'address' : /city|village/i.test(key) ? 'location' : /coordinate|latitude|longitude|gps/i.test(key) ? 'coordinates' : /disability|medical|diagnosis|health/i.test(key) ? 'sensitive_health' : 'government_id';
      counts[type] = (counts[type] || 0) + 1;
      return `[REDACTED_${type.toUpperCase()}]`;
    }
    return redactPiiText(value, counts);
  }
  if (Array.isArray(value)) return value.map(item => redactPiiData(item, counts));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([childKey, child]) => [childKey, redactPiiData(child, counts, childKey)]));
  return value;
}
